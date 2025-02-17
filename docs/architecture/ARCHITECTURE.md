# Project Architecture Documentation

## Directory Structure

```
car/
├── components/          # Vue components
├── composables/         # Vue composables
├── docs/               # Project documentation
├── middleware/         # Nuxt middleware
├── pages/              # Application routes/pages
├── plugins/            # Nuxt plugins
├── public/            # Static assets
├── server/            # Server-side code
├── service/           # Service layer
├── stores/            # Pinia stores
├── styles/            # Global styles
├── tests/             # Test files
└── types/             # TypeScript types
```

## Key Directories

### /server
Server-side implementation including:
- API routes under `/server/api/`
- Database operations
- Authentication handlers
- Plugin system

### /service
Service layer containing:
- Base services
- Feature-specific services
- HTTP services
- File handling
- Schema forms processing
- Event emitters
- Browser utilities

### /stores
Pinia stores for state management:
- useCardStore.ts
- useDisplayStore.ts
- useFilterStore.ts
- useGridDataStore.ts
- useMessage.ts
- useModeStore.ts
- useSearchStore.ts
- useSelectedStore.ts
- useShowStore.ts
- useSortStore.ts

### /pages
Application routes organized by feature:
- /admin - Administration pages
- /auth - Authentication pages
- /market - Market-related pages
- /new - New feature pages

### /types
TypeScript type definitions:
- Collection types
- Grid types
- Common interfaces
- Schema form types
- Message types

## Key Features

### Authentication
- Implementation: `/server/api/auth/[...auth].ts`
- Middleware: `/middleware/auth.ts`
- Protected routes handling
- Session management

### Database Operations
- MongoDB native driver
- Automatic index creation
- Collection management
- See [Database Documentation](../database/DATABASE.md)

### Service Layer
The service layer is organized into domains:
```
/service
├── cars/              # Car-related services
├── browser/           # Browser utilities
├── event-emitter/     # Event handling
├── file/             # File operations
├── http/             # HTTP services
├── media/            # Media handling
├── schema-forms/     # Form processing
└── store/            # Store utilities
```

### State Management
Pinia stores with:
- Cache management
- Service locators
- Value emitters
- Store dispatchers

## File Organization

### Components
```
/components
├── base/         # Base UI components
├── layout/       # Layout components
├── forms/        # Form components
└── features/     # Feature-specific components
```

### API Routes
```
/server/api
├── auth/         # Authentication endpoints
├── plugins/      # Server plugins
├── members.ts    # Member-related endpoints
├── users.ts      # User-related endpoints
└── notifications.ts # Notification endpoints
```

## Development Guidelines

1. New features should be organized in feature-specific directories
2. Follow the established pattern for service creation
3. Use TypeScript for all new code
4. Implement unit tests in `/tests/unit/`
5. Document API endpoints and interfaces

## Configuration

Main configuration files:
- `nuxt.config.ts` - Nuxt configuration
- Environment configuration
- Database indexes in `/server/api/plugins/db-indexes.ts`

## Testing

Test structure:
```
/tests
└── unit/        # Unit tests
```

## Related Documentation

- [Authentication Guide](../auth/AUTH.md)
- [Database Guide](../database/DATABASE.md)
- [Style Guide](../GUIDE.md)
