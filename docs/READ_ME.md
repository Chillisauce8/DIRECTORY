# Project Overview

This document serves as the primary entry point for all project documentation, providing a high-level overview of the application architecture, technologies used, and documentation structure.

## Introduction

This project is a Nuxt 3/Vue 3 application with TypeScript, using PrimeVue for UI components, MongoDB for database, and Vuelidate for form validation. This document serves as the main entry point for all project documentation.

## Documentation Structure

The project documentation is organized into several specialized documents:

### [Style Guide](./STYLE_GUIDE.md)
- Coding conventions and standards
- Naming conventions for components, props, methods, etc.
- CSS and styling standards
- Form validation practices

### [Architecture](./architecture/ARCHITECTURE.md)
- Project directory structure
- Key directories and their purposes
- File organization patterns
- Service layer organization
- State management approach

### [Authentication](./auth/AUTH.md)
- Authentication system setup
- User roles and permissions
- Protected routes

### [Database](./database/DATABASE.md)
- Database schema
- Indexes and relationships
- MongoDB operations

## Getting Started

For new developers joining the project:

1. Review this overview document first
2. Read the [Architecture Documentation](./architecture/ARCHITECTURE.md) to understand project structure
3. Study the [Style Guide](./STYLE_GUIDE.md) to learn coding conventions
4. Refer to specialized documentation as needed during development

## Core Technologies

- **Framework:** Nuxt 3 with Vue 3
- **Language:** TypeScript
- **UI Library:** PrimeVue
- **Styling:** SCSS with native CSS variables
- **Database:** MongoDB (native driver)
- **Form Validation:** Vuelidate
- **Testing:** Vitest
- **State Management:** Pinia

## Project Architecture: Nuxt Layers

This project implements [Nuxt Layers](https://nuxt.com/docs/getting-started/layers) to organize code and promote reusability. The architecture consists of:

- **Base Layer**: Located in the `/base` directory, this contains the core framework, shared components, and common functionality
- **Car App Layer**: Located in the `/car` directory, this extends the base layer with car-specific features and components

When working with this project:
1. Understand that components, composables, and other assets may be inherited from the base layer
2. Be mindful of the layer hierarchy when creating or modifying files
3. Place shared functionality in the base layer, and app-specific features in their respective app layers
4. Directory paths should respect the layer structure, with shared components in base and specialized components in their app layers

This layered approach allows for code reuse while maintaining separation of concerns between different applications within the project.

## Development Workflow

[Add information about development workflow, branching strategy, PR process, etc.]

## Deployment

[Add information about deployment process and environments]
