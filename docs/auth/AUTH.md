# Authentication System Documentation

<!--
@ai-doc-markers
{
  "source_files": [
    "/server/api/auth/[...auth].ts",
    "/middleware/auth.ts",
    "/pages/auth/login.vue",
    "/pages/auth/register.vue",
    "/pages/auth/logout.vue",
    "/pages/auth/callback.vue",
    "/components/auth/LoginForm.vue",
    "/components/auth/AuthStatusBar.vue",
    "/layouts/auth.vue",
    "/nuxt.config.ts"
  ],
  "dependencies": [
    "@sidebase/nuxt-auth",
    "@auth/core",
    "@auth/mongodb-adapter",
    "primevue",
    "bcrypt"
  ],
  "last_validated": "2024-01-22T00:00:00.000Z"
}
@end-ai-doc-markers
-->

## Current Implementation Status

The authentication system is partially implemented with the following components:

### Core Components
- Base authentication handler (`[...auth].ts`)
- Route protection middleware
- Login/Register/Logout pages
- Authentication layout
- Status bar component

### File Structure
```
├── server/api/auth/
│   └── [...auth].ts          # Auth API handler
├── middleware/
│   └── auth.ts               # Route protection
├── pages/auth/
│   ├── login.vue            # Login page
│   ├── register.vue         # Registration page
│   ├── logout.vue           # Logout handler
│   └── callback.vue         # OAuth callback
├── components/auth/
│   ├── LoginForm.vue        # Login form component
│   └── AuthStatusBar.vue    # Auth status display
└── layouts/
    └── auth.vue             # Auth pages layout
```

## Current Features

### Authentication Flow
1. Protected route access via middleware
2. Credentials-based authentication
3. Session management with JWT
4. Login/Register forms with validation
5. Logout functionality
6. Auth status display component

### Components Overview

#### Auth API Handler (`[...auth].ts`)
```typescript
// Current implementation includes:
- Credentials provider setup
- JWT token handling
- Session callbacks
```

#### Auth Middleware (`auth.ts`)
```typescript
// Features:
- Route protection
- Authentication state checking
- Login redirect handling
- Protected route management
```

#### Login Component (`LoginForm.vue`)
```typescript
// Implements:
- Email/password form
- Form validation
- Error handling
- Loading states
- PrimeVue UI components
```

#### Register Component (`register.vue`)
```typescript
// Includes:
- User registration form
- Field validation
- API integration
- Error handling
```

## UI Framework Integration

The authentication system uses PrimeVue components:
- InputText
- Password
- Button
- ProgressSpinner

## Pending Implementation

1. Database Integration
   - MongoDB adapter setup
   - User schema implementation
   - Session storage

2. Security Enhancements
   - Password hashing
   - Rate limiting
   - Email verification

3. OAuth Providers
   - Provider configuration
   - Social login buttons
   - Callback handling

4. Error Handling
   - Comprehensive error messages
   - Error boundaries
   - Toast notifications

## Required Environment Variables
```env
NUXT_AUTH_SECRET=           # Required: JWT secret key
NUXT_PUBLIC_AUTH_ORIGIN=    # Required: Auth API base URL
```

## Next Steps

1. Implement MongoDB adapter:
   - Update [...auth].ts
   - Add database connection
   - Create user model

2. Add password hashing:
   - Install bcrypt
   - Update registration flow
   - Update login validation

3. Enhance error handling:
   - Add toast notifications
   - Improve error messages
   - Add form feedback

4. Add OAuth providers:
   - Configure providers
   - Update UI
   - Test flows

## Related Components

### AuthStatusBar Usage
```vue
<AuthStatusBar /> <!-- Add to layout for persistent auth status -->
```

### Protected Route Example
```vue
<script setup>
definePageMeta({
  middleware: ['auth']
})
</script>
```

### Auth Layout Usage
```vue
<script setup>
definePageMeta({
  layout: 'auth'
})
</script>
```

## Testing Requirements

1. Authentication Flow
   - Login success/failure
   - Registration validation
   - Protected route access
   - Session persistence

2. Form Validation
   - Required fields
   - Email format
   - Password requirements

3. Error Scenarios
   - Invalid credentials
   - Network failures
   - Session expiration

## References
- [Nuxt Auth Documentation](https://sidebase.io/nuxt-auth)
- [PrimeVue Components](https://primevue.org/)
- [Auth.js (NextAuth)](https://authjs.dev/)

## Working Set Files

### Core Authentication
1. `/server/api/auth/[...auth].ts`
   - Main authentication handler
   - Manages providers and callbacks
   - Dependencies: `@auth/core`, `@sidebase/nuxt-auth`

2. `/middleware/auth.ts`
   - Route protection middleware
   - Session validation
   - Dependencies: `#auth`

### Pages
3. `/pages/auth/login.vue`
   - Login page wrapper
   - Uses: `LoginForm.vue`, `auth` layout
   
4. `/pages/auth/register.vue`
   - User registration
   - Form validation
   - Dependencies: `PrimeVue` components

5. `/pages/auth/logout.vue`
   - Logout handler
   - Session cleanup
   - Dependencies: `#auth`, `ProgressSpinner`

6. `/pages/auth/callback.vue`
   - OAuth callback handler
   - Dependencies: `ProgressSpinner`

### Components
7. `/components/auth/LoginForm.vue`
   - Login form component
   - Validation logic
   - Dependencies: `PrimeVue`, `#auth`

8. `/components/auth/AuthStatusBar.vue`
   - Auth status display
   - Quick logout
   - Dependencies: `PrimeVue`, `#auth`

### Layouts
9. `/layouts/auth.vue`
   - Authentication layout
   - Used by all auth pages
   - Dependencies: `PrimeVue` styling

### Configuration
10. `/nuxt.config.ts`
    - Auth module configuration
    - Provider settings
    - Dependencies: `@sidebase/nuxt-auth`

## File Dependencies Map
```mermaid
graph TD
    A[nuxt.config.ts] --> B([...auth].ts)
    B --> C[middleware/auth.ts]
    C --> D[pages/auth/*]
    D --> E[components/auth/*]
    D --> F[layouts/auth.vue]
    E --> F
