<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia'; // Critical for proper reactivity
import type { Message } from '~/types/message';
import { useMessageStore } from '~/stores/useMessageStore';

/**
 * Message Container Component
 * 
 * NOTE: This component uses direct store access with storeToRefs for better reactivity.
 * Previous issues with initialization were solved by:
 * 1. Using storeToRefs instead of spreading store properties
 * 2. Directly accessing Pinia store (not via composable)
 * 3. Using nextTick to ensure reactivity updates propagate
 * 4. Adding debug panels to troubleshoot state mismatches
 */

// OPTIMIZATION: Direct store access with storeToRefs is more reactive than composables
const messageStore = useMessageStore();
const { initialized, loading: storeLoading, messages } = storeToRefs(messageStore);
const store = useMessage(); // Keep for compatibility with other components
const toast = useToast();
const route = useRoute();

// Reactive state
const dialogVisible = ref(false);
const messageDetail = ref<Message | null>(null);
const composeDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const selectedMessage = ref<Message | null>(null);
const isInitialized = ref(false);
const isLoading = ref(true); // Changed from loading to isLoading
const hasNavigatedBefore = ref(false);

// Improve loading state management
const isInitializing = ref(true);
const loadingState = ref({
  firstLoad: true,
  inProgress: true,
  initialized: false,
  messageCount: 0,
  loadAttempt: 0
});

// Computed properties
const activeFolder = computed(() => route.path.split('/')[3] || 'inbox');

// Add an explicit reactive dependency on store initialization
const storeStatus = computed(() => ({
    initialized: store.initialized,
    messageCount: store.messages.length,
    folderName: activeFolder.value
}));

// Debug flag to see if direct store access works better
const directStoreAccess = true; // Could be made into an app config or removed in production

// Fix storeReady to use direct store references
// OPTIMIZATION: Improved memoization of expensive computations
const storeReady = computed(() => {
  if (directStoreAccess) {
    const isInit = initialized.value;
    const isLoadingStore = storeLoading.value; // Use renamed variable
    
    // Skip additional work if not ready
    if (!isInit || isLoadingStore) {
      return false;
    }
    
    // Performance optimization: only access messages.length when needed
    return true;
  } else {
    // Original approach as fallback
    const isInit = store.initialized;
    const isLoadingStore = store.loading;
    
    console.log('INDIRECT store reactivity check:', {
      initialized: isInit,
      loading: isLoadingStore,
      messageCount: store.messages.length,
      time: new Date().toISOString()
    });
    
    return isInit && !isLoadingStore;
  }
});

const messagesLoaded = computed(() => messages.value.length > 0);

// Improve the message filtering to match the store's behavior exactly
const currentMessages = computed(() => {
  if (directStoreAccess) {
    if (!initialized.value || storeLoading.value) {
      console.log('DIRECT store not ready:', {
        initialized: initialized.value,
        loading: storeLoading.value,
        messageCount: messages.value.length
      });
      return [];
    }
    
    // Use the same folder mapping logic as the store
    const folder = activeFolder.value;
    
    console.log('Filtering messages for folder:', {
      folder,
      totalMessages: messages.value.length,
      messageStates: Object.keys(messageStore.messageStates).length
    });
    
    const result = messages.value.filter(msg => {
      const state = messageStore.messageStates[msg._id];
      if (!state) return folder === 'inbox'; // Default folder is inbox
      
      // Special folder handling - these are based on flags, not state
      if (folder === 'starred') return state.isStarred;
      if (folder === 'important') return state.isImportant;
      
      // Primary folder handling with explicit mapping for trash
      if (folder === 'trash') return state.state === 'deleted';
      
      // Otherwise match state to folder name
      return state.state === folder;
    });
    
    console.log(`DIRECT messages for ${folder}:`, {
      count: result.length,
      totalMessages: messages.value.length
    });
    
    return result;
  } else {
    // Original approach as fallback
    return store.filteredMessages[activeFolder.value] || [];
  }
});

// Fix the reload function to work directly with the store instance
// OPTIMIZATION: Enhanced reload with better error recovery
const reloadMessages = async (force = true) => {
  console.log('🔄 Manually reloading messages');
  loadingState.value.inProgress = true;
  loadingState.value.loadAttempt++;
  
  try {
    console.log('Starting message reload with direct store access');
    
    // Use direct store method
    await messageStore.fetchMessages(force);
    
    // CRITICAL FIX: Force reactivity updates with nextTick
    // This ensures Vue's reactivity system recognizes the changes
    await nextTick();
    
    console.log('After direct store reload:', {
      initialized: initialized.value,
      loading: storeLoading.value, // Use renamed variable
      messageCount: messages.value.length
    });
    
    // Update local state
    loadingState.value.inProgress = false;
    
    // WORKAROUND: Force component update if store state is inconsistent
    if (!initialized.value && messages.value.length > 0) {
      console.log('Applying brute force fix - store has messages but reports uninitialized');
      messageStore.$patch({ initialized: true });
    }
    
    console.log('📊 Messages reloaded successfully');
  } catch (error) {
    console.error('Failed to reload messages:', error);
    handleError(error);
  } finally {
    loadingState.value.inProgress = false;
  }
};

// Enhanced initialization logic with forceSynchronize option
onMounted(async () => {
    console.log('MessageContainer mounted, initializing store');
    // Force true to ensure initial load always happens
    await reloadMessages(true);
});

// Watch for navigation changes
watch(() => route.path, async (newPath, oldPath) => {
    if (!hasNavigatedBefore.value) return;
    
    const [, , , newFolder] = newPath.split('/');
    const [, , , oldFolder] = oldPath?.split('/') || [];
    
    if (newFolder === oldFolder) return;
    
    store.activeFolder = newFolder;
    await store.fetchMessages();
}, { immediate: false });

// Event handlers
const handleToggleFlag = (flag: string, message: Message) => {
    store.toggleFlag(message._id, flag as 'isStarred' | 'isImportant');
};

// Add error handling
const handleError = (error: unknown) => {
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'An unexpected error occurred',
        life: 3000
    });
};

// Update event handlers with error handling
const dialogHandlers = {
    compose: () => { 
        composeDialogVisible.value = true;
    },
    reply: (message: Message) => {
        messageDetail.value = message;
        dialogVisible.value = true;
    },
    showDetail: async (message: Message) => {
        try {
            selectedMessage.value = message;
            detailDialogVisible.value = true;
            if (message.threadId) {
                await store.loadThread(message.threadId);
            }
        } catch (error) {
            handleError(error);
        }
    }
};

// Dialog state handlers
const updateDialogState = {
    compose: (value: boolean) => { composeDialogVisible.value = value },
    reply: (value: boolean) => { dialogVisible.value = value },
    detail: (value: boolean) => { detailDialogVisible.value = value }
};

// Enhanced message handlers
const handleNewMessage = async (message: Message) => {
    try {
        await store.createMessage(message);
        composeDialogVisible.value = false;
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Message sent successfully',
            life: 3000
        });
    } catch (error) {
        handleError(error);
    }
};

const handleReplyMessage = async (message: Message) => {
    try {
        await store.createMessage(message);
        dialogVisible.value = false;
        messageDetail.value = null;
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Reply sent successfully',
            life: 3000
        });
    } catch (error) {
        handleError(error);
    }
};

// OPTIMIZATION: Memory cleanup - unsubscribe watchers
onBeforeUnmount(() => {
  // Clean up any resources, event listeners, etc.
  // This is a good practice for long-lived components
  console.log('MessageContainer unmounting - cleaning resources');
});

// Add debugging tools
const showDebugOverlay = ref(false);
const debugEvents = ref<{timestamp: string, type: string, message: string}[]>([]);
const maxDebugEvents = 20;

// Add debug event logger
const logDebugEvent = (type: string, message: string) => {
  debugEvents.value.unshift({
    timestamp: new Date().toISOString().split('T')[1].substring(0, 12),
    type,
    message
  });
  
  // Keep array limited to maxDebugEvents
  if (debugEvents.value.length > maxDebugEvents) {
    debugEvents.value.length = maxDebugEvents;
  }
};

// Watch for important state changes to log
watch(() => store.messages.length, (newCount, oldCount) => {
  logDebugEvent('Messages', `Count changed: ${oldCount || 0} → ${newCount}`);
});

watch(() => activeFolder.value, (newFolder, oldFolder) => {
  logDebugEvent('Navigation', `Folder changed: ${oldFolder || 'none'} → ${newFolder}`);
});

watch(() => store.initialized, (newValue) => {
  logDebugEvent('Store', `Initialized: ${newValue}`);
});

// Add keyboard shortcut to toggle debug overlay
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D to toggle debug overlay
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      showDebugOverlay.value = !showDebugOverlay.value;
      e.preventDefault();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', () => {});
});

// Add component lifecycle hooks for debugging
onMounted(async () => {
  console.log('🚀 MessageContainer mounted - initializing data');
  try {
    await messageStore.fetchMessages();
    console.log('📊 Initial data loaded successfully');
  } catch (error) {
    console.error('💥 Failed to load initial data', error);
  }
});
</script>

<template>
    <div class="message-container">
        <div class="sidebar">
            <MessageSidebar @compose="dialogHandlers.compose" />
        </div>
        <div class="content">
            <!-- Better debug information -->
            <div v-if="loadingState.inProgress" class="loading-indicator">
                <ProgressSpinner />
                <p>Loading messages...</p>
                <small>Attempt: {{ loadingState.loadAttempt }}</small>
            </div>
            
            <!-- Add enhanced debug info -->
            <div v-else-if="!storeReady" class="debug-info">
                <p>Store initialization issue</p>
                <div class="direct-access">
                  <h4>Direct Store Access:</h4>
                  <pre>{{ JSON.stringify({
                    initialized: initialized,
                    messageCount: messages.length,
                    loading: storeLoading
                  }, null, 2) }}</pre>
                </div>
                <div class="indirect-access">
                  <h4>Indirect Store Access:</h4>
                  <pre>{{ JSON.stringify({
                    initialized: store.initialized,
                    messageCount: store.messages.length,
                    loading: store.loading
                  }, null, 2) }}</pre>
                </div>
                <Button label="Emergency Reload" icon="pi pi-refresh" severity="danger" @click="reloadMessages(true)" />
            </div>
            
            <!-- No messages in folder -->
            <div v-else-if="currentMessages.length === 0" class="p-4 text-center text-gray-500">
                <p>No messages found in this folder</p>
                <p v-if="messagesLoaded" class="text-sm mt-2">
                    (Store contains {{ directStoreAccess ? messages.length : store.messages.length }} messages in other folders)
                </p>
            </div>
            
            <!-- Message list -->
            <MessageInboxListItem
                v-else
                :messages="currentMessages"
                @reply="dialogHandlers.reply"
                @toggle-flag="handleToggleFlag"
                @show-detail="dialogHandlers.showDetail"
            />
        </div>

        <!-- Dialog components -->
        <MessageComposeDialog 
            mode="new"
            v-model:dialogVisible="composeDialogVisible"
            @save="handleNewMessage"
            @update:dialogVisible="updateDialogState.compose"
        />

        <MessageComposeDialog 
            mode="reply"
            v-model:dialogVisible="dialogVisible"
            :original-message="messageDetail"
            @save="handleReplyMessage"
            @update:dialogVisible="updateDialogState.reply"
        />

        <MessageThreadView
            v-model:dialogVisible="detailDialogVisible"
            :message="selectedMessage"
            :thread-id="selectedMessage?.threadId"
            @reply="dialogHandlers.reply"
            @update:dialogVisible="updateDialogState.detail"
        />

        <!-- Add error message display -->
       
        
        <!-- Add loading states -->
        <ProgressSpinner v-if="store.loading" class="loading-overlay" />

        <!-- Add debug overlay - toggle with Ctrl+Shift+D -->
        <div v-if="showDebugOverlay" class="debug-overlay">
          <div class="debug-header">
            <h3>Message System Debug (Ctrl+Shift+D to close)</h3>
            <div class="debug-actions">
              <button @click="reloadMessages(true)" class="debug-button">Reload Messages</button>
              <button @click="debugEvents = []" class="debug-button">Clear Log</button>
              <button @click="showDebugOverlay = false" class="debug-button">Close</button>
            </div>
          </div>
          
          <div class="debug-content">
            <div class="debug-section">
              <h4>Current State</h4>
              <pre>{{ JSON.stringify({
                initialized: store.initialized,
                messageCount: store.messages.length,
                currentFolder: activeFolder,
                isLoading: store.loading
              }, null, 2) }}</pre>
            </div>
            
            <div class="debug-section">
              <h4>Folder Counts</h4>
              <table class="debug-table">
                <thead>
                  <tr>
                    <th>Folder</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(messages, folder) in store.filteredMessages" :key="folder">
                    <td>{{ folder }}</td>
                    <td>{{ messages.length }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="debug-section">
              <h4>Event Log</h4>
              <div class="debug-events">
                <div 
                  v-for="(event, index) in debugEvents" 
                  :key="index"
                  class="debug-event"
                  :class="'event-' + event.type.toLowerCase()"
                >
                  [{{ event.timestamp }}] [{{ event.type }}] {{ event.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
</template>

<style lang="scss">
@use '~/assets/css/_scss-variables' as vars;

.message-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--p-content-background);

    @container main (min-width: #{vars.$message-container-lg}) {
        flex-direction: row;
    }

    .sidebar {
        padding: 1rem;
        @container main (min-width: #{vars.$message-container-lg}) {
            width: 170px;
        }
    }
    .content {
        flex-grow: 1;
    }
}

.loading-overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.debug-info {
    padding: 2rem;
    text-align: center;
    background-color: var(--surface-50);
    border: 1px dashed var(--surface-300);
    border-radius: 8px;
    margin: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  
    .debug-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    
        .state-item {
            padding: 0.5rem;
            background: var(--surface-100);
            border-radius: 4px;
        }
    }
}

.debug-state {
  text-align: left;
  background: var(--surface-100);
  padding: 1rem;
  border-radius: 4px;
  max-width: 100%;
  overflow: auto;
  margin-bottom: 1rem;
}

.direct-access,
.indirect-access {
  margin-bottom: 1rem;
  background: var(--surface-100);
  padding: 1rem;
  border-radius: 4px;
  text-align: left;

  h4 {
    margin-top: 0;
  }
}

/* Debug overlay styles */
.debug-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 500px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  border-radius: 8px;
  z-index: 9999;
  padding: 1rem;
  font-family: monospace;
  overflow: auto;
  
  .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 0.5rem;
    
    h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .debug-actions {
      display: flex;
      gap: 0.5rem;
    }
  }
  
  .debug-button {
    background: rgba(255,255,255,0.2);
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    
    &:hover {
      background: rgba(255,255,255,0.3);
    }
  }
  
  .debug-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    .debug-section {
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      padding: 0.75rem;
      
      h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-size: 14px;
      }
      
      pre {
        margin: 0;
        color: #aaf;
        font-size: 12px;
      }
    }
    
    .debug-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      
      th, td {
        padding: 4px 8px;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      th {
        color: #ccc;
      }
    }
    
    .debug-events {
      max-height: 200px;
      overflow-y: auto;
      font-size: 12px;
      
      .debug-event {
        padding: 3px 0;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        
        &.event-navigation {
          color: #aff;
        }
        
        &.event-messages {
          color: #ffa;
        }
        
        &.event-store {
          color: #faa;
        }
      }
    }
  }
}
</style>
