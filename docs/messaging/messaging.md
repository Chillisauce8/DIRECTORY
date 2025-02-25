# Messaging System Documentation

## Overview

The messaging system provides a complete solution for handling user-to-user and user-to-group communications within the application. Built with a Gmail-like interface, the system supports core messaging features including message composition, organization, thread management, and state tracking.

## Architecture

### Core Components

- **Message Store**: Central state management for messages via Pinia
- **Message Composable**: Provides reusable messaging logic
- **Message UI Components**: Modular components for message display
- **Message Service**: Handles API communication for messages

### File Structure

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

## Data Model

### Message Types

#### Database Message Schema
```typescript
interface Message extends _Node {
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
```

#### UI Message
The UI version of messages includes state information:

```typescript
interface MessageUI extends Omit<DBMessage, '_type' | '_hash'> {
  messageState?: {
    state?: MessageState;
    isStarred: boolean;
    isImportant: boolean;
    isRead: boolean;
  };
}
```

### Message State

Message state is tracked per user:

```typescript
type MessageState = 'inbox' | 'sent' | 'archived' | 'trash';

interface UserMessageState {
  userId: string;
  messageId: string;
  state: MessageState;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
}
```

## Folder System

The messaging system uses a Gmail-style folder/label approach:

### Primary Folders
- **Inbox**: Unarchived messages sent to the user
- **Sent**: Messages sent by the user
- **Archived**: Messages moved out of the inbox
- **Trash**: Deleted messages

### Special Folders
- **Starred**: Messages marked with a star
- **Important**: Messages flagged as important

> **Note**: Messages always exist in exactly one primary folder (inbox, sent, archived, trash) and can simultaneously appear in any number of special folders (starred, important).

## State Management

### Message Store

The `useMessageStore` provides centralized state management with these key features:

- Message fetching and caching
- Filtering messages by folder
- Message state tracking (read/unread, starred, important)
- Actions for common message operations

### Message Composable

The `useMessage` composable provides a simplified API for components to interact with messages:

- Current folder tracking
- Message selection
- Common message actions (mark as read, star, etc.)
- Message transformations

## UI Components

### MessageSidebar

Navigation component displaying message folders with unread counts.

Key features:
- Folder navigation
- Message count badges 
- Responsive design (horizontal on mobile, vertical on desktop)

### MessageListItem

Displays a single message in a list format.

Key features:
- Sender information
- Subject preview
- Date/time
- Read/unread state
- Star/important flags

### MessageDetail

Displays the full content of a message.

Key features:
- Complete message content
- Sender information
- Reply functionality
- Dialog-based display

## Routing

The messaging system uses the following routes:

- `/new/message` - Main message view
- `/new/message/[folder]` - Folder-specific views
  - Example folders: inbox, sent, starred, important, archived, trash
- `/new/message/detail/[id]` - Individual message view

## Data Flow

1. **Message Loading**:
   - Messages are fetched via `messaging.service.ts`
   - Transformed using `transformMessageForUI()`
   - Stored in the message store

2. **Message Display**:
   - The store provides filtered messages by folder
   - Components reactively display messages from the store

3. **Message Actions**:
   - UI triggers actions (star, archive, etc.)
   - Actions update local state via the store
   - Changes are persisted to the backend via the service

## Usage Examples

### Accessing Messages in a Component

```typescript
// Import the store or composable
const messageStore = useMessageStore();
const { filteredMessages } = storeToRefs(messageStore);

// Access messages in a particular folder
const inboxMessages = computed(() => filteredMessages.value.inbox || []);
```

### Performing Message Actions

```typescript
// Using the store
const messageStore = useMessageStore();
await messageStore.markAsRead(messageId);
await messageStore.starMessage(messageId, true);

// Using the composable
const message = useMessage();
message.markAsRead(messageId);
message.toggleStar(messageId);
```

### Creating a New Message

```typescript
const newMessage = {
  subject: "Meeting Tomorrow",
  content: "<p>Let's discuss the project.</p>",
  recipientType: "user",
  userRecipients: ["user-123"],
  isInitialMessage: true,
  // Other required fields...
};

const messageStore = useMessageStore();
await messageStore.sendMessage(newMessage);
```

## Debugging

The messaging system includes extensive debug logging:

- Folder count tracking
- Message state change monitoring
- Special folder history for starred/important messages

## Best Practices

1. **Always use transformations**: When working with messages, ensure proper transformation between DB and UI formats
2. **Leverage the store for state**: Avoid direct API calls when store methods are available
3. **Handle loading states**: Messages may not be immediately available, use proper loading indicators
4. **Respect folder system**: Don't manually change primary folders; use the proper actions

## Known Limitations

1. Message threading is partially implemented but may require additional work for complex conversations
2. Large message lists may need pagination for performance optimization
3. Real-time updates require separate websocket integration
