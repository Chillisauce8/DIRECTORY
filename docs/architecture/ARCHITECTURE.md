# Project Architecture Documentation

## Directory Structure

```
DIRECTORY/
├── base/                # Base layer containing shared code
│   ├── components/      # Shared Vue components
│   ├── composables/     # Shared Vue composables
│   ├── middleware/      # Shared Nuxt middleware
│   ├── pages/           # Shared application routes/pages
│   ├── plugins/         # Shared Nuxt plugins
│   ├── public/          # Shared static assets
│   ├── server/          # Shared server-side code
│   ├── service/         # Shared service layer
│   ├── stores/          # Shared Pinia stores
│   ├── assets/          # Shared styles and assets
│   ├── tests/           # Shared test files
│   ├── types/           # Shared TypeScript types
│   └── nuxt.config.ts   # Base layer configuration
│
├── car/                 # Car extension app
│   ├── components/      # Car-specific components
│   ├── composables/     # Car-specific composables
│   ├── pages/           # Car-specific routes/pages
│   ├── plugins/         # Car-specific plugins
│   ├── public/          # Car-specific static assets
│   ├── server/          # Car-specific server code
│   ├── service/         # Car-specific service layer
│   ├── stores/          # Car-specific Pinia stores
│   ├── assets/          # Car-specific styles and assets
│   ├── tests/           # Car-specific tests
│   ├── types/           # Car-specific TypeScript types
│   └── nuxt.config.ts   # Car app config (extends base)
│
├── docs/                # Project documentation
└── node_modules/        # Shared dependencies
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

## Nuxt Layers Architecture

This project implements Nuxt Layers, a powerful feature that allows for code sharing and extension across multiple applications.

### Layers Structure

```
DIRECTORY/
├── base/             # Base layer containing shared code
│   ├── components/   # Shared components
│   ├── composables/  # Shared composables
│   ├── layouts/      # Shared layouts
│   ├── pages/        # Shared pages
│   ├── assets/       # Shared assets
│   ├── ...           # Other shared directories
│   └── nuxt.config.ts # Base layer configuration
│
├── car/              # Car extension app
│   ├── components/   # Car-specific components
│   ├── pages/        # Car-specific pages
│   ├── ...           # Other car-specific directories
│   └── nuxt.config.ts # Car app config (extends base)
│
├── wedding/          # Wedding extension app (if applicable)
│   └── ...
│
└── adventure/        # Adventure extension app (if applicable)
    └── ...
```

### How Layers Work

Nuxt Layers function as an inheritance mechanism:

1. **Base Layer**: Contains all shared code, components, layouts, and functionality
2. **Extension Apps**: Extend the base layer, inheriting all its capabilities
3. **Override Mechanism**: Files in extension apps take precedence over those in the base layer with the same path

For example, if both the base layer and car app have `/pages/index.vue`, the car app's version will be used when running the car app.

### Layer Configuration

Each extension app uses the `extends` property in its `nuxt.config.ts`:

```typescript
// car/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['../base'],
  // App-specific configuration...
})
```

### Common Issues and Solutions

#### 1. Path Resolution Problems

**Issue**: Components or assets from the base layer can't be found.

**Solution**: Configure proper aliases in each extension app's Nuxt config:

```typescript
// In extension app's nuxt.config.ts
alias: {
  '@base': resolve(__dirname, '../base'),
  '@': resolve(__dirname, './'),
  '~': resolve(__dirname, './'),
}
```

#### 2. SCSS/CSS Import Failures

**Issue**: SCSS imports like `@import "~/assets/css/mixins"` fail in extension apps.

**Solutions**:
- Use `includePaths` in Vite configuration to specify resolution paths
- Create bridge files in extension apps that forward to base layer files
- Configure CSS aliases properly

```typescript
// Extension app's nuxt.config.ts
vite: {
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [
          resolve(__dirname, '../base/assets/css'),
          resolve(__dirname, './assets/css')
        ]
      }
    }
  },
  resolve: {
    alias: [
      {
        find: /^~\/assets\/css/,
        replacement: resolve(__dirname, '../base/assets/css')
      }
    ]
  }
}
```

#### 3. Module Availability

**Issue**: Modules configured in the base layer aren't automatically available in extension apps.

**Solution**: Explicitly register required modules in each extension app's configuration.

```typescript
// In extension app's nuxt.config.ts
modules: [
  require.resolve('@nuxtjs/color-mode')
  // Other required modules
]
```

#### 4. Component Registration

**Issue**: Components from the base layer aren't automatically registered in extension apps.

**Solution**: Use explicit component registration:

```typescript
// In extension app's nuxt.config.ts
components: [
  { path: '../base/components', pathPrefix: false },
  { path: '../base/layouts', pathPrefix: false },
  { path: './components', pathPrefix: false },
  { path: './layouts', pathPrefix: false }
]
```

### Best Practices for Layers

1. **Minimize Configuration Duplication**: Only include necessary configuration in extension apps
2. **Use Explicit Path Resolution**: Always use absolute paths with `resolve()`
3. **Bridge Files Strategy**: Create forwarding files for assets and styles
4. **Test Changes in All Apps**: When modifying the base layer, test all extension apps
5. **Layer-First Thinking**: Design components and features with layers in mind
6. **Consistent Naming**: Use consistent naming across layers for easier maintenance
7. **Module Installation**: Install build infrastructure dependencies (like tailwindcss, es-module-lexer, vite plugins) at the root level, while app-specific dependencies can be installed in their respective apps
8. **Dependency Management**: When receiving module resolution errors, check if the dependency needs to be installed at the root level rather than in individual layers

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
- [Style Guide](../STYLE_GUIDE.md)
