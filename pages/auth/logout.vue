<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '#auth'

const { signOut } = useAuth()
const router = useRouter()

onMounted(async () => {
  try {
    await signOut({ redirect: false })
    router.push('/auth/login')
  } finally {
    // cleanup if needed
  }
})

definePageMeta({
  layout: 'auth'
})
</script>