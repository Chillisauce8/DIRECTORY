import { resolve } from 'path'
import { defineNuxtConfig } from 'nuxt/config'

// Get base dir for imports
const BASE_DIR = resolve(__dirname, '../base');

export default defineNuxtConfig({
  // CRITICAL: This line extends the base layer
  extends: ['../base'],
  
  // Minimal app-specific configuration
  app: {
    head: {
      title: 'Car Application'
    }
  },
  
  // Add the color mode module
  modules: [
    '@nuxtjs/color-mode'
  ],
  
  // Configure color mode options (match the configuration from base app)
  colorMode: {
    // Use the same settings as in base app's nuxt.config.ts
    preference: 'system', 
    fallback: 'light',
    classSuffix: ''
  },
  
  // Ensure proper path resolution for both base and car layers
  alias: {
    '@base': BASE_DIR,
    '@': resolve(__dirname, './'),
    '~': resolve(__dirname, './'),
  },
  
  // Add explicit component registration for base components
  components: [
    { path: '../base/components', pathPrefix: false },
    { path: '../base/layouts', pathPrefix: false },
    { path: './components', pathPrefix: false },
    { path: './layouts', pathPrefix: false }
  ],
  
  // Update SCSS preprocessing configuration with more robust approach
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Don't use additionalData, use includePaths instead
          includePaths: [
            resolve(__dirname, '../base'),
            resolve(__dirname, '../base/assets'),
            resolve(__dirname, '../base/assets/css'),
            resolve(__dirname, './assets/css')
          ]
        }
      }
    },
    resolve: {
      // Add additional alias for CSS resolution
      alias: [
        {
          find: /^~\/assets\/css/,
          replacement: resolve(__dirname, '../base/assets/css')
        }
      ]
    }
  }
})
