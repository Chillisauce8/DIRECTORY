/**
 * Message Types and Transformations
 * 
 * Core message type definitions:
 * - Message interface
 * - Message state types
 * - Transform functions
 * 
 * Features:
 * - Type safety for messages
 * - UI/DB transformations
 * - State management types
 * 
 * Usage:
 * import type { Message } from './message';
 * import { transformMessageForUI } from './message';
 */

import type { Message as DBMessage } from './collections/messages';
import type { UserMessageState, MessageState } from './collections/userMessageStates';

export type { MessageState };
export type { MessageParticipant } from './collections/messages';

export interface MessageUI extends Omit<DBMessage, '_type' | '_hash'> {
    messageState?: {
        state?: MessageState;
        isStarred: boolean;
        isImportant: boolean;
        isRead: boolean;
    };
}

export interface MessageTransformOptions {
    includeThread?: boolean;
    includeAttachments?: boolean;
}

// Simple transform function
export function transformMessageForUI(
    message: DBMessage, 
    state?: UserMessageState,
    options: MessageTransformOptions = {}
): MessageUI {
    return {
        ...message,
        messageState: state ? {
            state: state.state,
            isStarred: state.isStarred,
            isImportant: state.isImportant,
            isRead: state.isRead
        } : undefined
    };
}

// Helper function to convert UI message back to DB format
export function uiMessageToDbMessage(message: MessageUI): Partial<DBMessage> {
    return {
        subject: message.subject,
        content: message.content,
        recipientType: 'user',
        userRecipients: [message.userRecipients[0]],
        groupRecipients: [],
        isInitialMessage: message.isInitialMessage ?? true,
        sender: {
            id: '', // Need to get from current user
            _type: 'users',
            title: message.sender.title
        }
    };
}
