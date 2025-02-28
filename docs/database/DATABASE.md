# Database Structure Documentation

## Overview

The application uses MongoDB with native driver integration. All collections use MongoDB's native `_id` field as the primary identifier.

## Collections and Indexes

### Users Collection
```typescript
interface IUser {
    _id: ObjectId;
    email: string;          // Required, unique
    password?: string;      // Hashed password
    name?: string;         // Full name
    emailVerified?: Date;  // Email verification timestamp
    image?: string;        // Profile image URL
    createdAt: Date;       // Required
    updatedAt: Date;       // Required
}
```

**Required Fields:**
- email
- createdAt
- updatedAt

**Indexes:**
- `{ "email": 1 }` (unique) - Ensures email uniqueness and optimizes login queries

**Timestamps:**
- `createdAt` - Set on document creation
- `updatedAt` - Updated on every document modification

### Accounts Collection
```typescript
interface IAccount {
    _id: ObjectId;
    userId: ObjectId;          // Required, reference to user collection
    type: 'oauth' | 'email' | 'credentials';  // Required, type of account
    provider: string;          // Required, provider name
    providerAccountId: string; // Required, unique ID from provider
    refresh_token?: string;    // OAuth refresh token
    access_token?: string;     // OAuth access token
    expires_at?: number;       // Token expiration timestamp
    token_type?: string;       // Type of OAuth token
    scope?: string;           // OAuth scopes
    id_token?: string;        // OAuth ID token
    session_state?: string;   // OAuth session state
}
```

**Required Fields:**
- userId
- type
- provider
- providerAccountId

**Indexes:**
- `{ "provider": 1, "providerAccountId": 1 }` (unique) - Ensures unique provider accounts
- `{ "userId": 1 }` - Optimizes user account lookups

**Properties:**
- OAuth-specific fields are optional and only used with OAuth providers
- `type` is restricted to: "oauth", "email", or "credentials"
- `provider` identifies external auth providers (e.g., google, github)

### Sessions Collection
```typescript
interface ISession {
    _id: ObjectId;
    userId: ObjectId;      // Required, reference to user collection
    expires: Date;        // Required, session expiration timestamp
    sessionToken: string; // Required, unique session identifier
}
```

**Required Fields:**
- userId
- expires
- sessionToken

**Indexes:**
- `{ "sessionToken": 1 }` (unique) - Ensures unique session tokens and optimizes session lookups
- `{ "userId": 1 }` - Optimizes user session queries

**Properties:**
- `userId`: Links to Users collection
- `expires`: Used for automatic session cleanup
- `sessionToken`: Secure, unique identifier for the session

### VerificationTokens Collection
```typescript
interface IVerificationToken {
    _id: ObjectId;
    identifier: string;    // Required, usually user's email
    token: string;        // Required, hashed verification token
    expires: Date;        // Required, token expiration timestamp
}
```

**Required Fields:**
- identifier
- token
- expires

**Indexes:**
- `{ "token": 1 }` (unique) - Ensures unique tokens
- `{ "identifier": 1, "token": 1 }` (unique) - Ensures unique identifier/token combinations

**Properties:**
- `identifier`: Typically stores the user's email
- `token`: Stores the hashed verification token
- `expires`: Automatic token expiration handling

### TwoFactorAuth Collection
```typescript
interface ITwoFactorAuth {
    _id: ObjectId;
    userId: ObjectId;      // Required, reference to user collection
    secret: string;       // Required, encrypted TOTP secret
    enabled: boolean;     // Required, whether 2FA is enabled
    backupCodes?: string[]; // List of hashed backup codes
    verifiedAt?: Date;    // When 2FA was verified
}
```

**Required Fields:**
- userId
- secret
- enabled

**Indexes:**
- `{ "userId": 1 }` (unique) - Ensures one 2FA configuration per user

**Properties:**
- `secret`: Stores the encrypted TOTP secret
- `backupCodes`: Array of hashed recovery codes
- `enabled`: Controls whether 2FA is active
- `verifiedAt`: Tracks when 2FA was verified

## Database Operations

The database indexes are automatically created on application startup through the plugin system:
- Location: `/server/api/plugins/db-indexes.ts`
- Execution: Runs during Nitro server initialization

## Relationships

1. User → Accounts (One-to-Many)
   - Users can have multiple provider accounts
   - Linked via `userId` in Accounts collection

2. User → Sessions (One-to-Many)
   - Users can have multiple active sessions
   - Linked via `userId` in Sessions collection

3. User → TwoFactorAuth (One-to-One)
   - Each user can have one 2FA configuration
   - Linked via `userId` in TwoFactorAuth collection

## Best Practices

1. Always use MongoDB's native `_id` field for references
2. Utilize provided indexes for queries
3. Include appropriate compound indexes for common query patterns
4. Monitor index usage and performance

## Security Considerations

1. Indexes support unique constraints for:
   - User emails
   - Provider accounts
   - Session tokens
   - Verification tokens
   - 2FA configurations

2. Access Patterns:
   - User lookups by email
   - Session validation by token
   - Account verification by token
   - 2FA verification by userId
