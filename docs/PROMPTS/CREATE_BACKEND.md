# Comprehensive MongoDB REST API Generation Prompt

## Task
Generate a modern, scalable MongoDB REST API backend for a Vue 3/Nuxt 3 application without using Mongoose. The code should be written in TypeScript using the composition API.

## Important Constraints
- Split generation into manageable chunks to handle memory limitations
- Generate files one folder at a time (e.g., first the config folder, then utils, etc.)
- Focus on simplicity, readability, and well-commented code
- Use direct MongoDB driver interactions
- Use modern JavaScript/TypeScript features
- Provide laymen's terms comments for complex functions

## File Structure
Please create the following structure in the `/backend` folder:

```
/backend
├── config/
│   ├── db.ts                 # MongoDB connection configuration
│   └── env.ts                # Environment configuration
├── types/
│   ├── api-response.ts       # API response type definitions
│   ├── auth.ts               # Authentication types
│   └── query.ts              # Query parameter types
├── utils/
│   ├── auth.ts               # JWT utilities
│   ├── error-handler.ts      # Error handling utilities
│   ├── object-id.ts          # MongoDB ObjectId helpers
│   └── query-parser.ts       # Query string parsing
├── middleware/
│   ├── auth.ts               # Authentication middleware
│   ├── collection-access.ts  # Collection access control
│   └── error.ts              # Error handling middleware
├── services/
│   ├── db.ts                 # MongoDB connection service
│   └── collection.ts         # Generic collection operations
└── api/v1/
    ├── [collection]/
    │   ├── index.get.ts      # List resources
    │   ├── index.post.ts     # Create resource
    │   ├── count.get.ts      # Count resources
    │   ├── [id].get.ts       # Get resource by ID
    │   ├── [id].put.ts       # Replace resource
    │   ├── [id].patch.ts     # Update resource
    │   ├── [id].delete.ts    # Delete resource
    │   ├── bulk.post.ts      # Bulk create
    │   └── bulk.patch.ts     # Bulk update
    └── auth/
        ├── login.post.ts     # User login
        ├── logout.post.ts    # User logout
        └── refresh.post.ts   # Refresh token
```

## Implementation Details

### 1. Configuration Files
First, generate the config files:
- `db.ts`: MongoDB connection configuration with proper types
- `env.ts`: Runtime configuration access with defaults

### 2. Type Definitions
Next, create the type definition files:
- Base type interfaces for API responses
- Authentication types (User, Token, etc.)
- Query parameters typing (filtering, sorting, pagination)

### 3. Utility Functions
Then create utility files with these key features:
- JWT generation and validation
- Consistent error handling
- MongoDB ObjectId validation and conversion
- Query string parsing for filtering, sorting, and pagination

### 4. Middleware
Create middleware with these features:
- Authentication checking
- Collection-level authorization
- Global error handling

### 5. Services
Implement core services:
- Database connection singleton
- Generic collection CRUD operations

### 6. API Endpoints
Finally, implement the API endpoints with these features:
- Generic collection routes that handle any collection
- Authentication routes
- Support for all REST operations (GET, POST, PUT, PATCH, DELETE)
- Query parameter handling (filtering, sorting, pagination)

## Important Requirements

### For Database Operations
- Use MongoDB native driver (not Mongoose)
- Implement connection pooling
- Provide proper error handling
- Support for MongoDB ObjectId conversion

### For API Endpoints
- Support all listed query parameters:
  - Filtering: `?filter[field]=value` and `?filter[field][$gt]=value`
  - Pagination: `?limit=20&page=2` or `?limit=20&after=lastId`
  - Sorting: `?sort=field` and `?sort=-field` (descending)
  - Field selection: `?fields=name,email` or `?fields=-password`
- Return consistent response format: `{ data: [], meta: {} }` for lists
- Return appropriate HTTP status codes
- Validate inputs

### Authentication
- Use JWT with refresh tokens
- Implement role-based access control
- Securely handle passwords
- Include middleware for protected routes

### Code Quality
- Follow consistent naming conventions
- Provide detailed comments, especially for complex logic
- Include type definitions for all functions and variables
- Follow Nuxt 3 best practices for server routes
- Make code as simple and elegant as possible

## Generation Strategy
To handle memory limitations:
1. Generate files in logical groups (e.g., by folder)
2. Start with core utilities and types
3. Build up to more complex endpoints
4. One folder at a time, generate all files in that folder before moving to the next

Would you like me to start generating any specific part of this structure first?