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

## Additional Resources

-   [PrimeVue Documentation](https://primevue.org/)
-   [Nuxt 3 Best Practices](https://nuxt.com/docs/guide/concepts/auto-imports)
