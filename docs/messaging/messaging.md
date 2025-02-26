# Messaging System - Feature Document

## Status
Implemented - In Production

## 1. Overview
- **Feature Name**: Messaging System
- **Description**: A complete solution for handling user-to-user and user-to-group communications within the application
- **Purpose**: To provide Gmail-like messaging capabilities including composition, organization, thread management, and state tracking
- **Target Users**: All application users who need to communicate with other users or groups

## 2. User Stories
- As a user, I want to send messages to other users so that I can communicate directly with them
- As a user, I want to see my messages organized in folders so I can easily manage my communications
- As a user, I want to star important messages so I can find them quickly later
- As a user, I want to mark messages as read/unread to track what I've reviewed
- As a user, I want to archive messages I no longer need in my inbox but want to keep
- As a user, I want to send messages to groups so I can communicate with multiple people at once

## 3. Technical Architecture
### 3.1 Data Models
```typescript
// Core TypeScript interfaces for this feature
export interface IMessage extends _Node {
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

export interface IUserMessageState {
  userId: string;
  messageId: string;
  state: MessageState;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
}

export interface IMessageUI extends Omit<IMessage, '_type' | '_hash'> {
  messageState?: {
    state?: MessageState;
    isStarred: boolean;
    isImportant: boolean;
    isRead: boolean;
  };
}

export enum MessageStateEnum {
  INBOX = 'inbox',
  SENT = 'sent',
  ARCHIVED = 'archived',
  TRASH = 'trash'
}

export type RecipientType = 'user' | 'group';
```

### 3.2 Component Architecture
- **MessageContainer**:
  - **Purpose**: Main wrapper component for message display
  - **Props**: folder, messageId
  - **Emits**: folder-changed, message-selected
  - **Location**: /components/message/MessageContainer.vue
  - **PrimeVue Components**: PCard, PSplitButton

- **MessageSidebar**:
  - **Purpose**: Navigation for message folders
  - **Props**: unreadCounts, selectedFolder
  - **Emits**: folder-selected
  - **Location**: /components/message/MessageSidebar.vue
  - **PrimeVue Components**: PMenu, PBadge

- **MessageListItem**:
  - **Purpose**: Individual message in lists
  - **Props**: message, selected
  - **Emits**: message-selected, star-toggled
  - **Location**: /components/message/MessageListItem.vue
  - **PrimeVue Components**: PCheckbox, PButton

- **MessageDetail**:
  - **Purpose**: Detailed message view
  - **Props**: message, showActions
  - **Emits**: reply, forward, archive, delete
  - **Location**: /components/message/MessageDetail.vue
  - **PrimeVue Components**: PDialog, PEditor, PButton

### 3.3 State Management
- **Pinia Store**: /stores/useMessageStore.ts
- **Key State Elements**:
  - `messages`: All loaded messages
  - `folderCounts`: Count of messages by folder
  - `selectedFolder`: Currently selected folder
  - `selectedMessageId`: Currently selected message
- **Actions**:
  - `fetchMessages`: Load messages from API
  - `sendMessage`: Send a new message
  - `updateMessageState`: Change a message's state
  - `markAsRead/Unread`: Update read status
  - `starMessage`: Toggle star status
  - `markAsImportant`: Toggle important status
- **Getters**:
  - `filteredMessages`: Messages filtered by folder
  - `messageById`: Get specific message by ID
  - `unreadCountByFolder`: Count of unread messages

### 3.4 API Endpoints
- **MongoDB Collections**:
  - `messages`: Stores message content and metadata
  - `userMessageStates`: Stores per-user message state
  - `messageRecipients`: Maps recipients to messages
- **API Routes**:
  - `GET /api/messages`: Fetch messages for current user
  - `POST /api/query`: Create a new message (using the generic query API)
  - `POST /api/messages/move`: Move message to a different folder (inbox, archived, trash)
  - `POST /api/messages/flag`: Toggle message flags (starred, important)
  - `POST /api/query/session`: Start a database transaction
  - `POST /api/query/commit`: Commit a database transaction
  - `POST /api/query/abort`: Abort a database transaction
- **Data Flow**:
  - Messages are fetched from API and transformed to UI format
  - State changes update local store first, then persist to API
  - New messages are sent to API and added to store

### 3.5 Form Validation (if applicable)
- **Validation Strategy**: Vuelidate for new message composition
- **Validation Rules**:
  - Recipients: required, at least one valid recipient
  - Subject: optional but recommended
  - Content: required, minimum length
- **Error Handling**: Inline validation errors display below form fields

## 4. Implementation Details
### 4.1 File Structure
```
car/
├── components/message/
│   ├── MessageContainer.vue    # Main wrapper component 
│   ├── MessageSidebar.vue      # Navigation for message folders
│   ├── MessageListItem.vue     # Individual message in lists 
│   └── MessageDetail.vue       # Detailed message view
├── pages/new/message/
│   ├── index.vue               # Main messaging page
│   ├── [folder].vue            # Folder-specific views
│   └── detail/[id].vue         # Individual message view
├── composables/
│   └── useMessage.ts           # Message-related composable
├── stores/
│   └── useMessageStore.ts      # Pinia store for messages
├── service/messaging/
│   └── messaging.service.ts    # API service for messages
├── types/
│   ├── message.ts              # Core message types
│   └── collections/
│       ├── messages.ts         # DB message schema
│       ├── userMessageStates.ts # Message state tracking
│       └── messageRecipients.ts # Recipient definitions
```

### 4.2 Key Components
The messaging system consists of four main components:

1. **MessageContainer**: Acts as the parent container for the messaging interface, managing the layout and coordination between child components.

2. **MessageSidebar**: Displays the folder navigation with unread counts and allows users to switch between different message views (inbox, sent, archived, etc.).

3. **MessageListItem**: Renders individual messages in a list format, showing sender, subject preview, date, and status indicators (read/unread, starred, important).

4. **MessageDetail**: Displays the complete message content when a message is selected, with options to reply, forward, archive, or delete.

### 4.3 State Management Implementation
The messaging system uses a Pinia store with these key features:

- **Centralized Message Cache**: All loaded messages are stored in a normalized format
- **Reactive Folder Filtering**: Messages are dynamically filtered by folder
- **Optimistic Updates**: UI state changes immediately before API confirmation
- **Message Transformations**: DB messages are transformed to UI format with state information

### 4.4 Integration Points
The messaging system integrates with:

- **User System**: For sender and recipient information
- **Groups System**: For group messaging capabilities
- **Notification System**: To alert users of new messages
- **Dashboard**: For displaying message notifications and quick actions

### 4.5 UI Implementation
- **PrimeVue Components Used**:
  - `PDialog`: For displaying message composition and details
  - `PEditor`: Rich text editing for message composition
  - `PSplitButton`: For message actions
  - `PMenu`: For folder navigation
  - `PBadge`: For unread message counts
  - `PButton`: For various actions
  - `PDataTable`: For message lists
- **Custom Styling**:
  - Custom styling for read/unread messages
  - Star and important indicators with animated transitions
  - Responsive design for different screen sizes
- **Responsive Design**:
  - Sidebar collapses to top navigation on mobile
  - Message list adapts columns based on screen width
  - Composition dialog adjusts size for mobile

## 5. Testing
- **Test Approach**: Unit tests for store actions and composables, component tests for UI behavior
- **Key Test Cases**:
  - Message filtering by folder
  - State changes (read/unread, star, important)
  - Message composition and sending
  - Recipient validation
- **Test Status**: Core functionality covered, additional edge cases pending

## 6. Development Status
- [x] Feature Planning
- [x] Core Implementation
- [x] UI Implementation
- [x] API Integration
- [] Testing
- [x] Documentation
- [] Deployment

## 7. Known Issues and Limitations
1. Message threading is partially implemented but may require additional work for complex conversations
2. Large message lists may need pagination for performance optimization
3. Real-time updates require separate websocket integration

## 8. Future Enhancements
1. Advanced search functionality for messages
2. Message templates for common communications
3. Scheduled sending for messages
4. Message recall within time limit
5. Enhanced threading for complex conversations
6. Real-time chat integration

## 9. Documentation and Usage Examples

### 9.1 Component Usage
```vue
<template>
  <!-- Example usage of the MessageContainer component -->
  <MessageContainer
    :folder="currentFolder"
    :message-id="selectedMessageId"
    @folder-changed="handleFolderChange"
    @message-selected="handleMessageSelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessageContainer } from '@/components/message';
import { useMessage } from '@/composables/useMessage';

const currentFolder = ref('inbox');
const selectedMessageId = ref(null);

const { navigateToFolder } = useMessage();

const handleFolderChange = (folder: string) => {
  currentFolder.value = folder;
  navigateToFolder(folder);
};

const handleMessageSelect = (id: string) => {
  selectedMessageId.value = id;
};
</script>
```

### 9.2 Store Usage
```typescript
// Example of how to use the message store
import { useMessageStore } from '@/stores/useMessageStore';
import { storeToRefs } from 'pinia';

const messageStore = useMessageStore();
const { filteredMessages, unreadCountByFolder } = storeToRefs(messageStore);

// Fetch messages
await messageStore.fetchMessages();

// Access messages in a particular folder
const inboxMessages = computed(() => filteredMessages.value.inbox || []);

// Perform actions
await messageStore.markAsRead(messageId);
await messageStore.starMessage(messageId, true);
await messageStore.updateMessageState(messageId, 'archived');
```

### 9.3 API Usage
```typescript
// Example of messaging API interactions
import { messagingService } from '@/service/messaging/messaging.service';

// Fetch messages
const messages = await messagingService.getMessages({
  folder: 'inbox',
  limit: 20,
  offset: 0
});

// Send a new message
const newMessage = {
  subject: "Meeting Tomorrow",
  content: "<p>Let's discuss the project.</p>",
  recipientType: "user",
  userRecipients: ["user-123"],
  isInitialMessage: true
};
const result = await messagingService.sendMessage(newMessage);

// Update message state
await messagingService.updateMessageState(messageId, {
  state: 'archived',
  isRead: true
});
```

## Document Revision History

| Date | Updated By | Changes |
|------|------------|---------|
| 2023-11-15 | System | Initial document creation |
| 2023-11-16 | James Baddiley | Updated to standard format |
