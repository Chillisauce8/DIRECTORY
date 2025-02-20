import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import type { NavigationFailure } from '#app'
import { useAuth } from '#auth'

export default defineNuxtRouteMiddleware(async (to): Promise<void | NavigationFailure> => {
  const { status } = useAuth()
  
  // If auth is required and user is not authenticated
  // Redirect to login unless the page is marked as public
  if (to.meta.auth === false || to.path.startsWith('/auth/')) {
    if (status.value === 'authenticated' && to.path.startsWith('/auth/')) {
      return navigateTo('/')
    }
    return
  }

  if (status.value !== 'authenticated') {
    return navigateTo('/auth/login', { 
      query: { 
        redirect: to.fullPath 
      }
    })
  }
})
