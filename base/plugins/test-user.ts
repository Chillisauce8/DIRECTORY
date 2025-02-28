import { ref } from 'vue'

export default defineNuxtPlugin(() => {
  const testUser = ref<any>(null)

  return {
    provide: {
      setTestUser: (user: any) => {
        console.log('Setting test user:', user)
        testUser.value = user
        // Also store in localStorage for persistence
        localStorage.setItem('testUser', JSON.stringify(user))
      },
      getTestUser: () => {
        // Try to get from memory first
        if (testUser.value) {
          return testUser.value
        }
        // Fall back to localStorage
        const stored = localStorage.getItem('testUser')
        if (stored) {
          testUser.value = JSON.parse(stored)
          return testUser.value
        }
        return null
      },
      clearTestUser: () => {
        testUser.value = null
        localStorage.removeItem('testUser')
      }
    }
  }
})
