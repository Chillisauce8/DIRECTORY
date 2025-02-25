/**
 * Message Store
 * 
 * Central state management for messages with optimized reactivity handling.
 * 
 * IMPORTANT: This store had reactivity issues that were resolved by:
 * - Using atomic state updates (single $patch calls)
 * - Making initialization flags part of atomic updates
 * - Using storeToRefs in components for proper reactivity
 * - Avoiding mixing direct store access and composable access
 * 
 * State Management:
 * - messages: Raw message data
 * - messageStates: Message flags and states
 * - loading: Async operation state
 * - initialized: Store ready state
 */

import { defineStore } from 'pinia';
import type { Message } from '~/types/message';
import type { UserMessageState } from '~/types/collections/userMessageStates';
import { useMessagingService } from '~/service/messaging/messaging.service';

const TEST_USER_ID = "67b5e10353db2d84eb483539";

interface MessageStoreState {
  messages: Message[];
  messageStates: Record<string, UserMessageState>;
  loading: boolean;
  error: {
    type: 'network' | 'validation' | 'permission' | 'unknown';
    message: string;
    timestamp: string;
    context?: string;
  } | null;
  activeFolder: UserMessageState['state'];
  initialized: boolean;
  threadMessages: Record<string, Message[]>;  // Add thread support
}

// Helper functions at module level for better organization
const createEmptyState = (msg: Message): UserMessageState => ({
  messageId: msg._id,
  userId: TEST_USER_ID,
  state: msg.sender?.id === TEST_USER_ID ? 'sent' : 'inbox',
  isStarred: false,
  isImportant: false,
  _type: 'userMessageStates'
});

const createEmptyFolders = () => ({
  inbox: [] as Message[],
  starred: [] as Message[],
  important: [] as Message[],
  sent: [] as Message[],
  archived: [] as Message[],
  trash: [] as Message[]
});

export const useMessageStore = defineStore('messages', {
  state: (): MessageStoreState => ({
    messages: [],
    messageStates: {},
    loading: false,
    error: null,
    activeFolder: 'inbox',
    initialized: false,
    threadMessages: {},
  }),

  getters: {
    /**
     * Filters messages into folders based on their state and flags
     * 
     * FOLDER LOGIC:
     * - Primary folders (inbox, sent, archived, trash) are based on message.state
     * - Special folders (starred, important) are based on boolean flags
     * - Messages can appear in BOTH a primary folder and special folders
     */
    filteredMessages(): Record<string, Message[]> {
      if (!this.initialized) {
        console.log('[DEBUG-FILTER] Store not initialized, returning empty folders');
        return createEmptyFolders();
      }

      // Debug info for filtering process
      console.group('[DEBUG-FILTER] Filtering messages');
      console.log('Starting message filtering:', {
        totalMessages: this.messages.length,
        totalStates: Object.keys(this.messageStates).length,
        timestamp: new Date().toISOString()
      });

      const result = this.messages.reduce((folders, msg) => {
        const state = this.messageStates[msg._id] ?? createEmptyState(msg);
        const msgWithState = { ...msg, messageState: state };
        
        // Debug individual message state
        console.log(`Message ${msg._id.substring(0, 8)}...`, {
          state: state.state || 'inbox',
          isStarred: state.isStarred,
          isImportant: state.isImportant
        });
        
        // Add to special folders based on flags
        if (state.isStarred) {
          folders.starred.push(msgWithState);
        }
        
        if (state.isImportant) {
          folders.important.push(msgWithState);
        }

        // Add to primary folder based on state
        const primaryFolder = state.state || 'inbox';
        
        // Map state values to folder names
        switch(primaryFolder) {
          case 'deleted':
            folders.trash.push(msgWithState);
            break;
          case 'archive':  // Add this case to fix the "archive" vs "archived" mismatch
            folders.archived.push(msgWithState);
            break;
          default:
            // For inbox, sent, archived - use the state name directly
            folders[primaryFolder]?.push(msgWithState);
        }

        return folders;
      }, createEmptyFolders());

      // Log results
      console.log('Filtering complete:', {
        inbox: result.inbox.length,
        starred: result.starred.length,
        important: result.important.length,
        sent: result.sent.length,
        archived: result.archived.length,
        trash: result.trash.length
      });
      
      console.groupEnd();
      return result;
    }
  },

  actions: {
    // Internal actions (prefix with underscore instead of using private)
    _updateStore(messages: Message[]) {
      console.log('Updating store with messages:', {
        count: messages.length,
        currentMessagesCount: this.messages.length,
        wasInitialized: this.initialized,
        timestamp: new Date().toISOString()
      });

      this.$patch((state) => {
        state.messages = messages;
        // Initialize message states from existing states
        const messageStates = Object.fromEntries(
          messages.map(msg => {
            const existingState = state.messageStates[msg._id];
            return [msg._id, existingState || createEmptyState(msg)];
          })
        );
        state.messageStates = messageStates;
        state.loading = false;
        state.initialized = true;
        state.error = null;
      });

      // Force reactivity by directly accessing the properties after update
      console.log('Store updated confirmation:', {
        messagesCount: this.messages.length,
        statesCount: Object.keys(this.messageStates).length,
        isInitialized: this.initialized,
        timestamp: new Date().toISOString()
      });
    },

    _handleError(error: unknown, context: string) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.$patch((state) => {
        state.error = {
          type: 'unknown',
          message: errorMessage,
          timestamp: new Date().toISOString(),
          context
        };
      });
      console.error(`Message Store Error [${context}]:`, error);
    },

    // Public actions
    /**
     * Fetches messages from the API with improved reactivity handling
     * 
     * Key reactivity fixes:
     * 1. Uses a single atomic $patch for state updates
     * 2. Sets loading and initialized flags together
     * 3. Performs explicit reactivity checks after updates
     * 4. Handles both force refresh and caching
     * 
     * @param force - Whether to force refresh even if data exists
     * @returns Array of messages
     */
    async fetchMessages(force = false) {
      console.log('📩 Fetching messages from API', {
        alreadyLoading: this.loading,
        initialized: this.initialized,
        currentMessages: this.messages.length,
        force,
        timestamp: new Date().toISOString()
      });
      
      if (!force && this.initialized && this.messages.length > 0) {
        console.log('Using cached messages');
        return this.messages;
      }
      
      this.loading = true;
      
      try {
        const messages = await useMessagingService().getUserMessages(TEST_USER_ID);
        console.log('📥 Messages received from API:', messages?.length || 0);
        
        this._updateStore(messages);
        return messages;
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
        this._handleError(error, 'fetchMessages');
        return [];
      } finally {
        this.loading = false;
      }
    },

    async toggleFlag(messageId: string, flag: 'isStarred' | 'isImportant') {
      const currentState = this.messageStates[messageId] ?? createEmptyState(
        this.messages.find(m => m._id === messageId)!
      );
      const debugId = `flag-${Date.now()}`;
      
      try {
        console.group(`[DEBUG-${debugId}] Message Flag Toggle`);
        console.log('Starting flag toggle operation:', {
          messageId,
          flag,
          currentState
        });

        // Calculate new flag value - invert current value
        const newFlagValue = !(currentState[flag] ?? false);
        console.log(`🚩 Toggling ${flag} from ${currentState[flag]} to ${newFlagValue}`);

        // Create state update - IMPORTANT: preserve other properties
        const updates = {
          messageId,
          userId: TEST_USER_ID,
          _type: 'userMessageStates',
          [flag]: newFlagValue,
          // Critical: preserve current state and other flags
          state: currentState.state || 'inbox',
          isStarred: flag === 'isStarred' ? newFlagValue : (currentState.isStarred || false),
          isImportant: flag === 'isImportant' ? newFlagValue : (currentState.isImportant || false)
        };

        // Single atomic update
        this.$patch((state) => {
          state.messageStates = {
            ...state.messageStates,
            [messageId]: {
              ...state.messageStates[messageId],
              ...updates
            }
          };
        });

        const result = await this.updateMessageState(messageId, { [flag]: newFlagValue });
        console.log(`✅ Toggle flag operation result:`, result);
        
        return { success: true, state: this.messageStates[messageId] };
      } catch (error) {
        console.error(`❌ Error toggling flag:`, error);
        this.$patch((state) => {
          state.messageStates[messageId] = currentState;
        });
        throw error;
      }
    },

    async updateMessageState(messageId: string, updates: Partial<UserMessageState>) {
      const previousState = { ...this.messageStates[messageId] };
      const debugId = `state-${Date.now()}`; // Unique ID for tracking this operation
      console.group(`[DEBUG-${debugId}] Message State Update`);
      console.log('Starting state update operation:', {
        messageId,
        updates,
        previousState: previousState?.state,
        newState: updates.state,
        timestamp: new Date().toISOString()
      });

      // Calculate filtered messages before update
      const beforeFilteredMessages = { ...this.filteredMessages };
      console.log('Filtered messages before update:', {
        inbox: beforeFilteredMessages.inbox?.length || 0,
        starred: beforeFilteredMessages.starred?.length || 0,
        important: beforeFilteredMessages.important?.length || 0,
        trash: beforeFilteredMessages.trash?.length || 0,
        archived: beforeFilteredMessages.archived?.length || 0
      });

      try {
        // FIXED: Capture existing state to preserve all fields
        const existingState = this.messageStates[messageId] || {};
        const mergedState = {
          ...existingState,
          ...updates,
          messageId,
          userId: TEST_USER_ID,
          _type: 'userMessageStates'
        };

        // Optimistic update with merged state
        this.$patch((state) => {
          state.messageStates[messageId] = mergedState;
        });

        // API call returns updated document
        const updatedState = await useMessagingService().updateMessageState(
          messageId, 
          TEST_USER_ID, 
          updates
        );

        // FIXED: Ensure we don't lose state properties during update
        const finalMergedState = {
          ...mergedState,
          ...updatedState
        };

        // Update with merged server response + local state
        this.$patch((state) => {
          state.messageStates[messageId] = finalMergedState;
        });

        // Verify state after update
        console.log('State verification after update:', {
          messageId,
          originalState: previousState?.state,
          optimisticState: mergedState.state,
          serverState: updatedState?.state,
          finalState: this.messageStates[messageId]?.state,
          timestamp: new Date().toISOString()
        });

        // Calculate filtered messages after update
        const afterFilteredMessages = { ...this.filteredMessages };
        console.log('Filtered messages after state update:', {
          inbox: afterFilteredMessages.inbox?.length || 0,
          starred: afterFilteredMessages.starred?.length || 0, 
          important: afterFilteredMessages.important?.length || 0,
          trash: afterFilteredMessages.trash?.length || 0,
          archived: afterFilteredMessages.archived?.length || 0,
          changed: JSON.stringify(beforeFilteredMessages) !== JSON.stringify(afterFilteredMessages)
        });
        
        console.log('Completing state update operation:', {
          id: debugId,
          success: true,
          timestamp: new Date().toISOString()
        });
        console.groupEnd();
        
        return { success: true, state: finalMergedState };
      } catch (error) {
        // Rollback on error
        console.error(`[DEBUG-${debugId}] Error in state update:`, error);
        this.$patch((state) => {
          state.messageStates[messageId] = previousState;
        });
        console.groupEnd();
        throw error;
      }
    },

    async loadThread(threadId: string) {
      if (this.loading || this.threadMessages[threadId]) {
        return this.threadMessages[threadId];
      }
      
      this.loading = true;
      try {
        const messages = await useMessagingService().getThreadMessages(threadId);
        this.$patch((state) => {
          state.threadMessages[threadId] = messages;
          state.error = null;
        });
        return messages;
      } catch (error) {
        this.$patch((state) => {
          state.error = error instanceof Error ? error.message : 'Failed to load thread';
          state.threadMessages[threadId] = [];
        });
        this._handleError(error, 'loadThread');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Enhance message creation
    async createMessage(options: SendMessageOptions) {
      try {
        const message = await useMessagingService().sendMessage(options);
        this.$patch((state) => {
          state.messages.unshift(message);
          if (options.threadId) {
            state.threadMessages[options.threadId]?.push(message);
          }
        });
        return message;
      } catch (error) {
        this._handleError(error, 'createMessage');
        throw error;
      }
    },

    // Add a simple emergency reset function
    resetStore() {
      console.log('Performing emergency store reset');
      this.$patch({
        loading: false,
        initialized: true,
        error: null
      });
    },

    // Check any methods that might be calling toast.add() or showing notifications
    async moveMessage(messageIds: string | string[], folder: string) {
      console.log(`📦 Moving message(s) to ${folder}:`, messageIds);
      
      try {
        const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
        const results = await Promise.all(
          ids.map(id => this.updateMessageState(id, { state: folder as any }))
        );
        
        console.log(`✅ Move operation results:`, results);
        return results.every(r => r.success);
      } catch (error) {
        console.error(`❌ Error moving message(s):`, error);
        throw error;
      }
    },
  }
});
