import { useAuth } from '#auth'

export default defineNuxtRouteMiddleware((to) => {
  const { data } = useAuth()

  // Skip middleware if route has auth:false meta
  if (to.meta.auth === false) {
    return
  }

  // If user is not authenticated and trying to access a protected route
  if (!data.value?.user && to.path !== '/auth/login') {
    return navigateTo('/auth/login', {
      redirectCode: 401,
      replace: true
    })
  }

  // If user is authenticated and trying to access login page
  if (data.value?.user && to.path === '/auth/login') {
    return navigateTo('/', {
      replace: true
    })
  }
})
