import { ref, computed } from 'vue'

export const useDocumentation = () => {
  const docMap = {
    'auth': '/docs/auth/AUTH.md',
    'database': '/docs/database/DATABASE.md',
    'architecture': '/docs/architecture/ARCHITECTURE.md'
  }

  const getNavigationForSection = (section: string) => {
    switch(section) {
      case 'auth':
        return [
          {
            key: 'overview',
            label: 'Overview',
            children: [
              { key: 'auth-flow', label: 'Authentication Flow' },
              { key: 'configuration', label: 'Configuration' }
            ]
          },
          {
            key: 'database',
            label: 'Database Schema',
            children: [
              { key: 'users', label: 'Users Collection' },
              { key: 'sessions', label: 'Sessions Collection' },
              { key: 'accounts', label: 'Accounts Collection' },
              { key: 'verification', label: 'Verification Tokens' },
              { key: '2fa', label: 'Two Factor Auth' }
            ]
          },
          {
            key: 'security',
            label: 'Security',
            children: [
              { key: 'session-management', label: 'Session Management' },
              { key: 'route-protection', label: 'Route Protection' },
              { key: 'environment', label: 'Environment Security' }
            ]
          }
        ]
      // Add other sections...
      default:
        return []
    }
  }

  const loadDocumentation = async (section: string, subsection?: string) => {
    try {
      const response = await fetch(docMap[section])
      const content = await response.text()
      return content
    } catch (error) {
      console.error('Error loading documentation:', error)
      return null
    }
  }

  return {
    docMap,
    getNavigationForSection,
    loadDocumentation
  }
}
