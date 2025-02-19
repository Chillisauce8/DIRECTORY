import { defineStore } from 'pinia';
import type { Message, DBMessage } from '~/types/message';
import { transformMessageForUI } from '~/types/message';
import { useMessagingService } from '~/service/messaging/messaging.service';

export const useMessage = defineStore('mail', () => {
    const messages = ref<Message[]>([]);
    const filteredMessages = ref<Record<string, Message[]>>({});
    const activeFolder = ref('inbox');

    // Add thread management
    const activeThread = ref<Message | null>(null);
    const threadMessages = ref<Message[]>([]);

    // Replace demo fetching with real service
    async function fetchMessages() {
        const messagingService = useMessagingService();
        const currentUser = useUser(); // Assume we have a user store
        
        try {
            const rawMessages = await messagingService.getUserMessages(
                currentUser.value.id,
                activeFolder.value as any
            );
            
            messages.value = rawMessages.map(msg => transformMessageForUI(msg as DBMessage));
            filterMessages();
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            messages.value = [];
        }
    }

    // Filter messages by type
    function filterMessages() {
        filteredMessages.value = {};
        messages.value.forEach((message) => {
            if (!message.archived && !message.trash && !message.spam && !message.sent) {
                addToFolder('inbox', message);
            }
            Object.entries(message).forEach(([key, value]) => {
                if (value === true) addToFolder(key, message);
            });
        });
    }

    function addToFolder(folder: string, message: Message) {
        if (!filteredMessages.value[folder]) {
            filteredMessages.value[folder] = [];
        }
        filteredMessages.value[folder].push(message);
    }

    // Update message state using service
    async function updateMessageState(messageId: string, updates: any): Promise<void> {
        const messagingService = useMessagingService();
        const message = messages.value.find(m => m.id === messageId);
        if (!message) return;

        try {
            // Update UI first for responsiveness
            if ('state' in updates) {
                message.trash = updates.state === 'deleted';
                message.archived = updates.state === 'archived';
                message.spam = false;
            }
            if ('isStarred' in updates) {
                message.starred = updates.isStarred;
            }
            if ('isImportant' in updates) {
                message.important = updates.isImportant;
            }

            // Update backend
            await messagingService.updateMessageState(messageId, updates);
            
            // Refilter messages
            filterMessages();
        } catch (error) {
            console.error('Failed to update message state:', error);
            // Revert UI changes on error
            await fetchMessages();
        }
    }

    async function loadThread(messageId: string) {
        const messagingService = useMessagingService();
        try {
            const thread = await messagingService.getThreadMessages(messageId);
            threadMessages.value = thread.map(msg => transformMessageForUI(msg as DBMessage));
            activeThread.value = threadMessages.value.find(m => m.id === messageId) || null;
        } catch (error) {
            console.error('Failed to load thread:', error);
            threadMessages.value = [];
            activeThread.value = null;
        }
    }

    async function replyToMessage(content: string, replyToId: string) {
        const messagingService = useMessagingService();
        try {
            const originalMessage = messages.value.find(m => m.id === replyToId);
            if (!originalMessage) throw new Error('Original message not found');

            await messagingService.sendMessage({
                content,
                recipientId: originalMessage.from!, // Reply to original sender
                recipientType: 'user',
                replyToMessageId: replyToId
            });

            // Refresh thread if we're viewing it
            if (activeThread.value?.id === replyToId) {
                await loadThread(replyToId);
            }
        } catch (error) {
            console.error('Failed to send reply:', error);
            throw error;
        }
    }

    // Watch for folder changes
    watch(activeFolder, async () => {
        await fetchMessages();
    });

    return {
        messages,
        filteredMessages,
        activeFolder,
        fetchMessages,
        filterMessages,
        updateMessageState,
        activeThread,
        threadMessages,
        loadThread,
        replyToMessage
    };
});
