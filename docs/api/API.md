# Database API Documentation

## Architecture Overview
The application uses a three-layer architecture for database operations:

1. HTTP Service Layer (`http.service.ts`)
   - Handles all HTTP communications
   - Manages request/response lifecycle
   - Handles errors and authentication

2. Database CRUD Layer (`dbNodeCRUD.service.ts`)
   - Provides generic MongoDB operations
   - Handles basic CRUD operations
   - Manages data types and transformations

3. Domain Services Layer
   - Implements business logic
   - Provides domain-specific operations
   - Uses lower layers for database access

## Creating a New Service

### 1. Define Your Data Types
```typescript
// Define your main data interface
interface YourDataType {
    _id?: string;
    // Add your specific fields
    [key: string]: any;
}
```

### 2. Create the Service Class
```typescript
export class YourService {
    private collectionName = 'your_collection_name';

    constructor(private httpService: HttpService) {}

    // Example: Get items with query
    async getItems(query: Record<string, MongoQuery>): Promise<YourDataType[]> {
        return this.httpService.get('/api/query', {
            collection: this.collectionName,
            q: query,
            h: {
                $fields: {
                    // Specify fields to return
                    _id: 1,
                    // other fields...
                }
            }
        }).then(i => i.data);
    }

    // Example: Create item
    async createItem(data: Omit<YourDataType, '_id'>): Promise<YourDataType> {
        return this.httpService.post(
            `/api/create/${this.collectionName}`, 
            data
        ).then(i => i.data);
    }
}
```

### 3. Register the Service
```typescript
export const useYourService = serviceComposableFactory(
    'yourService',
    () => new YourService(httpService)
);
```

## Query Patterns

### Basic Query Structure
```typescript
interface QueryParams {
    collection: string;
    q?: Record<string, MongoQuery>; // Query conditions
    h?: MongoQueryOptions;          // Options like sort, limit
}
```

### Common Query Patterns
```typescript
// Equality match
{ field: value }

// Array operations
{ field: { $all: ['value1', 'value2'] } }

// Existence check
{ field: { $exists: true } }

// Comparison
{ field: { $gt: value } }

// Logical operators
{ $and: [condition1, condition2] }
```

### Query Options
```typescript
interface MongoQueryOptions {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    fields?: Record<string, 1 | 0>;
}
```

## Error Handling
Every service should implement proper error handling:

```typescript
async function serviceMethod() {
    try {
        const response = await this.httpService.get(...);
        return response.data;
    } catch (error) {
        console.error('Service operation failed:', error);
        throw error;
    }
}
```

## Missing Information Needed
1. Authentication/Authorization details
2. Rate Limiting specifications
3. Database Configuration
4. Caching Strategy
5. API Versioning
6. Data Validation rules
7. Error Codes and Formats
8. Batch Operation limits

## Best Practices
1. Always use TypeScript interfaces for data models
2. Implement error handling in service methods
3. Use meaningful collection names
4. Document service methods with JSDoc
5. Follow the established pattern for service registration
6. Use the provided MongoDB query interfaces
