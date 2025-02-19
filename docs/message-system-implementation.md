# Message System Technical Implementation Guide

## System Architecture

### Database Collections
1. **messages**
   - Location: `/types/collections/messages.ts`
   ```typescript
   interface messages {
     _id: string;
     subject: string;
     content: string;
     sender: {
       id: string;
       _type: string;
       title: string;
       name: string;
     };
     recipientType: 'user' | 'group';
     userRecipients: string[];
     groupRecipients: string[];
     isInitialMessage: boolean;
     _createdAt: string;
     _type: string;
   }
   ```

2. **userMessageStates**
   - Location: `/types/collections/userMessageStates.ts`
   ```typescript
   interface userMessageStates {
     messageId: string;
     userId: string;
     state: 'inbox' | 'sent' | 'archived' | 'deleted' | 'spam';
     isStarred?: boolean;
     isImportant?: boolean;
   }
   ```

### Core Components

1. **Service Layer** (`/service/messaging/messaging.service.ts`)
   - Handles all DB operations
   - Manages transactions
   - Implements CRUD operations
   - Key Methods:
     - getUserMessages
     - sendMessage
     - updateMessageState
     - getThreadMessages

2. **Store Layer** (`/stores/useMessageStore.ts`)
   - Manages application state
   - Handles message filtering
   - Implements message actions
   - Uses Pinia for state management

3. **UI Components**
   - MessageContainer (`/components/message/MessageContainer.vue`)
     - Main container component
     - Handles routing and layout
   - MessageListItem (`/components/message/MessageListItem.vue`)
     - Renders individual messages
     - Handles message actions
   - MessageComposer (`/components/message/MessageComposer.vue`)
     - Handles message creation
   - MessageDetail (`/components/message/MessageDetail.vue`)
     - Shows message details
     - Handles replies

### Current Implementation Status

#### Working Features
1. Data Models and Types
2. Service Layer Implementation
3. Store Management
4. UI Components Structure
5. Routing Setup

#### Pending Features
1. Message Rendering
2. Real-time Updates
3. Error Handling
4. Message Threading

### Current Issue: Message Rendering

#### Symptoms
```log
<Suspense> is an experimental feature and its API will likely change.
MessageListItem.vue:21 MessageListItem updated: {hasMessages: true, messageCount: 0, firstMessage: undefined}
useMessageStore.ts:51 Store fetching messages: {userId: '67b5e10353db2d84eb483539', folder: 'inbox'}
messaging.service.ts:79 Making API request: {path: '/api/query?collection=messages', queryData: {…}}
http.service.ts:144 HTTP POST request: {path: '/api/query?collection=messages', data: {…}, headers: 'default headers'}
```

#### Analysis
1. Messages array exists but is empty
2. API request is being made correctly
3. No error response is logged
4. Data transformation may be failing silently

### Developer Check Points

1. **API Response Verification**
   ```typescript
   // Add in messaging.service.ts
   console.log('Raw API Response:', response);
   ```

2. **Data Flow Check**
   - Verify store state updates
   - Check computed property dependencies
   - Validate message transformation

3. **Component Mounting**
   - Review Suspense implementation
   - Check component lifecycle

4. **Error Handling**
   ```typescript
   // Add in http.service.ts
   console.log('Request Config:', {
     url: path,
     method: 'POST',
     headers: headers || 'default headers',
     data: queryData
   });
   ```

5. **Store Integration**
   - Verify store subscription
   - Check reactive property updates
   - Validate getter implementations

### Files to Review

1. **Service Layer**
   - `/service/http/http.service.ts`: HTTP client implementation
   - `/service/messaging/messaging.service.ts`: Message operations

2. **Store Layer**
   - `/stores/useMessageStore.ts`: State management
   - `/composables/useMessage.ts`: Store composable

3. **Components**
   - `/components/message/MessageContainer.vue`: Main container
   - `/components/message/MessageListItem.vue`: List rendering

4. **Types**
   - `/types/message.ts`: Message interfaces
   - `/types/collections/messages.ts`: DB schemas
   - `/types/collections/userMessageStates.ts`: State schemas

### Next Steps

1. Add verbose logging to trace data flow
2. Verify API endpoint configuration
3. Check database query results
4. Validate message transformation pipeline
5. Review component rendering lifecycle

### Questions for Investigation

1. Is the API returning data but not in expected format?
2. Are message transformations working correctly?
3. Is store state being properly updated?
4. Are component props being passed correctly?
5. Is the Suspense component causing timing issues?

## API Query Optimization

### Required JOIN Operations

1. **Message with User States**
   ```typescript
   {
     $lookup: {
       from: 'userMessageStates',
       localField: '_id',
       foreignField: 'messageId',
       as: 'messageState'
     }
   }
   ```

2. **Message with Sender Data**
   ```typescript
   {
     $lookup: {
       from: 'users',
       localField: 'sender.id',
       foreignField: '_id',
       as: 'senderData'
     }
   }
   ```

3. **Thread Messages**
   ```typescript
   {
     $lookup: {
       from: 'messages',
       localField: 'initialMessageId',
       foreignField: '_id',
       as: 'threadMessages'
     }
   }
   ```

### Optimized Queries

1. **Inbox View Query**
   ```typescript
   {
     collection: 'messages',
     operation: 'aggregate',
     pipeline: [
       {
         $match: {
           $or: [
             { 'sender.id': userId },
             { userRecipients: userId }
           ]
         }
       },
       {
         $lookup: {
           from: 'userMessageStates',
           let: { messageId: '$_id', userId: userId },
           pipeline: [
             {
               $match: {
                 $expr: {
                   $and: [
                     { $eq: ['$messageId', '$$messageId'] },
                     { $eq: ['$userId', '$$userId'] }
                   ]
                 }
               }
             }
           ],
           as: 'messageState'
         }
       },
       {
         $addFields: {
           messageState: { $arrayElemAt: ['$messageState', 0] }
         }
       },
       {
         $sort: { _createdAt: -1 }
       }
     ],
     index: { 
       userRecipients: 1,
       'sender.id': 1,
       _createdAt: -1
     }
   }
   ```

2. **Thread View Query**
   ```typescript
   {
     collection: 'messages',
     operation: 'aggregate',
     pipeline: [
       {
         $match: {
           $or: [
             { _id: initialMessageId },
             { initialMessageId: initialMessageId }
           ]
         }
       },
       {
         $lookup: {
           from: 'users',
           localField: 'sender.id',
           foreignField: '_id',
           as: 'senderData'
         }
       },
       {
         $sort: { _createdAt: 1 }
       }
     ],
     index: {
       initialMessageId: 1,
       _createdAt: 1
     }
   }
   ```

3. **User States Query**
   ```typescript
   {
     collection: 'userMessageStates',
     operation: 'aggregate',
     pipeline: [
       {
         $match: {
           userId: userId,
           state: state
         }
       },
       {
         $lookup: {
           from: 'messages',
           localField: 'messageId',
           foreignField: '_id',
           as: 'message'
         }
       }
     ],
     index: {
       userId: 1,
       state: 1
     }
   }
   ```

### Required Indexes

```typescript
// messages collection
{
  createIndexes: 'messages',
  indexes: [
    {
      key: { userRecipients: 1, 'sender.id': 1, _createdAt: -1 },
      name: 'inbox_view'
    },
    {
      key: { initialMessageId: 1, _createdAt: 1 },
      name: 'thread_view'
    }
  ]
}

// userMessageStates collection
{
  createIndexes: 'userMessageStates',
  indexes: [
    {
      key: { userId: 1, state: 1 },
      name: 'user_states'
    },
    {
      key: { messageId: 1 },
      name: 'message_states'
    }
  ]
}
```

### Performance Considerations

1. **Batch Operations**
   - Use bulk write operations for state updates
   - Implement optimistic UI updates
   - Cache thread results

2. **Pagination Strategy**
   ```typescript
   {
     $facet: {
       metadata: [{ $count: 'total' }],
       data: [
         { $skip: skip },
         { $limit: limit }
       ]
     }
   }
   ```

3. **Projection Optimization**
   ```typescript
   {
     $project: {
       subject: 1,
       sender: 1,
       _createdAt: 1,
       content: { $cond: { if: wantContent, then: '$content', else: '$$REMOVE' } }
     }
   }
   ```

4. **Real-time Updates**
   - Use change streams for message states
   - Implement optimistic UI updates
   - Cache frequently accessed data

## TASKS

### High Priority

1. **Document Creation Metadata**
   - Issue: 'created' object not being automatically added to documents
   - Expected fields:
     ```typescript
     created: {
       _by: string; // User ID
       _at: Date;
       _from: string; // IP or device info
     }
     ```
   - Currently using fallback to `_createdAt`
   - Need to investigate document creation pipeline

2. **User Authentication**
   - Remove hardcoded TEST_USER_ID: "67b5e10353db2d84eb483539"
   - Implement proper user session management
   - Add authentication middleware
   - Update message queries to use authenticated user

3. **Database Indexes**
   - Verify indexes are being created from `db-indexes.ts`
   - Add monitoring for index usage
   - Consider adding compound indexes for common queries
   - Monitor query performance with large datasets

### Medium Priority

1. **User Images**
   - Implement files collection for image storage
   - Add image array to user schema:
     ```typescript
     interface User {
       // ...existing fields...
       images: {
         _ref: string; // Reference to files collection
         _type: 'image';
         alt?: string;
         caption?: string;
       }[];
     }
     ```
   - Update user queries to include image JOIN



2. **Query Optimization**
   - Add query result caching
   - Implement pagination
   - Add field projection
   - Monitor JOIN performance

### Low Priority

1. **Real-time Updates**
   - Implement WebSocket connection
   - Add change streams for messages
   - Add optimistic updates
   - Handle offline scenarios

2. **Message Threading**
   - Improve thread query performance
   - Add thread collapse/expand
   - Consider thread depth limits
   - Add thread navigation

3. **UI/UX Improvements**
   - Add loading states
   - Improve error messages
   - Add retry mechanisms
   - Implement proper mobile view

### Technical Debt

1. **Type Safety**
   - Add proper typing for all API responses
   - Implement runtime type checking
   - Add validation schemas
   - Improve error types

2. **Code Organization**
   - Move queries to separate files
   - Add service documentation
   - Implement proper error boundaries
   - Add performance monitoring

3. **Testing**
   - Add unit tests for services
   - Add integration tests
   - Add E2E tests
   - Add performance tests

### Infrastructure

1. **Database**
   - Monitor index usage
   - Add query logging
   - Implement backup strategy
   - Add performance monitoring

2. **API**
   - Add rate limiting
   - Add request logging
   - Improve error handling
   - Add API documentation

3. **Deployment**
   - Add CI/CD pipeline
   - Add staging environment
   - Add monitoring
   - Add alerts

### Documentation

1. **API Documentation**
   - Document all endpoints
   - Add example requests/responses
   - Add error codes
   - Add rate limits

2. **Development Guide**
   - Add setup instructions
   - Add contribution guidelines
   - Add coding standards
   - Add troubleshooting guide
