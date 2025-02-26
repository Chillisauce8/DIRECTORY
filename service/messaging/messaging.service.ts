/**
 * Messaging Service
 *
 * Handles all message-related API operations:
 * - Message CRUD operations
 * - Message state management
 * - Thread management
 *
 * Features:
 * - Transaction support
 * - Error handling
 * - Message state tracking
 * - Thread organization
 *
 * API Integration:
 * - Messages collection operations
 * - Message states management
 * - User context handling
 */
import type { HttpService } from '~/service/http/http.service';
import { serviceComposableFactory } from '~/service/service-composable-factory';
import { httpService } from '~/service/http/http.service';
import type { messages } from '~/types/collections/messages';
import type { userMessageStates } from '~/types/collections/userMessageStates';
import type { MessageState } from '~/types/message';

export interface SendMessageOptions {
    content: string;
    recipientId: string;
    recipientType: 'user' | 'group';
    replyToMessageId?: string;
    isDraft?: boolean;
    threadId?: string;  // Add support for threading
}

interface MessageQueryParams {
    collection?: string;
    operation: 'find' | 'upsert' | 'insert';
    q?: Record<string, any>;
    data?: Record<string, any>;
    upsert?: boolean;
    session?: any;
}

export class MessagingService {
  // Updated endpoints to match route configuration
  private readonly endpoints = {
    query: '/api/query',
    create: '/api/create',
    update: '/api/update',
    delete: '/api/delete',
    get: '/api/get',
    // Transaction endpoints appear to be custom
    session: '/api/query/session',
    commit: '/api/query/commit',
    abort: '/api/query/abort'
  } as const;

  private readonly collections = {
    messages: 'messages',
    states: 'userMessageStates'
  } as const;

  private readonly defaultState: Readonly<Partial<userMessageStates>> = {
    isStarred: false,
    isImportant: false,
    state: 'inbox'
  } as const;

  constructor(private readonly httpService: HttpService) {}

  async sendMessage(options: SendMessageOptions): Promise<messages> {
    const session = await this.startTransaction();

    try {
      const message = await this.createMessage(options, session);
      await this.createMessageStates(
        message._id,
        options.recipientId,
        options.recipientType,
        options.threadId,
        session
      );
      await this.commitTransaction(session);
      return message;
    } catch (error) {
      await this.abortTransaction(session);
      this.logError('sendMessage', error);
      throw error;
    }
  }

  async getUserMessages(userId: string): Promise<messages[]> {
    // Using the GET /api/query endpoint
    const response = await this.query({
      operation: 'find',
      q: {
        $or: [
          { 'sender.id': userId },
          { userRecipients: userId }
        ]
      },
      sort: { _createdAt: -1 }
    });

    return response.data?.map(this.ensureMessageDates) ?? [];
  }

  // Add thread support
  async getThreadMessages(threadId: string): Promise<messages[]> {
    // Using the GET /api/query endpoint
    const response = await this.query({
        operation: 'find',
        q: { threadId },
        sort: { _createdAt: 1 }  // Chronological order
    });

    return response.data?.map(this.ensureMessageDates) ?? [];
  }

  async updateMessageState(
    messageId: string,
    userId: string,
    updates: Partial<userMessageStates>
  ): Promise<userMessageStates> {
    console.log('Updating message state:', { messageId, userId, updates });

    try {
      // 1. First check if a state document exists for this message/user combination
      const existingState = await this.query<userMessageStates[]>({
        collection: this.collections.states,
        operation: 'find',
        q: {
          messageId,
          userId
        }
      });

      // 2. Prepare the state document - preserve existing state fields
      const stateDoc = {
        _type: 'userMessageStates',
        messageId,
        userId,
        // FIXED: First use existing state if available, fall back to defaults
        ...this.defaultState,
        ...(existingState?.data?.[0] || {}),  // Preserve existing values
        ...updates, // Apply new updates last
        lastUpdated: {
          date: new Date().toISOString(),
          userId
        }
      };

      // 3. If state exists, update it. If not, create new.
      // Update to use PUT /api/update/:collection endpoint for updates
      const stateId = existingState?.data?.[0]?._id;
      let response;
      
      if (stateId) {
        // Use update endpoint for existing state
        response = await this.httpService.put<{ data: userMessageStates }>(
          `${this.endpoints.update}/${this.collections.states}`, 
          {
            _id: stateId,
            ...stateDoc
          }
        );
      } else {
        // Use create endpoint for new state
        response = await this.httpService.post<{ data: userMessageStates }>(
          `${this.endpoints.create}/${this.collections.states}`,
          stateDoc
        );
      }

      // Verify the update was successful - FIXED to ensure state isn't lost
      const updatedDoc = await this.httpService.get(
        `${this.endpoints.get}/${this.collections.states}/${response.data.data._id}`
      );

      console.log('State update verification:', {
        messageId,
        userId,
        before: existingState?.data?.[0],
        after: updatedDoc.data,
        updateSuccessful: !!updatedDoc.data && 
                          updatedDoc.data.state === updates.state // Verify state change
      });

      if (!response?.data?.data) {
        throw new Error('Failed to update message state');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error updating message state:', error);
      throw error;
    }
  }

  // Add method to fetch message states for debugging
  async getMessageStates(messageId: string): Promise<userMessageStates[]> {
    // Using the GET /api/query endpoint
    const response = await this.query({
      collection: this.collections.states,
      operation: 'find',
      q: { messageId }
    });

    console.log('Current message states:', {
      messageId,
      states: response?.data
    });

    return response?.data || [];
  }

  // Private methods for API operations
  private async query<T>(params: Record<string, any>): Promise<{ data: T }> {
    // Using GET /api/query with query params
    return this.httpService.get(`${this.endpoints.query}?collection=${params.collection || this.collections.messages}`, params);
  }

  private async startTransaction() {
    return (await this.httpService.post(this.endpoints.session, {})).data;
  }

  private async commitTransaction(session: any) {
    await this.httpService.post(this.endpoints.commit, { session });
  }

  private async abortTransaction(session: any) {
    await this.httpService.post(this.endpoints.abort, { session });
  }

  private ensureMessageDates(message: messages): messages {
    return {
      ...message,
      created: message.created || {
        date: new Date().toISOString(),
        id: '',
        name: '',
        userType: 'system',
        isTest: false,
        environment: 'development'
      }
    };
  }

  private async createMessage({
    content,
    recipientId,
    recipientType,
    replyToMessageId,
    threadId,
    session
  }: SendMessageOptions & { session: any }): Promise<messages> {
    // Update to use POST /api/create/:collection endpoint
    const message = await this.httpService.post<messages>(
      `${this.endpoints.create}/${this.collections.messages}`, 
      {
        content,
        recipientType,
        [recipientType === 'user' ? 'userRecipients' : 'groupRecipients']: [recipientId],
        replyTo: replyToMessageId,
        isInitialMessage: !replyToMessageId,
        initialMessageId: replyToMessageId || undefined,
        threadId,  // Add thread ID
        _session: session // Pass session in request body
      }
    );

    return message.data!;
  }

  private async createMessageStates(
    messageId: string,
    recipientId: string,
    recipientType: 'user' | 'group',
    threadId?: string,
    session?: any
  ): Promise<void> {
    const states: Partial<userMessageStates>[] = [
      {
        messageId,
        state: 'sent',
        userId: (await this.httpService.get('/api/user')).data!._id,
        threadId  // Add thread ID
      },
      {
        messageId,
        state: 'inbox',
        userId: recipientId,
        threadId  // Add thread ID
      }
    ];

    // Update to use POST /api/create/:collection for batch inserts
    await this.httpService.post(
      `${this.endpoints.create}/${this.collections.states}`,
      { 
        data: states,
        _session: session // Pass session in request body
      }
    );
  }

  private logError(method: string, error: unknown): void {
    console.error('Messaging error:', {
      method,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Enhance API methods with better error handling and logging
export const messagingService = {
  async getMessages() {
    console.log('🔄 messagingService: Fetching messages');
    try {
      // This is a custom endpoint that would be implemented separately
      const response = await httpService.get('/api/messages');
      return response;
    } catch (error) {
      console.error('📛 messagingService: Error fetching messages', error);
      throw error;
    }
  },

  async moveMessage(messageId, folder) {
    console.log(`🔄 messagingService: Moving message(s) to ${folder}`, messageId);
    try {
      const payload = { messageId, folder };
      // This is a custom endpoint that would be implemented separately
      const response = await httpService.post('/api/messages/move', payload);

      // Verify response structure
      console.log('📤 messagingService: Move response', response);

      return response;
    } catch (error) {
      console.error('📛 messagingService: Error moving message', error);
      throw error;
    }
  },

  async toggleFlag(messageId, flag, value) {
    console.log(`🔄 messagingService: Toggling ${flag} for message`, messageId);
    try {
      const payload = { messageId, flag, value };
      // This is a custom endpoint that would be implemented separately
      const response = await httpService.post('/api/messages/flag', payload);

      // Verify response structure
      console.log('📤 messagingService: Flag toggle response', response);

      return response;
    } catch (error) {
      console.error('📛 messagingService: Error toggling flag', error);
      throw error;
    }
  },

  // ...existing code for other methods...
}

export const useMessagingService = serviceComposableFactory('messagingService', () =>
  new MessagingService(httpService)
);
