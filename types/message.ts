import type { _Join } from './_Join';
import type { messages } from './collections/messages';
import type { userMessageStates } from './collections/userMessageStates';

// Original UI Message format (don't change this yet)
export interface Message {
    id: string | number;
    from?: string;
    to?: string;
    email?: string;
    image?: string;
    title: string;
    message: string;
    date: string;
    important?: boolean;
    starred?: boolean;
    trash?: boolean;
    spam?: boolean;
    archived?: boolean;
    sent?: boolean;
    thread?: Message[]; // Add thread support
    isInitialMessage?: boolean;
    replyToMessageId?: string;
}

// New DB format
export interface DBMessage extends messages {
    messageState?: userMessageStates;
}

// Keep the UI working while we transition
export function transformMessageForUI(dbMessage: DBMessage & { 
    messageState?: userMessageStates, 
    thread?: DBMessage[],
    senderData?: { email: string; image: string; },
    recipientData?: Array<{ email: string; image: string; }>
}): Message {
    // Handle joined message and state data
    if ('messageState' in dbMessage) {
        return {
            id: dbMessage._id!,
            from: dbMessage.sender?.title || 'Unknown',
            to: dbMessage.recipientType === 'user' 
                ? dbMessage.userRecipients?.[0] 
                : dbMessage.groupRecipients?.[0],
            title: dbMessage.subject || '',
            message: dbMessage.content,
            date: dbMessage._createdAt || new Date().toLocaleDateString(),
            important: dbMessage.messageState?.isImportant || false,
            starred: dbMessage.messageState?.isStarred || false,
            trash: dbMessage.messageState?.state === 'deleted',
            spam: dbMessage.messageState?.state === 'spam',
            archived: dbMessage.messageState?.state === 'archived',
            sent: dbMessage.messageState?.state === 'sent',
            thread: dbMessage.thread?.map(msg => transformMessageForUI(msg)),
            isInitialMessage: dbMessage.isInitialMessage,
            replyToMessageId: dbMessage.replyTo,
            email: dbMessage.senderData?.email || dbMessage.sender?.id || '',
            image: dbMessage.senderData?.image || `${dbMessage.sender?.id}.png`,
            recipientEmails: dbMessage.recipientData?.map(r => r.email) || []
        };
    }

    // Handle legacy demo format
    if ('from' in dbMessage || 'to' in dbMessage) {
        return dbMessage as unknown as Message;
    }

    // Handle basic message without state
    return {
        id: dbMessage._id!,
        from: dbMessage.sender?.title || 'Unknown',
        to: dbMessage.recipientType === 'user' 
            ? dbMessage.userRecipients?.[0] 
            : dbMessage.groupRecipients?.[0],
        title: dbMessage.subject || '',
        message: dbMessage.content,
        date: dbMessage._createdAt || new Date().toLocaleDateString(),
        important: false,
        starred: false,
        trash: false,
        spam: false,
        archived: false,
        sent: false
    };
}

// Utility type to convert DB message to UI message
export function dbMessageToUiMessage(
    message: messages, 
    state: userMessageStates
): Message {
    return {
        id: message._id!,
        from: message.sender.title,
        to: message.recipientType === 'user' ? message.userRecipients[0] : message.groupRecipients[0],
        title: message.subject || '',
        message: message.content,
        date: message._createdAt || new Date().toDateString(),
        // Map states to boolean flags
        important: state.isImportant || false,
        starred: state.isStarred || false,
        // Map message states to boolean flags
        trash: state.state === 'deleted',
        spam: false, // No direct mapping in DB, could be added as a state
        archived: state.state === 'archived',
        sent: state.state === 'sent'
    };
}

// Utility type to convert UI message to DB format
export function uiMessageToDbMessage(message: Message): Partial<messages> {
    return {
        subject: message.title,
        content: message.message,
        recipientType: 'user', // Default to user messages for now
        userRecipients: [message.to!],
        groupRecipients: [],
        isInitialMessage: true, // Set based on context
        sender: {
            id: '', // Need to get from current user
            _type: 'user',
            title: message.from!
        }
    };
}
