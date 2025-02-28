# Nuxt Layers Migration - Comprehensive Guide for AI

## Overview and Context

This guide outlines a cautious, step-by-step approach to migrating an existing Nuxt 3 application to a layers architecture. The primary goals are:

1. **Share Common Code**: Leverage Nuxt's layers feature to maintain a single codebase for shared functionality
2. **Enable Independent Deployment**: Allow each application to be deployed independently
3. **Support Code Separation**: Facilitate the separation of application-specific code
4. **Maintain Stability**: Most importantly, ensure applications remain functional throughout migration

### What is Nuxt Layers?

Nuxt Layers allows extending a base Nuxt application with additional functionality. Think of it like inheritance:
- The **base layer** contains common code (components, layouts, utilities, etc.)
- The **extension apps** (car, wedding, adventure) extend this base layer, adding or overriding specific functionality

The key advantage: when a file exists in both the base and extension app, the extension app's version takes precedence.

### Migration Strategy

We're using an incremental approach:
1. Start by moving the entire existing app to a `/base` folder
2. Configure this as a layer (rather than a standalone app)
3. Create a minimal extension app (`/car`) that inherits from base
4. Test thoroughly at each step
5. Only when stable, gradually extract app-specific code to the extension

## Current Progress

✅ **Step 1**: Created base folder and copied existing app
✅ **Step 2**: Kept project configuration files at root
✅ **Step 3**: Successfully tested base as a standalone app
✅ **Step 4**: Modified base package.json (`npm pkg set name="base" type="module" main="./nuxt.config.ts"`)
✅ **Step 5**: Updated Base Nuxt Configuration for proper path resolution
✅ **Step 6**: Tested Base Layer successfully
✅ **Step 7**: Created Car App Directory Structure and Initial Files
✅ **Step 8**: Created Car Nuxt Config extending base layer
✅ **Step 9**: Installed Dependencies in Car App
✅ **Step 10**: Initial testing of Car App

## Current Status

🟢 **Base Layer**: Successfully running with `npm run dev` without any issues.
🟠 **Car App**: Running as an independent app with `npm run dev` but experiencing some issues that need debugging.

Both applications can now run independently, with the car app successfully extending the base layer. This confirms the layers architecture is working at a fundamental level, but some specific functionality issues need to be addressed in the car app.

### Current Car App Issues

The car app is experiencing some issues that need debugging:

1. **SCSS Import Errors**: Components from the base layer using `~/assets/css/mixins` can't resolve the path in car app context.
2. **Color Mode Missing**: The useColorMode() composable from the base layer's app.vue isn't available in the car app.

## Next Phase: Debugging Car App Issues

Before proceeding with extracting more app-specific code, we need to resolve the current issues in the car app:

1. **Create Bridge Files**: For SCSS imports and other assets, create bridge files in the car app that forward to the base layer
2. **Mirror Module Configuration**: Ensure all modules used in base are also configured in car app
3. **Handle Path Resolution**: Update path aliases and ensure proper resolution between layers
4. **Test Each Fix**: Apply one fix at a time and verify it resolves the issue

## Remaining Steps with Detailed Instructions

### Step 5: Update Base Nuxt Configuration

**WHY THIS MATTERS**: The base layer needs precise path resolution to function properly as a layer. Without this, imports may fail when referenced from extension apps.

Modify `base/nuxt.config.ts` to ensure proper path resolution:

```typescript
// Add this import at the top if not already there
import { resolve } from 'path'

// In your defineNuxtConfig, ensure these sections are updated/added:
export default defineNuxtConfig({
  // Your existing config (keep all your current settings)
  
  // ADD/UPDATE: Ensure alias paths are explicitly defined with absolute paths
  alias: {
    '@': resolve(__dirname, './'),
    '~': resolve(__dirname, './'),
    // Add other aliases your app uses
  },
  
  // ONLY IF YOU USE SCSS: Ensure resources are properly referenced
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Use absolute paths for any SCSS imports
          additionalData: scss => {
            // IMPORTANT: Only include this block if you actually use SCSS imports
            // If you don't use SCSS or additionalData, you can skip this entire vite section
            return `
              @use "${resolve(__dirname, './assets/scss/_variables.scss')}" as *;
              @use "${resolve(__dirname, './assets/scss/_mixins.scss')}" as *;
              ${scss}
            `
            // Adjust paths above based on your actual SCSS file locations
          }
        }
      }
    }
  }
})
```

**DEFENSIVE APPROACH**: 
- Do not remove any existing configuration options
- Only add/update the sections mentioned above
- Be careful with the SCSS section - only include if your project actually uses SCSS imports
- If unsure about any paths, use `console.log(__dirname)` to verify the correct directory

### Step 6: Test Base Layer Again

**WHY THIS MATTERS**: Confirming the base layer still works ensures your configuration changes didn't break anything.

```bash
# Navigate to base folder
cd base

# Run the application
npm run dev
```

**VERIFICATION STEPS**:
- Confirm the app loads correctly
- Test navigation between pages
- Verify styling is applied correctly
- Check that all core functionality works
- Look for any console errors related to imports or paths

If any issues arise, revert the changes from Step 5 and try again with more limited modifications.

### Step 7: Create Car App Directory Structure and Initial Files

**WHY THIS MATTERS**: The extension app needs a minimal configuration to extend the base layer.

```bash
# Create basic package.json in car directory (USE 'car' FOR CONSISTENCY)
cat > car/package.json << EOF
{
  "name": "car",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview"
  }
}
EOF

# Copy .env file if needed (ONLY IF ENV VARS ARE REQUIRED)
cp .env car/.env
```

**NOTES**:
- We use `"name": "car"` to match the directory name (for consistency)
- Only copy the .env file if your app requires environment variables to run

### Step 8: Create Minimal Car Nuxt Config

**WHY THIS MATTERS**: This config tells Nuxt to extend the base layer and sets up proper path resolution.

Create a new file at `car/nuxt.config.ts` with this content:

```typescript
// car/nuxt.config.ts
import { resolve } from 'path'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // CRITICAL: This line extends the base layer
  extends: ['../base'],
  
  // Minimal app-specific configuration
  app: {
    head: {
      title: 'Car Application'
    }
  },
  
  // Ensure proper path resolution for both base and car layers
  alias: {
    '@base': resolve(__dirname, '../base'),
    '@': resolve(__dirname, './'),
    '~': resolve(__dirname, './'),
  }
  
  // DO NOT ADD ADDITIONAL CONFIG YET - keep it minimal
})
```

**DEFENSIVE APPROACH**:
- Start with this minimal configuration
- Don't try to override or add complex configuration yet
- The `extends: ['../base']` line is the most critical part
- The alias section helps with importing from both layers

### Step 9: Install Dependencies in Car App

**WHY THIS MATTERS**: The car app needs its own Nuxt dependency to function.

```bash
# Navigate to car directory
cd car

# Install dependencies
npm install nuxt

# Do NOT install other dependencies at this stage
```

**NOTES**:
- Just install Nuxt initially - it will inherit most dependencies from the base layer
- Additional dependencies will only be needed when you start extracting app-specific code

### Step 10: Run and Test Car App

**WHY THIS MATTERS**: This confirms the car app can successfully extend the base layer.

```bash
# Start the car application (from the car directory)
npm run dev
```

**VERIFICATION STEPS**:
- Confirm the app loads with the title "Car Application" (from your config)
- Verify it has inherited all components, pages, and styles from the base layer
- Check for any console errors, especially related to imports, paths, or missing modules
- Test core functionality to ensure it behaves the same as the base app

## Common Issues and Solutions

### Issue: Authentication Problems

If authentication doesn't work in the car app but works in base:

```typescript
// Add to car/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['../base'],
  
  // Copy auth configuration from base layer
  auth: {
    // Copy the entire auth config object from base/nuxt.config.ts
  },
  
  // Rest of your config...
})
```

### Issue: SCSS Import Errors

If you see SCSS import errors like "Can't find stylesheet to import":

```bash
# Create matching directory structure in car app
mkdir -p car/assets/css

# Create bridge files that forward to base layer files
cat > car/assets/css/_mixins.scss << EOF
/* This file bridges to the base layer mixins */
@forward "../../base/assets/css/_mixins.scss";
EOF
```

Then update car/nuxt.config.ts with SCSS preprocessing configuration:

```typescript
// Add to car/nuxt.config.ts
export default defineNuxtConfig({
  // ...existing config
  
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // This ensures SCSS files can find imports in both layers
          includePaths: [
            resolve(__dirname, '../base/assets/css'),
            resolve(__dirname, './assets/css')
          ]
        }
      }
    }
  }
})
```

### Issue: Component Not Found Errors

If components from the base layer aren't found:

```typescript
// Check your alias paths in car/nuxt.config.ts
alias: {
  '@base': resolve(__dirname, '../base'),
  '@': resolve(__dirname, './'),
  '~': resolve(__dirname, './'),
}

// Then in your component imports, you may need to use @base prefix:
// import MyComponent from '@base/components/MyComponent.vue'
```

## Next Phase: Extracting App-Specific Code

Once the car app is successfully running and inheriting from base:

1. Identify clearly car-specific files (images, components, pages)
2. Move ONE file or small group of related files at a time
3. Test thoroughly after each move
4. Document any issues and solutions

## Important Principles

1. **Move Slowly**: Each small change should be tested before proceeding
2. **Be Methodical**: Keep track of what you've moved and what still needs to be moved
3. **When In Doubt, Leave It**: If unsure whether something is car-specific, leave it in base for now
4. **Document Everything**: Keep notes on what worked, what didn't, and how you fixed issues

### Key Lessons Learned About Nuxt Layers

1. **Path Resolution is Layer-Specific**: Each layer resolves imports from its own context 
2. **Modules Don't Auto-Transfer**: Modules and plugins must be registered in each app
3. **Bridge Files Strategy**: Create matching directory structures with bridge files to handle imports
4. **Forward Imports**: Use @forward in SCSS to link to the base layer's files
5. **Component Registration**: Explicitly register component directories from base layer
6. **Mirroring Configuration**: Key configuration from base often needs to be mirrored in extensions

## Final Note

This migration approach prioritizes stability over speed. The goal is to maintain a working application at all times, even if the migration takes longer as a result.