import type { _Node } from '../_Node';

export interface UserMessageState {
    _id: string;
    userId: string;
    state: 'inbox' | 'sent' | 'archived' | 'deleted' | 'spam';
    isStarred: boolean;
    isImportant: boolean;
    _createdAt?: string;
    _type?: 'userMessageStates';
    lastUpdated?: {
        userType: string;
        isSwp: boolean;
        date: string;
        isTest: boolean;
        environment: string;
    };
    _hash?: number;
}