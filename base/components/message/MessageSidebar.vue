<script setup lang="ts">
/**
 * Message Sidebar Component
 * Navigation component for message folders
 * 
 * FOLDER SYSTEM:
 * - Primary folders: Inbox, Sent, Archived, Trash (based on message.state)
 * - Special folders: Starred, Important (based on message flags)
 * - Messages can appear in one primary folder AND any number of special folders
 * 
 * This matches the Gmail-style folder/label system for familiarity.
 */
import { useRouter } from 'vue-router';
import { useMessage } from '~/composables/useMessage';
import { useRoute } from 'vue-router';
import { computed, watchEffect, onMounted, ref, watch } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { useMessageStore } from '~/stores/useMessageStore'; // Add this missing import
import { storeToRefs } from 'pinia'; // Add this missing import

interface MenuItem {
    label: string;
    icon: string;
    badge?: number;
    routerLink?: RouteLocationRaw;
    active?: boolean;
}

// Composables
const router = useRouter();
const messageStore = useMessageStore(); // Direct store access for better reactivity
const { filteredMessages } = storeToRefs(messageStore); // Extract reactive reference
const store = useMessage(); // Keep for compatibility
const route = useRoute();

// Navigation handler
const navigate = (item: MenuItem) => {
    if (!item.routerLink) {
        emit('compose');
        return;
    }
    router.push(item.routerLink);
};

// Force message load on component mount
onMounted(async () => {
    if (!messageStore.initialized) {
        console.log('MessageSidebar: Loading messages on mount');
        await messageStore.fetchMessages(true);
    }
});

// Enhance debug state to track special folders specifically
const debugState = ref({
  lastUpdate: Date.now(),
  updateCount: 0,
  folderCounts: {} as Record<string, number>,
  specialFolderHistory: {
    starred: [] as number[],
    important: [] as number[]
  }
});

// Improved folder count calculation with direct message state access
const folderCounts = computed(() => {
  // Get filtered messages from store
  const filteredMsgs = filteredMessages.value;
  if (!filteredMsgs) return {};
  
  // Get direct message states access for special folders
  const states = messageStore.messageStates;
  
  // Count messages with isStarred/isImportant flags directly
  const starredCount = Object.values(states).filter(s => s.isStarred).length;
  const importantCount = Object.values(states).filter(s => s.isImportant).length;
  
  // Track history for debugging
  debugState.value.specialFolderHistory.starred.push(starredCount);
  debugState.value.specialFolderHistory.starred = 
    debugState.value.specialFolderHistory.starred.slice(-5);
    
  debugState.value.specialFolderHistory.important.push(importantCount);
  debugState.value.specialFolderHistory.important = 
    debugState.value.specialFolderHistory.important.slice(-5);
  
  // Calculate counts with special folder handling
  return {
    inbox: filteredMsgs.inbox?.length || 0,
    starred: starredCount,
    important: importantCount,
    sent: filteredMsgs.sent?.length || 0,
    archived: filteredMsgs.archived?.length || 0,
    trash: filteredMsgs.trash?.length || 0
  };
});

// FIX: Generate items with stable counts
const sidebarItems = computed<MenuItem[]>(() => {
  const counts = folderCounts.value;
  
  // Define all available folders
  const folders = [
      { label: 'Inbox', icon: 'pi pi-inbox', key: 'inbox' },
      { label: 'Starred', icon: 'pi pi-star', key: 'starred' },
      { label: 'Important', icon: 'pi pi-bookmark', key: 'important' },
      { label: 'Sent', icon: 'pi pi-send', key: 'sent' },
      { label: 'Archived', icon: 'pi pi-file', key: 'archived' },
      { label: 'Trash', icon: 'pi pi-trash', key: 'trash' }
  ];
  
  // Map folders to navigation items with badge counts
  return folders.map(({ label, icon, key }) => {
    const count = counts[key] || 0;
    
    return {
      label,
      icon,
      badge: count,
      routerLink: `/new/message/${key}`,
      active: route.params.folder === key
    };
  });
});

// FIX: Separate watcher to update debug state when computed outputs change
// This avoids the recursive update issue
watch([sidebarItems, filteredMessages], () => {
    const now = Date.now();
    const timeSinceLastUpdate = now - debugState.value.lastUpdate;
    debugState.value.updateCount++;
    debugState.value.lastUpdate = now;
    
    // Calculate counts from sidebarItems to avoid duplicating logic
    const newCounts = {} as Record<string, number>;
    sidebarItems.value.forEach(item => {
        const folderKey = item.label.toLowerCase();
        newCounts[folderKey] = item.badge || 0;
    });
    
    console.group('[DEBUG-SIDEBAR] Sidebar update');
    console.log('Sidebar update triggered:', {
        timeSinceLastUpdate: `${timeSinceLastUpdate}ms`,
        initialized: messageStore.initialized,
        hasFilteredMessages: !!filteredMessages.value,
        timestamp: new Date().toISOString()
    });
    
    // Compare with previous counts
    console.log('Folder count changes:', {
        previous: debugState.value.folderCounts,
        current: newCounts,
        differences: Object.keys(newCounts).map(key => ({
            folder: key,
            before: debugState.value.folderCounts[key] || 0,
            after: newCounts[key],
            changed: (debugState.value.folderCounts[key] || 0) !== newCounts[key]
        }))
    });
    
    // Update counts after logging the differences
    debugState.value.folderCounts = { ...newCounts };
    console.groupEnd();
}, { deep: true });

// Add watcher to track message state changes
watch(() => messageStore.messageStates, (newStates, oldStates) => {
    console.log('[DEBUG-SIDEBAR] Message states changed:', {
        newCount: Object.keys(newStates).length,
        oldCount: oldStates ? Object.keys(oldStates).length : 0,
        changed: JSON.stringify(newStates) !== JSON.stringify(oldStates),
        timestamp: new Date().toISOString()
    });
}, { deep: true });

// Add watcher for filtered messages
watch(() => filteredMessages.value, (newFiltered, oldFiltered) => {
    if (!oldFiltered) return; // Skip initial undefined
    
    console.log('[DEBUG-SIDEBAR] Filtered messages changed:', {
        inbox: {
            before: oldFiltered.inbox?.length || 0,
            after: newFiltered.inbox?.length || 0
        },
        starred: {
            before: oldFiltered.starred?.length || 0,
            after: newFiltered.starred?.length || 0
        },
        important: {
            before: oldFiltered.important?.length || 0,
            after: newFiltered.important?.length || 0
        },
        trash: {
            before: oldFiltered.trash?.length || 0,
            after: newFiltered.trash?.length || 0
        },
        archived: {
            before: oldFiltered.archived?.length || 0,
            after: newFiltered.archived?.length || 0
        },
        timestamp: new Date().toISOString()
    });
}, { deep: true });

// Add special watch for message states to track flag changes
watch(() => Object.values(messageStore.messageStates), (newStates) => {
  // Calculate flag counts for real-time tracking
  const starredCount = newStates.filter(s => s.isStarred).length;
  const importantCount = newStates.filter(s => s.isImportant).length;
  
  console.log('[DEBUG-FLAGS] Flag count changes:', {
    starred: starredCount,
    important: importantCount,
    history: {
      starred: debugState.value.specialFolderHistory.starred,
      important: debugState.value.specialFolderHistory.important
    },
    timestamp: new Date().toISOString()
  });
}, { deep: true });

// Watch for folder changes
watchEffect(() => {
    if (route.params.folder) {
        store.activeFolder = route.params.folder as string;
    }
});

// Emits
const emit = defineEmits<{
    compose: [];
}>();
</script>

<template>
    <div class="message-sidebar">
        <Button @click="emit('compose')" label="Compose New" class="compose-btn" outlined></Button>
        
        <!-- Add debug panel -->
        <div class="debug-panel" style="margin-bottom: 1rem; font-size: 11px; color: #666;">
            <details>
                <summary style="cursor: pointer;">Debug Info</summary>
                <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 5px;">
                    <p>Updates: {{ debugState.updateCount }}</p>
                    <p>Last: {{ new Date(debugState.lastUpdate).toTimeString().split(' ')[0] }}</p>
                    <div v-for="(count, folder) in debugState.folderCounts" :key="folder">
                        {{ folder }}: {{ count }}
                    </div>
                </div>
            </details>
        </div>
        
        <div class="sidebar-content">
            <ul class="nav-list">
                <li v-for="item in sidebarItems" 
                    :key="item.label"
                    class="nav-item" 
                    :class="{ active: item.active }"
                    @click="navigate(item)">
                    <i :class="[item.icon, 'nav-icon', { active: item.active }]"></i>
                    <span class="nav-label" :class="{ active: item.active }">
                        {{ item.label }}
                    </span>
                    <span v-if="item.badge" class="nav-badge">
                        {{ item.badge }}
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

// Key template variables to verify:
- items[] (MenuItem[])
  - item.icon (string)
  - item.label (string)
  - item.routerLink (string)
  - item.badge (number)

<style lang="scss">
.message-sidebar {
    width: 100%;
    .compose-btn {
        margin-bottom: 1rem;
        width: 100%;
    }

    .sidebar-content {
        overflow: auto;
    }

    .nav-list {
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        list-style: none;
        margin: 0;
        padding: 0;
        overflow: auto;

        @container main (min-width: #{$message-container-lg}) {
            flex-direction: column;
        }
    }

    .nav-item {
        cursor: pointer;
        user-select: none;
        padding: 1rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: auto;
        transition: background-color 150ms ease;

        @container main (min-width: #{$message-container-lg}) {
            justify-content: flex-start;
            flex: 1;
        }

        &:hover:not(.active) {
            background-color: var(--surface-hover);
        }

        &.active {
            background-color: var(--primary-color);
        }
    }

    .nav-icon {
        color: var(--surface-600);
        font-size: 1.125rem;
        transition: color 150ms ease;

        @container main (min-width: #{$message-container-lg}) {
            margin-right: 1rem;
        }

        &.active {
            color: var(--primary-50);
        }
    }

    .nav-label {
        color: var(--surface-900);
        font-weight: 500;
        display: none;

        @container main (min-width: #{$message-container-lg}) {
            display: inline;
        }

        &.active {
            color: var(--primary-50);
        }
    }

    .nav-badge {
        margin-left: auto;
        font-size: 0.875rem;
        font-weight: 600;
        background-color: var(--primary-50);
        color: var(--primary-900);
        padding: 0.25rem 0.5rem;
        border-radius: 2rem;
        width: 23px;
        height: 23px;
        text-align: center;
        display: none;

        @container main (min-width: #{$message-container-lg}) {
            display: inline;
        }
    }
}
</style>
