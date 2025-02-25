import type { _Node } from '../_Node';

/**
 * Message State Types
 * 
 * FOLDER SYSTEM:
 * - 'state' defines the primary folder location (inbox, sent, etc)
 * - 'isStarred' and 'isImportant' are special folders that work as views
 * - Messages can be in one primary folder AND also appear in special folders
 * 
 * This follows the Gmail-style folder/label model for familiarity.
 */

// Primary message locations (exclusive - a message can only be in one)
export type MessageState = 'inbox' | 'sent' | 'archived' | 'deleted' | 'archive'; // Add 'archive' for backwards compatibility

export interface UserMessageState extends _Node {
    readonly _type: 'userMessageStates';
    readonly messageId: string;
    readonly userId: string;
    readonly threadId?: string;
    state: MessageState;     // Primary folder location
    isStarred: boolean;      // Special folder flag (independent of state)
    isImportant: boolean;    // Special folder flag (independent of state)
    isRead: boolean;
    lastReadAt?: string;  // ISO 8601 date string
}

export const DEFAULT_MESSAGE_STATE: Readonly<Partial<UserMessageState>> = {
    state: 'inbox',
    isStarred: false,
    isImportant: false,
    isRead: false
} as const;