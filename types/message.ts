import type { messages } from './collections/messages';
import type { userMessageStates } from './collections/userMessageStates';

// Single source of truth for message type
export interface Message {
    _id: string;
    subject: string;
    content: string;
    sender: {
        id: string;
        name: string;
        title: string;
        _type: 'user';
    };
    recipientType: 'user' | 'group';
    userRecipients: string[];
    groupRecipients: string[];
    _createdAt: string;
    isInitialMessage: boolean;
    messageState?: {
        state?: 'deleted' | 'archived' | 'sent' | 'spam';
        isStarred?: boolean;
        isImportant?: boolean;
    };
}

// Simple transform function
export function transformMessageForUI(message: messages, state?: userMessageStates): Message {
    return {
        ...message,
        messageState: state ? {
            state: state.state,
            isStarred: state.isStarred,
            isImportant: state.isImportant
        } : undefined
    };
}

// Helper function to convert UI message back to DB format
export function uiMessageToDbMessage(message: Message): Partial<messages> {
    return {
        subject: message.subject,
        content: message.content,
        recipientType: 'user',
        userRecipients: [message.userRecipients[0]],
        groupRecipients: [],
        isInitialMessage: message.isInitialMessage ?? true,
        sender: {
            id: '', // Need to get from current user
            _type: 'user',
            title: message.sender.title
        }
    };
}
