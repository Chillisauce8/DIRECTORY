import type { _Node } from '../_Node';

export type RecipientType = 'to' | 'cc' | 'bcc';
export type ParticipantRole = 'sender' | 'recipient';

export interface MessageRecipient extends _Node {
    readonly userId: string;
    readonly messageId: string;
    readonly recipientType: RecipientType;
    readonly threadId?: string;
    readonly readAt?: string;  // ISO 8601 date string
    readonly deletedAt?: string;  // ISO 8601 date string
}

export interface ThreadParticipant {
    readonly userId: string;
    readonly role: ParticipantRole;
    readonly lastReadAt?: string;  // ISO 8601 date string
}
