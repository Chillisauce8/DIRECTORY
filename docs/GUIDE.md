# AI Style Guide for Nuxt 3 / Vue 3 Application

## Project Overview

-   **Framework:** Nuxt 3 with Vue 3
-   **Language:** TypeScript
-   **UI Library:** PrimeVue
-   **Styling:** SCSS with native CSS variables
-   **Database:** MongoDB (native driver)
-   **Form Validation:** Vuelidate
-   **Testing:** Vitest

## Core Development Standards

## Use if "\_id"

Uses "\_id" throughout the application, when referencing to node/document ID's. This maintains consistency with MongoDB's native identifier format and mean there is no need to convert to different variable name (EG mapping "\_id" to "id" etc.)

### Component Structure

1. Use `<script setup lang="ts">` exclusively for component scripts
2. Follow component naming conventions:
    - Files: PascalCase (e.g., `MyComponent.vue`)
    - Root element class: kebab-case (e.g., `my-component`)

### Naming Conventions

1. Components

    - Use PascalCase for component names (e.g., UserProfile.vue, NavigationBar.vue)
    - Examples with prefixes:
        - Base/UI components: BaseButton.vue, BaseInput.vue, UiModal.vue
        - Layout components: LayoutDefault.vue, LayoutAdmin.vue
        - Feature components: UserProfile.vue, ProductCard.vue
        - Form components: FormLogin.vue, FormRegistration.vue
    - Folder structure:
        - /components/base/ - Base components
        - /components/layout/ - Layout components
        - /components/forms/ - Form components
        - /components/features/ - Feature-specific components
        - /components/[feature-name]/ - Feature-grouped components

2. Properties and Methods

    - Use camelCase for props, methods, and variables
    - Props naming:
        - Boolean props: isLoading, hasError, shouldValidate
        - Required props: append 'Required' for clarity (e.g., titleRequired)
        - Model props: modelValue (v-model default)
    - Methods naming:
        - Event handlers: handleClick, handleSubmit
        - Getters: getUserData, getFormattedDate
        - Actions: submitForm, fetchData, updateUser
        - Computed: userFullName, isFormValid
    - Event naming:
        - Use kebab-case
        - Format: [namespace]-[action] (e.g., form-submit, user-updated)

3. Composables

    - Always prefix with "use"
    - Examples by category:
        - State: useState, useStore
        - Features: useAuth, useCart
        - Utils: useFormatter, useValidation
        - API: useApi, useHttp
    - Folder structure:
        - /composables/state/
        - /composables/features/
        - /composables/utils/
        - /composables/api/

4. Pages and Routes

    - Use kebab-case for files and routes
    - Folder structure:
        - /pages/index.vue - Home page
        - /pages/[feature]/ - Feature pages
        - /pages/[feature]/[id].vue - Dynamic routes
        - /pages/admin/ - Admin pages
        - /pages/auth/ - Authentication pages

5. Store (Pinia)

    - File naming: useFeatureStore.ts
    - State properties: camelCase
    - Getters: camelCase, descriptive (e.g., filteredUsers)
    - Actions:
        - Async: fetchUsers, updateProfile
        - Sync: setUser, clearState
    - Folder structure:
        - /stores/useAuthStore.ts
        - /stores/modules/[feature]/useFeatureStore.ts

6. Plugins and Middleware

    - Plugins:
        - Feature plugins: authPlugin.ts, analyticsPlugin.ts
        - UI plugins: primeVuePlugin.ts
    - Middleware:
        - Authentication: authMiddleware.ts
        - Role-based: adminMiddleware.ts, userMiddleware.ts
    - Types:
        - Plugin types: /types/plugins/
        - Middleware types: /types/middleware/

7. Types and Interfaces
    - Interfaces: Prefix with 'I' (e.g., IUser)
    - Types: Descriptive PascalCase (e.g., UserResponse)
    - Enums: PascalCase with Enum suffix (e.g., UserRoleEnum)
    - Place in /types directory with feature-based organization

### CSS Standards

1. Structure

    - Use `<style lang="scss">` without `scoped`
    - Employ native CSS nesting
    - Match CSS nesting to component structure
    - Keep styles DRY (Don't Repeat Yourself)

2. Class Organization

    ```scss
    // Helper Classes
    // Reusable utility classes here

    // Semantic Classes - in Template order
    .component-name {
        // Component styles following template structure
    }
    ```

3. Variables

    - Use CSS variables for theming:
        ```css
        :root {
            --primary-color: #3498db;
        }
        ```
    - Use SASS variables for breakpoints only:
        - $sm, $md, $lg, $xl, $xxl (2xl)
    - Define SASS variables in external .scss files only

4. Best Practices
    - No inline styles
    - No scoped styles
    - No component-level SASS variables
    - No CSS variables in media queries

### Database Guidelines

-   Use MongoDB native driver
-   Create modular, reusable database operations

### Testing

-   Use Vitest for unit testing
-   Store tests in `/tests/unit/` directory

### Form Validation

-   Implement using Vuelidate
-   Provide clear error messages

## Important Rules

1. Never replace existing code with placeholder comments
2. Always provide complete code changes
3. Follow Nuxt 3's folder structure conventions
4. Write clear, concise comments
5. Regularly refactor for maintainability

## Documentation Structure

The `/docs` folder contains detailed documentation for key aspects of the application:

- [Authentication Setup](./auth/AUTH.md) - Complete authentication system setup and configuration
- [Database Structure](./database/DATABASE.md) - Database schema, indexes, and relationships
- [Project Architecture](./architecture/ARCHITECTURE.md) - Application structure and design decisions
- [Development Workflow](./workflow/WORKFLOW.md) - Development processes and guidelines

## Additional Resources

-   [PrimeVue Documentation](https://primevue.org/)
-   [Nuxt 3 Best Practices](https://nuxt.com/docs/guide/concepts/auto-imports)
