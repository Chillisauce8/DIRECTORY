# Authentication System Documentation

<!--
@ai-doc-markers
{
  "source_files": [
    "/server/api/auth/[...auth].ts",
    "/middleware/auth.ts"
  ],
  "dependencies": ["@sidebase/nuxt-auth", "@auth/core"],
  "last_validated": "2024-01-21T00:00:00.000Z"
}
@end-ai-doc-markers
-->

## Overview

The application uses [@sidebase/nuxt-auth](https://sidebase.io/nuxt-auth/getting-started) for authentication, which is built on top of Auth.js (formerly NextAuth.js).

## Key Files

- `/server/api/auth/[...].ts` - Authentication API handler
- `/middleware/auth.ts` - Route protection middleware
- `/pages/auth/*` - Authentication pages

## Usage

### Composables
```typescript
// Access auth state and methods using the provided composable
const { data, signIn, signOut } = useAuth()
```

### Route Protection
```typescript
// In middleware/auth.ts
defineNuxtRouteMiddleware((to) => {
  const { data } = useAuth()
  // ...route protection logic
})
```

## Authentication Flow

1. User attempts to access protected route
2. Middleware checks authentication state
3. Unauthenticated users redirected to login
4. Credentials validated against configured provider
5. Session established on successful auth

## Configuration

In `nuxt.config.ts`:
```typescript
{
  modules: ['@sidebase/nuxt-auth'],
  auth: {
    baseURL: process.env.NUXT_PUBLIC_AUTH_ORIGIN,
    provider: {
      type: 'authjs'
    }
  }
}
```

## Database Collections

### Users Collection
```typescript
interface IUser {
  _id: ObjectId
  email: string          // Required, unique email address
  password?: string      // Hashed password
  name?: string          // Full name
  emailVerified?: Date   // Email verification timestamp
  image?: string         // Profile image URL
  createdAt: Date       // Required, account creation timestamp
  updatedAt: Date       // Required, last update timestamp
}
```

#### JSON Schema
```json
{
  "type": "object",
  "required": ["email", "createdAt", "updatedAt"],
  "properties": {
    "_id": {
      "type": "objectId"
    },
    "email": {
      "type": "string",
      "title": "Email Address",
      "description": "User's email - must be unique"
    },
    "password": {
      "type": "string",
      "title": "Password",
      "description": "Hashed password"
    },
    "name": {
      "type": "string",
      "title": "Full Name",
      "description": "User's full name"
    },
    "emailVerified": {
      "type": "date",
      "description": "When the email was verified"
    },
    "image": {
      "type": "string",
      "description": "URL to user's profile image"
    },
    "createdAt": {
      "type": "date",
      "description": "Timestamp of account creation"
    },
    "updatedAt": {
      "type": "date",
      "description": "Timestamp of last update"
    }
  }
}
```

### Sessions Collection
```typescript
interface ISession {
  _id: ObjectId;
  userId: ObjectId;      // Required, reference to user collection
  expires: Date;        // Required, session expiration timestamp
  sessionToken: string; // Required, unique session identifier
}
```

#### JSON Schema
```json
{
  "type": "object",
  "required": ["userId", "expires", "sessionToken"],
  "properties": {
    "_id": {
      "type": "objectId"
    },
    "userId": {
      "type": "objectId",
      "description": "Reference to user collection"
    },
    "expires": {
      "type": "date",
      "description": "Session expiration timestamp"
    },
    "sessionToken": {
      "type": "string",
      "description": "Unique session identifier"
    }
  }
}
```

### Accounts Collection
```typescript
interface IAccount {
  _id: ObjectId;
  userId: ObjectId;          // Required, reference to user collection
  type: 'oauth' | 'email' | 'credentials';  // Required
  provider: string;          // Required, provider name
  providerAccountId: string; // Required, unique provider ID
  refresh_token?: string;    // OAuth refresh token
  access_token?: string;     // OAuth access token
  expires_at?: number;       // Token expiration timestamp
  token_type?: string;       // Type of OAuth token
  scope?: string;           // OAuth scopes
  id_token?: string;        // OAuth ID token
  session_state?: string;   // OAuth session state
}
```

#### JSON Schema
```json
{
  "type": "object",
  "required": ["userId", "type", "provider", "providerAccountId"],
  "properties": {
    "_id": {
      "type": "objectId"
    },
    "userId": {
      "type": "objectId",
      "description": "Reference to user collection"
    },
    "type": {
      "type": "string",
      "enum": ["oauth", "email", "credentials"],
      "description": "Type of account"
    },
    "provider": {
      "type": "string",
      "description": "Provider name (google, github, etc)"
    },
    "providerAccountId": {
      "type": "string",
      "description": "Unique ID from provider"
    },
    "refresh_token": {
      "type": "string",
      "description": "OAuth refresh token"
    },
    "access_token": {
      "type": "string",
      "description": "OAuth access token"
    },
    "expires_at": {
      "type": "long",
      "description": "Token expiration timestamp"
    },
    "token_type": {
      "type": "string",
      "description": "Type of OAuth token"
    },
    "scope": {
      "type": "string",
      "description": "OAuth scopes"
    },
    "id_token": {
      "type": "string",
      "description": "OAuth ID token"
    },
    "session_state": {
      "type": "string",
      "description": "OAuth session state"
    }
  }
}
```

### VerificationTokens Collection
```typescript
interface IVerificationToken {
  _id: ObjectId;
  identifier: string;    // Required, usually user's email
  token: string;        // Required, hashed verification token
  expires: Date;        // Required, token expiration timestamp
}
```

#### JSON Schema
```json
{
  "type": "object",
  "required": ["identifier", "token", "expires"],
  "properties": {
    "_id": {
      "type": "objectId"
    },
    "identifier": {
      "type": "string",
      "description": "Usually the user's email"
    },
    "token": {
      "type": "string",
      "description": "Hashed verification token"
    },
    "expires": {
      "type": "date",
      "description": "Token expiration timestamp"
    }
  }
}
```

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

#### JSON Schema
```json
{
  "type": "object",
  "required": ["userId", "secret", "enabled"],
  "properties": {
    "_id": {
      "type": "objectId"
    },
    "userId": {
      "type": "objectId",
      "description": "Reference to user collection"
    },
    "secret": {
      "type": "string",
      "description": "Encrypted TOTP secret"
    },
    "enabled": {
      "type": "bool",
      "description": "Whether 2FA is enabled"
    },
    "backupCodes": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of hashed backup codes"
    },
    "verifiedAt": {
      "type": "date",
      "description": "When 2FA was verified"
    }
  }
}
```

## Security Considerations

1. Session Management
   - Sessions stored in MongoDB
   - Automatic session cleanup
   - Secure session tokens

2. Route Protection
   - Middleware-based access control
   - Authentication state verification
   - Protected API routes

3. Environment Security
   - Secure auth secret configuration
   - CORS settings
   - HTTP-only cookies

## Related Documentation
- [Nuxt Auth Documentation](https://sidebase.io/nuxt-auth/getting-started)
- [Auth.js Documentation](https://authjs.dev/)
