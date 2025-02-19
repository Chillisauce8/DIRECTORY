import type { _Node } from '../_Node';

export interface userMessageStates extends _Node {
  userId: string; // Reference to the User this message state belongs to
  messageId: string; // Reference to the Message
  conversationId: string; // Reference to the Conversation for faster querying
  state: 'inbox' | 'sent' | 'archived' | 'deleted'; // Current state of the message for this user
  isStarred?: boolean; // Indicates if the user has starred this message
  isImportant?: boolean; // Indicates if the user has marked this message as important
}