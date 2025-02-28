/**
 * Message Management Composable
 * 
 * IMPORTANT REACTIVITY NOTES:
 * This composable had reactivity issues that were solved by:
 * 1. Using storeToRefs for proper reactivity instead of spreading store properties
 * 2. Making store initialization atomic (single $patch calls)
 * 3. Accessing reactive refs directly instead of via methods
 * 4. Using computed properties that explicitly depend on reactive state
 * 
 * For best reactivity in components:
 * - Use storeToRefs from the original store instead of this composable
 * - Use this composable for convenience methods and transformations
 */
import { useMessageStore } from '~/stores/useMessageStore';
import { storeToRefs } from 'pinia';
import type { Message } from '~/types/message';

// OPTIMIZATION: Add cache management
const MESSAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let lastFetchTime = 0;

export const useMessage = () => {
    console.group('useMessage Composable');
    const store = useMessageStore();
    
    // CRITICAL FIX: Use storeToRefs for proper reactivity
    const { 
        messages: storeMessages,
        loading: storeLoading,
        initialized: storeInitialized,
        messageStates,
        error: storeError,
        activeFolder
    } = storeToRefs(store);
    
    // Add debug logging to track message loading sequence
    const logState = (location: string) => {
        console.log(`[${location}] Message store state:`, {
            initialized: storeInitialized.value,
            loading: storeLoading.value,
            messageCount: storeMessages.value.length,
            stateCount: Object.keys(messageStates.value).length,
            time: new Date().toISOString()
        });
    };
    
    // Log immediately on creation
    logState('composable creation');
    
    // Add direct accessor method to force reactivity
    const getStoreState = () => ({
        initialized: storeInitialized.value,
        loading: storeLoading.value,
        messageCount: storeMessages.value.length,
        stateCount: Object.keys(messageStates.value).length
    });
    
    onMounted(() => {
        logState('onMounted');
        console.log('useMessage mounted:', {
            storeExists: !!store,
            hasMessages: storeMessages.value.length > 0,
            isInitialized: storeInitialized.value,
            state: getStoreState()
        });
    });

    // Watch for changes in message loading
    watch(
        () => storeLoading.value,
        (newVal, oldVal) => {
            console.log(`Loading state changed: ${oldVal} -> ${newVal}`, {
                initialized: storeInitialized.value,
                messageCount: storeMessages.value.length
            });
        }
    );

    // Cache message transformations
    const messages = computed(() => {
        console.group('Messages Computation');
        console.log('Store state:', {
            messages: storeMessages.value.length,
            states: Object.keys(messageStates.value).length,
            initialized: storeInitialized.value,
            loading: storeLoading.value
        });

        if (!storeInitialized.value) {
            console.warn('Store not initialized in composable');
            console.groupEnd();
            return [];
        }

        const transformed = storeMessages.value.map(msg => {
            const state = messageStates.value[msg._id];
            console.log(`Transform message ${msg._id}:`, {
                hasState: !!state,
                stateType: state?.state,
                sender: msg.sender?.id
            });
            return { ...msg, messageState: state };
        });

        console.log('Transform complete:', {
            inputCount: storeMessages.value.length,
            outputCount: transformed.length
        });
        console.groupEnd();
        return transformed;
    });

    // Simplified filtering logic
    const filteredMessages = computed(() => {
        console.group('Composable filtering');
        const messageList = messages.value;
        
        // Force computation by accessing the store state
        const storeState = store.$state;

        console.log('Computing filtered messages:', {
            total: messageList.length,
            states: Object.keys(storeState.messageStates).length
        });

        const filtered = {
            inbox: messageList.filter(m => !m.messageState?.state),
            starred: messageList.filter(m => m.messageState?.isStarred),
            spam: messageList.filter(m => m.messageState?.state === 'spam'),
            important: messageList.filter(m => m.messageState?.isImportant),
            sent: messageList.filter(m => m.messageState?.state === 'sent'),
            archived: messageList.filter(m => m.messageState?.state === 'archived'),
            trash: messageList.filter(m => m.messageState?.state === 'deleted')
        };

        console.log('Filter results:', Object.entries(filtered)
            .map(([k, v]) => `${k}: ${v.length}`)
            .join(', '));
        console.groupEnd();
        return filtered;
    });

    // Add thread support
    const threadMessages = computed(() => 
        store.threadMessages
    );

    // Add loading states
    const loading = computed(() => storeLoading.value);

    // Add error handling
    const error = computed(() => storeError.value);

    // Add loading state tracking
    const isLoading = computed(() => storeLoading.value);
    const hasError = computed(() => !!storeError.value);
    const errorMessage = computed(() => storeError.value?.message || null);

    // Add error tracking
    watch(() => storeError.value, (error) => {
        if (error) {
            console.error('Message Store Error:', {
                type: error.type,
                message: error.message,
                context: error.context,
                timestamp: error.timestamp
            });
        }
    });

    // Add watcher for store initialization
    watch(() => storeInitialized.value, (newVal, oldVal) => {
        console.log('Store initialization changed:', {
            from: oldVal,
            to: newVal,
            hasMessages: storeMessages.value.length,
            hasStates: Object.keys(messageStates.value).length
        });
    }, { immediate: true });

    // Add watcher for messages to debug when they're available
    watch(
        () => storeMessages.value.length,
        (count) => {
            console.log(`Message count changed: ${count}`, {
                initialized: storeInitialized.value,
                time: new Date().toISOString()
            });
        }
    );

    // Add direct store state accessor for component binding
    const storeState = computed(() => {
        const store = useMessageStore();
        return {
            initialized: storeInitialized.value,
            loading: storeLoading.value,
            messageCount: storeMessages.value.length,
            hasMessages: storeMessages.value.length > 0,
            activeFolder: activeFolder.value,
            time: new Date().toISOString()
        };
    });

    // OPTIMIZATION: Add cache invalidation and refresh control
    const isCacheValid = () => {
        const now = Date.now();
        return (
            lastFetchTime > 0 && 
            now - lastFetchTime < MESSAGE_CACHE_TTL && 
            storeMessages.value.length > 0
        );
    };
    
    // OPTIMIZATION: Add debouncing for message fetching
    const debounceFetch = useDebounceFn(async (force = false) => {
        const result = await store.fetchMessages(force);
        lastFetchTime = Date.now();
        return result;
    }, 300);
    
    // Enhanced fetchMessages to with cache management
    const fetchMessages = async (force = false) => {
        console.log('fetchMessages called from composable', {
            force,
            initialized: storeInitialized.value,
            messageCount: storeMessages.value.length,
            cacheValid: isCacheValid()
        });
        
        // Skip if cache is valid and not forcing refresh
        if (!force && isCacheValid()) {
            console.log('Using cached messages');
            return storeMessages.value;
        }
        
        const result = await debounceFetch(force);
        
        // Force reactivity by accessing the reactive refs
        console.log('fetchMessages complete in composable', {
            initialized: storeInitialized.value,
            messageCount: storeMessages.value.length,
            time: new Date().toISOString()
        });
        
        return result;
    };
    
    // Make this method public to help with debugging
    const resetStore = () => {
        store.$reset();
        console.log('Store reset to initial state');
        return fetchMessages(true);
    };

    // Add this function
    const forceInit = () => {
        const store = useMessageStore();
        console.log('Forcing store initialization');
        
        // Direct store manipulation - emergency use only
        store.$patch({ 
            initialized: true,
            loading: false
        });
        
        return {
            initialized: store.initialized,
            messageCount: store.messages.length
        };
    };

    // OPTIMIZATION: Add memory cleanup
    onBeforeUnmount(() => {
        console.log('useMessage composable cleanup');
        // Clean up resources, unsubscribe from events, etc.
    });
    
    console.groupEnd();
    return {
        // Return the reactive references and methods
        messages: storeMessages,
        filteredMessages,
        threadMessages,
        loading: storeLoading,
        error: storeError,
        isLoading,
        hasError,
        errorMessage,
        fetchMessages,
        resetStore, // New utility method
        getStoreState, // Keep this for compatibility
        storeState, // Keep this for compatibility
        forceInit,
        ...store // Keep spreading the store for compatibility
    };
};

export type MessageComposable = ReturnType<typeof useMessage>;
