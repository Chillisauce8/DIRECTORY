# Container Queries: A Modern Alternative to Media Queries

## Introduction

Container queries allow you to apply styles based on the size of a containing element rather than the viewport size. This creates more modular, reusable components that adapt to their context rather than the entire screen.

This guide shows how to properly structure and use container queries as a direct replacement for media queries.

## Table of Contents

1. [Basic Comparison](#basic-comparison)
2. [Setting Up Container Contexts](#setting-up-container-contexts)
3. [Container Query Syntax](#container-query-syntax)
4. [Units and Values](#units-and-values)
5. [Practical Examples](#practical-examples)
6. [Migration Strategy](#migration-strategy)
7. [Browser Support](#browser-support)
8. [Best Practices](#best-practices)

## Basic Comparison

### Media Queries (Viewport-based)

```css
/* Styles apply when viewport is at least 768px wide */
@media (min-width: 768px) {
  .card {
    display: flex;
  }
}
```

### Container Queries (Container-based)

```css
/* First, establish a container context */
.card-container {
  container-type: inline-size;
}

/* Styles apply when the container is at least 500px wide */
@container (min-width: 500px) {
  .card {
    display: flex;
  }
}
```

## Setting Up Container Contexts

Before using container queries, you must establish a containment context:

```css
/* Basic container context */
.container {
  container-type: inline-size; /* Only tracks inline (horizontal) axis */
}

/* Alternative container types */
.full-container {
  container-type: size; /* Tracks both width and height */
}

.normal-container {
  container-type: normal; /* Default state */
}

/* Named containers */
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

/* Shorthand */
.main-content {
  container: main-content inline-size; /* name type */
}
```

### When to Use Each Container Type

- `inline-size`: Most common use case. Tracks width changes but not height.
- `size`: Use when you need to respond to both width and height.
- `normal`: Default state, defines a containment context without sizing.

## Container Query Syntax

```css
/* Basic syntax */
@container (min-width: 400px) {
  /* Styles applied when container is at least 400px wide */
}

/* Named container */
@container sidebar (min-width: 300px) {
  /* Only applies to elements within containers named "sidebar" */
}

/* Multiple conditions */
@container (min-width: 300px) and (max-width: 700px) {
  /* Applied between 300px and 700px */
}

/* Style conditions */
@container style(--theme: dark) {
  /* Applied when container has --theme: dark */
}
```

## Units and Values

Container queries introduce new relative units:

```css
.element {
  /* Container-relative lengths */
  width: 50cqw;   /* 50% of the container's width */
  height: 25cqh;  /* 25% of the container's height */
  margin: 1cqi;   /* 1% of the container's inline size */
  padding: 1cqb;  /* 1% of the container's block size */
  font-size: 2cqmin; /* 2% of the container's smaller dimension */
  border: 0.5cqmax; /* 0.5% of the container's larger dimension */
}
```

## Practical Examples

### Card Component

```css
/* Container setup */
.card-container {
  container-type: inline-size;
}

/* Default card layout (mobile-first) */
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.card-image {
  aspect-ratio: 16/9;
}

/* Container query for larger layouts */
@container (min-width: 400px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}

@container (min-width: 600px) {
  .card {
    grid-template-columns: 300px 1fr;
  }
  
  .card-content {
    padding: 2rem;
  }
}
```

### Navigation Component

```css
/* Container setup */
.nav-container {
  container-type: inline-size;
  container-name: nav;
}

/* Default mobile menu */
.nav {
  display: flex;
  flex-direction: column;
}

/* Switch to horizontal layout in wider containers */
@container nav (min-width: 600px) {
  .nav {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .nav-toggle {
    display: none;
  }
}
```

### Fluid Typography

```css
/* Container setup */
.text-container {
  container-type: inline-size;
}

/* Fluid typography based on container width */
.heading {
  font-size: clamp(1.5rem, calc(1.5rem + 2cqi), 3rem);
}

.paragraph {
  font-size: clamp(1rem, calc(1rem + 0.5cqi), 1.25rem);
}
```

## Migration Strategy

To migrate from media queries to container queries:

1. **Identify Component Boundaries**:
   - Determine which elements should be containers
   - Focus on reusable components first

2. **Establish Container Contexts**:
   ```css
   .component-wrapper {
     container-type: inline-size;
   }
   ```

3. **Convert Media Queries**:
   ```css
   /* Before */
   @media (min-width: 768px) {
     .component { ... }
   }
   
   /* After */
   @container (min-width: 500px) {
     .component { ... }
   }
   ```

4. **Adjust Breakpoint Values**:
   - Container query breakpoints are typically smaller than their media query equivalents
   - A 768px media query might become a 500px container query

5. **Use Container-Relative Units**:
   - Replace `vw`, `vh` with `cqi`, `cqb` where appropriate

6. **Test Across Layouts**:
   - Verify component behavior when placed in different contexts

## Browser Support

Container queries are supported in all modern browsers (Chrome, Firefox, Safari, Edge) as of 2023. For older browsers, consider:

- Feature detection
- Providing simplified fallback layouts
- Using a polyfill for critical components

## Best Practices

1. **Appropriate Container Hierarchy**:
   - Don't make every element a container
   - Focus on logical component boundaries

2. **Performance Considerations**:
   - Container queries have a performance cost
   - Prefer `inline-size` over `size` when possible
   - Avoid deeply nested container contexts

3. **Combine with Media Queries**:
   - Use media queries for page layout
   - Use container queries for component layout

4. **Mobile-First Approach**:
   - Write base styles for smallest container size
   - Use container queries to enhance for larger containers

5. **Name Important Containers**:
   - Use `container-name` for clarity
   - Helps when targeting specific container contexts

6. **Consistent Breakpoints**:
   - Create a system of container query breakpoints
   - Maintain consistency across components

7. **Keep Parent-Child Relationship Clear**:
   - Document which elements are containers
   - Clear naming conventions help (e.g., `card-container`, `card`)

## Conclusion

Container queries represent a significant advancement in responsive design, enabling truly modular components that adapt to their context rather than the viewport. By focusing on the immediate container rather than the entire screen, we can create more flexible, reusable components that work consistently across different layouts and screen sizes.