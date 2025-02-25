import type { _Node } from '../_Node';

export type RecipientType = 'user' | 'group';

export interface MessageParticipant {
    readonly id: string;
    readonly _type: 'user';
    readonly title: string;
    readonly name?: string;
    readonly avatar?: string;
}

export interface Message extends _Node {
    readonly subject?: string;
    readonly content: string;
    readonly sender: MessageParticipant;
    readonly recipientType: RecipientType;
    readonly userRecipients: readonly string[];
    readonly groupRecipients: readonly string[];
    readonly isInitialMessage: boolean;
    readonly replyTo?: string;
    readonly threadId?: string;
}