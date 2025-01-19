# AI Style Guide for Nuxt 3 / Vue 3 Application

## Overview

This document provides style and coding standards to ensure consistent, clean, and maintainable code in the Nuxt 3 / Vue 3 application.

### Key Context

-   **Framework:** Nuxt 3 with Vue 3
-   **Language:** TypeScript
-   **UI Library:** [PrimeVue](https://primevue.org/)
-   **Styling:** SCSS with native CSS variables
-   **Database:** MongoDB with its native driver
-   **Form Validation:** Vuelidate

---

## Coding Best Practices

### General Guidelines

1. Follow Nuxt 3's best practices for:
    - Folder structure
    - File naming conventions
    - Code formatting
2. Adhere to the **DRY (Don't Repeat Yourself)** principle.
3. Write clear and concise comments explaining the purpose and behavior of code blocks.
4. Use `<script setup lang="ts">` exclusively for scripts in components.

---

#CSS

## Component Styling

### Structure

-   **Style Tags:**
    ```html
    <style lang="scss"></style>
    ```
-   **Outer Wrapper Class:**
    The root element of each component must have a class named after the component in kebab-case.  
    For example:
    ```html
    <template>
        <div class="my-component">...</div>
    </template>
    ```
-   **CSS Nesting:**  
    Use native CSS nesting to scope styles within the component class. Example:

    ```scss
    .my-component {
        // styles
        .child-element {
            // styles
            .grandchild-element {
                // styles
                .great-grandchild-element {
                    // styles
                }
            }
        }
    }
    ```

-   Nest the css as close as possible and sensible to the HTML component structure (where html elements have named classes).
-   Simplify CSS and ensure that you use inheritance as part of the nesting structure.
-   Avoid `scoped` attributes in `<style>` tags to prevent conflicts with advanced nesting.

### Class Naming

-   Keep class names short and simple.
-   Avoid the BEM (Block Element Modifier) naming convention as native CSS nesting is used.

---

## CSS Guidelines

1. Use **native CSS variables** for reusability and customization:
    ```css
    :root {
        --primary-color: #3498db;
    }
    ```
2. Avoid SASS variables in favor of CSS variables.
3. Clearly define classes for all HTML elements that require styling.
4. Never use inline style - add a semantic class name and add the associated style in the <style>
5. When replacing screen responsive media querys written in tailwind class ( https://tailwindcss.com/docs/responsive-design ) - convert them to the following sass variables:

sm -> $sm
md -> $md
lg -> $lg
xl -> $xl
2xl -> $xxl ($2xl is not valid sass variable name - therefore $xxl)

6. Do NOT re-define these sass variables (or any other sass variable) in individual components. ALL sass variables are defined in external .scss files.
7. Ensure not to use css variables within media queries as they don't currently work (hence why we use sass variables instead)
8. Important - Order the 'sematic' classes in the <style> tag in the same order as they appear in tbe <Template - including the nesting. This makes it easy to compare, navigate and cross reference. NOTE - Semantic classes are usually unique - unlike helper classes. Where a class is a helper class rather than semantic class DO NOT include it in the nesting as this will cause duplication. Keep the css code DRY.
9. Add the helper classes above all the sematic classes.
10. Add a comment above the helper classes: // Helper Classes
11. Add a comment above the semantic classes: // Sematic Classes - in Template order

---

## Validation

-   Form validation is implemented using **Vuelidate**.
-   Ensure clear and actionable validation error messages are displayed to users.

---

## Database

-   The database used is **MongoDB** with its native driver.
-   Write reusable and modular database operations to simplify maintenance.

---

## Alerts for Non-Standard Practices

-   If file naming, folder structure, or any other conventions deviate from Nuxt 3's best practices:
    -   Alert the user with a clear explanation.
    -   Provide a recommended solution.

---

## Additional Notes

-   Aim for **simplicity and readability** in all code.
-   Regularly review and refactor code to maintain quality.
-   Consult the Nuxt 3 documentation for updates and refinements in best practices.

# IMPORTANT Notes

1. NEVER remove existing code from components and replace with comments like // ...existing props... OR //...exisitng code. ALWAYS make sure the correct code is replaced or added in FULL ! THIS IS VITALLY IMPORTANT!!

---

**End of Style Guide**
