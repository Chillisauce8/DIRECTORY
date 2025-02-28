import { useAuth } from '#imports'

export function useAppAuth() {
  const auth = useAuth()
  
  return {
    ...auth,
    isAuthenticated: computed(() => auth.status.value === 'authenticated')
  }
}
