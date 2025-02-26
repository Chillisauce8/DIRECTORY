# MongoDB REST API v1 Documentation

This documentation provides a comprehensive reference for interacting with the MongoDB REST API backend.

## Table of Contents

- [Backend Structure](#backend-structure)
- [Authentication](#authentication)
- [Generic Collection Endpoints](#generic-collection-endpoints)
- [Query Parameters](#query-parameters)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Backend Structure

```
/backend
├── config/                  # Configuration files
│   ├── db.ts                # MongoDB connection configuration
│   └── env.ts               # Environment variable management
├── types/                   # TypeScript type definitions
│   ├── api-response.ts      # API response type definitions
│   ├── auth.ts              # Authentication types
│   └── query.ts             # Query parameter types
├── utils/                   # Utility functions
│   ├── auth.ts              # JWT utilities
│   ├── error-handler.ts     # Error handling utilities
│   ├── object-id.ts         # MongoDB ObjectId helpers
│   └── query-parser.ts      # Query string parsing
├── middleware/              # Express middleware
│   ├── auth.ts              # Authentication middleware
│   ├── collection-access.ts # Collection access control
│   └── error.ts             # Error handling middleware
├── services/                # Business logic services
│   ├── db.ts                # Database connection service
│   └── collection.ts        # Generic collection operations
└── api/v1/                  # API endpoints
    ├── [collection]/        # Dynamic collection routes
    │   ├── index.get.ts     # List resources
    │   ├── index.post.ts    # Create resource
    │   ├── count.get.ts     # Count resources
    │   ├── [id].get.ts      # Get resource by ID
    │   ├── [id].put.ts      # Replace resource
    │   ├── [id].patch.ts    # Update resource
    │   ├── [id].delete.ts   # Delete resource
    │   ├── bulk.post.ts     # Bulk create
    │   └── bulk.patch.ts    # Bulk update
    └── auth/                # Authentication routes
        ├── login.post.ts    # User login
        ├── logout.post.ts   # User logout
        └── refresh.post.ts  # Refresh token
```

## Authentication

The API uses JWT (JSON Web Token) based authentication:

1. **Access Tokens**: Short-lived tokens for API access
2. **Refresh Tokens**: Long-lived tokens stored in the database for obtaining new access tokens

### Authentication Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/v1/auth/login` | POST | Authenticate and receive tokens | `{ email, password }` | Access & refresh tokens + user data |
| `/api/v1/auth/logout` | POST | Invalidate refresh token | `{ refreshToken }` | Success message |
| `/api/v1/auth/refresh` | POST | Get new access token | `{ refreshToken }` | New access & refresh tokens |

### Using Authentication

1. Add the access token to API requests in the Authorization header:
   ```
   Authorization: Bearer <access-token>
   ```

2. When the access token expires, use the refresh token to get a new one.

## Generic Collection Endpoints

The API provides standard CRUD operations for any MongoDB collection through generic endpoints.

| Endpoint | Method | Description | Authentication | Request Body |
|----------|--------|-------------|----------------|-------------|
| `/api/v1/[collection]` | GET | List resources | Optional | - |
| `/api/v1/[collection]` | POST | Create resource | Required | JSON object |
| `/api/v1/[collection]/count` | GET | Count resources | Optional | - |
| `/api/v1/[collection]/[id]` | GET | Get resource by ID | Optional | - |
| `/api/v1/[collection]/[id]` | PUT | Replace resource | Required | JSON object |
| `/api/v1/[collection]/[id]` | PATCH | Update resource | Required | JSON object |
| `/api/v1/[collection]/[id]` | DELETE | Delete resource | Required | - |
| `/api/v1/[collection]/bulk` | POST | Bulk create | Required | Array of objects |
| `/api/v1/[collection]/bulk` | PATCH | Bulk update | Required | `{ filter, update }` |

Replace `[collection]` with your collection name (e.g., `users`, `products`).

## Query Parameters

The API supports advanced querying capabilities through URL parameters.

### Filtering

Filter results using the `filter` parameter:

```
/api/v1/users?filter[field]=value
/api/v1/users?filter[age][$gt]=30
```

Supported operators: `$eq`, `$gt`, `$gte`, `$in`, `$lt`, `$lte`, `$ne`, `$nin`, `$regex`

### Pagination

Two pagination methods are supported:

1. **Page-based pagination**:
   ```
   /api/v1/users?page=2&limit=10
   ```

2. **Cursor-based pagination**:
   ```
   /api/v1/users?after=lastId&limit=10
   ```

Default limit is 20, maximum is 100.

### Sorting

Sort results using the `sort` parameter:

```
/api/v1/users?sort=name          # Ascending sort
/api/v1/users?sort=-createdAt     # Descending sort
/api/v1/users?sort=name,-age      # Multiple fields
```

### Field Selection

Select which fields to include/exclude:

```
/api/v1/users?fields=name,email              # Include only these fields
/api/v1/users?fields=-password,-internalData  # Exclude these fields
```

## Response Format

All API responses follow a consistent format:

### Success Responses

Single resource:

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    "_id": "objectId",
    "field1": "value1",
    "field2": "value2"
  }
}
```

List of resources:

```json
{
  "success": true,
  "message": "Optional success message",
  "data": [
    {
      "_id": "objectId1",
      "field1": "value1"
    },
    {
      "_id": "objectId2",
      "field1": "value2"
    }
  ],
  "meta": {
    "totalCount": 42,
    "limit": 10,
    "page": 2,
    "pageCount": 5,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* Optional error details */ }
  }
}
```

Common error codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `DATABASE_ERROR`, `SERVER_ERROR`

## Error Handling

The API handles errors consistently with appropriate HTTP status codes:

| Status Code | Meaning | When It's Used |
|-------------|---------|---------------|
| 400 | Bad Request | Invalid input, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Not allowed to access resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate entry) |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side error |

## Examples

### Authentication

**Login:**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Refresh Token:**

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### CRUD Operations

**List resources with filtering, sorting and pagination:**

```http
GET /api/v1/products?filter[category]=electronics&filter[price][$lt]=500&sort=-createdAt&page=2&limit=10
Authorization: Bearer your-access-token
```

**Create a resource:**

```http
POST /api/v1/products
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "name": "New Product",
  "price": 49.99,
  "category": "electronics"
}
```

**Update a resource:**

```http
PATCH /api/v1/products/60d21b4667d0d8992e610c85
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "price": 45.99,
  "inStock": true
}
```

**Bulk update:**

```http
PATCH /api/v1/products/bulk
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "filter": { "category": "electronics" },
  "update": { "featured": true }
}
```

## Collection-Specific Considerations

When creating new endpoints for specific collections, follow these conventions:

1. Place custom endpoints in the appropriate collection folder
2. Use the same response format as generic endpoints
3. Follow the same authentication patterns
4. Reuse the CollectionService for database operations

Example of a custom endpoint:

```typescript
// filepath: /backend/api/v1/products/featured.get.ts

import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../../services/collection';
import { createListResponse } from '../../../types/api-response';
import { asyncHandler } from '../../../middleware/error';

export default asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const collectionService = new CollectionService('products');
  
  const { data, meta } = await collectionService.findMany({
    filter: { featured: true },
    sort: { createdAt: -1 }
  });
  
  res.json(createListResponse(data, meta, 'Retrieved featured products'));
});
```