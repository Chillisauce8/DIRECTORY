import type { _Node } from '../_Node';
import type { _Join } from '../_Join';

export interface messages extends _Node {
  subject?: string; // Subject line of the message, particularly useful for initial messages in a thread
  content: string; // The message text content
  sender: _Join; // Reference to the User who sent the message
  recipientType: 'user' | 'group'; // Indicates if the message is sent to a user or a group
  groupRecipients: any[]; // Array of Group recipients who should receive this message
  userRecipients: any[]; // Array of User recipients who should receive this message
  initialMessageId: string; // Reference to the first message in the thread. Same as message id if this is the first message
  isInitialMessage: boolean; // Indicates if this is the first message in a thread
  replyTo?: string; // Reference to the message this is replying to, if any
}