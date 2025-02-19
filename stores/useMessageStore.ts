import { defineStore } from 'pinia';
import type { Message } from '~/types/message';
import { useMessagingService } from '~/service/messaging/messaging.service';
import type { UserMessageState } from '~/types/collections/userMessageStates';

const TEST_USER_ID = "67b5e10353db2d84eb483539";

export const useMessageStore = defineStore('messages', {
    state: () => ({
        messages: [] as Message[],
        loading: false,
        error: null as string | null,
        activeFolder: 'inbox' as UserMessageState['state']
    }),

    getters: {
        filteredMessages: (state) => {
            const byFolder = {
                inbox: [] as Message[],
                starred: [] as Message[],
                spam: [] as Message[],
                important: [] as Message[],
                sent: [] as Message[],
                archived: [] as Message[],
                trash: [] as Message[]
            };

            state.messages.forEach(msg => {
                if (msg.messageState?.isStarred) byFolder.starred.push(msg);
                if (msg.messageState?.isImportant) byFolder.important.push(msg);
                
                switch (msg.messageState?.state) {
                    case 'spam': byFolder.spam.push(msg); break;
                    case 'sent': byFolder.sent.push(msg); break;
                    case 'archived': byFolder.archived.push(msg); break;
                    case 'deleted': byFolder.trash.push(msg); break;
                    default: byFolder.inbox.push(msg);
                }
            });

            return byFolder;
        }
    },

    actions: {
        async fetchMessages() {
            this.loading = true;
            try {
                const messagingService = useMessagingService();
                
                console.log('Store fetching messages:', {
                    userId: TEST_USER_ID,
                    folder: this.activeFolder
                });
                
                const messages = await messagingService.getUserMessages(
                    TEST_USER_ID,
                    this.activeFolder
                );

                if (!Array.isArray(messages)) {
                    console.error('Invalid response format:', messages);
                    throw new Error('Invalid message data received');
                }

                this.$patch({
                    messages,
                    error: null
                });
            } catch (err) {
                console.error('Message fetch error:', err);
                this.$patch({
                    error: err instanceof Error ? err.message : 'Failed to fetch messages',
                    messages: []
                });
            } finally {
                this.loading = false;
            }
        },

        async updateMessageState(messageId: string, state: Message['messageState']['state']) {
            const messagingService = useMessagingService();
            await messagingService.updateMessageState(messageId, TEST_USER_ID, state);
            await this.fetchMessages();
        }
    }
});
