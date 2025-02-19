import type { _Node } from '../_Node';
import type { _Join } from '../_Join';

export interface Message {
    _id?: string;
    subject?: string;
    content: string;
    sender: {
        id: string;
        _type: 'user';
        title: string;
        name?: string;
    };
    recipientType: 'user' | 'group';
    userRecipients: string[];
    groupRecipients: string[];
    isInitialMessage: boolean;
    replyTo?: string;
    _createdAt?: string;
    _type?: string;
    lastUpdated?: {
        userType: string;
        isSwp: boolean;
        date: string;
        isTest: boolean;
        environment: string;
    };
    _hash?: number;
}