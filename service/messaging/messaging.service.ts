import type { HttpService } from '~/service/http/http.service';
import { serviceComposableFactory } from '~/service/service-composable-factory';
import { httpService } from '~/service/http/http.service';
import type { messages } from '~/types/collections/messages';
import type { userMessageStates } from '~/types/collections/userMessageStates';

export interface SendMessageOptions {
  content: string;
  recipientId: string;
  recipientType: 'user' | 'group';
  replyToMessageId?: string;
}

export class MessagingService {
  private readonly messagesCollection = 'messages';
  private readonly messageStatesCollection = 'userMessageStates';

  constructor(private httpService: HttpService) {}

  async sendMessage(options: SendMessageOptions): Promise<messages> {
    try {
      // Start transaction
      const session = await this.httpService.post('/api/query/session', {});
      
      try {
        // Create the message
        const message = await this.httpService.post<messages>('/api/query', {
          collection: this.messagesCollection,
          data: {
            content: options.content,
            recipientType: options.recipientType,
            [options.recipientType === 'user' ? 'userRecipients' : 'groupRecipients']: [options.recipientId],
            replyTo: options.replyToMessageId,
            isInitialMessage: !options.replyToMessageId,
            initialMessageId: options.replyToMessageId || undefined
          },
          session: session.data
        });

        // Create message states with same session
        await this.createMessageStates(
          message.data!._id!, 
          options.recipientId, 
          options.recipientType,
          session.data
        );

        // Commit transaction
        await this.httpService.post('/api/query/commit', { session: session.data });
        
        return message.data!;
      } catch (error) {
        // Abort transaction on error
        await this.httpService.post('/api/query/abort', { session: session.data });
        throw error;
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw new Error('Failed to send message');
    }
  }

  async getUserMessages(userId: string, state: userMessageStates['state'] = 'inbox'): Promise<messages[]> {
    const response = await this.httpService.post('/api/query', {
      collection: this.messageStatesCollection,
      operation: 'find',
      q: { userId, state },
      thread: true, // Signal to use thread-aware aggregation
      sort: { _createdAt: -1 },
      limit: 50,
      include: ['replies', 'userData'] // Add userData to include user details
    });
    return response.data || [];
  }

  async getThreadMessages(initialMessageId: string): Promise<messages[]> {
    const response = await this.httpService.post('/api/query', {
      collection: this.messagesCollection,
      operation: 'find',
      q: { 
        $or: [
          { _id: initialMessageId },
          { initialMessageId: initialMessageId }
        ]
      },
      include: ['userData'], // Include user data for thread participants
      sort: { _createdAt: 1 } // Chronological order for thread
    });

    // Ensure thread messages have proper user data
    return response.data?.map(message => ({
      ...message,
      senderData: message.sender?.userData,
      recipientData: message.userRecipients?.map(r => r.userData)
    })) || [];
  }

  async updateMessageState(messageId: string, userId: string, state: userMessageStates['state']): Promise<void> {
    await this.httpService.post('/api/query', {
      collection: this.messageStatesCollection,
      operation: 'update',
      q: { messageId, userId },
      data: { state }
    });
  }

  private async createMessageStates(
    messageId: string, 
    recipientId: string, 
    recipientType: 'user' | 'group',
    session?: any
  ): Promise<void> {
    const states: Partial<userMessageStates>[] = [
      {
        messageId,
        state: 'sent',
        userId: (await this.httpService.get('/api/user')).data!._id
      },
      {
        messageId,
        state: 'inbox',
        userId: recipientId
      }
    ];

    await this.httpService.post('/api/query', {
      collection: this.messageStatesCollection,
      operation: 'insert',
      data: states,
      session
    });
  }
}

export const useMessagingService = serviceComposableFactory<MessagingService>('messagingService', () => {
  return new MessagingService(httpService);
});
