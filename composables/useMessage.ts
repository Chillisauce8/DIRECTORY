import { useMessageStore } from '~/stores/useMessageStore';
import type { Message } from '~/types/message';

export const useMessage = () => {
    const store = useMessageStore();
    
    // Cache message transformations
    const messages = computed(() => store.messages.map(msg => ({
        ...msg,
        messageState: store.messageStates[msg._id]
    })));

    // Simplified filtering logic
    const filteredMessages = computed(() => {
        const messageList = messages.value;
        
        return {
            inbox: messageList.filter(m => !m.messageState?.state),
            starred: messageList.filter(m => m.messageState?.isStarred),
            spam: messageList.filter(m => m.messageState?.state === 'spam'),
            important: messageList.filter(m => m.messageState?.isImportant),
            sent: messageList.filter(m => m.messageState?.state === 'sent'),
            archived: messageList.filter(m => m.messageState?.state === 'archived'),
            trash: messageList.filter(m => m.messageState?.state === 'deleted')
        };
    });

    return {
        messages,
        filteredMessages,
        ...store
    };
};

export type MessageComposable = ReturnType<typeof useMessage>;
