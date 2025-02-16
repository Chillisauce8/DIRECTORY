<template>
  <div class="flex align-items-center gap-2">
    <template v-if="data?.user">
      <span class="text-sm">{{ data.user.email }}</span>
      <Button 
        icon="pi pi-sign-out" 
        @click="handleLogout" 
        severity="secondary" 
        text 
        size="small"
        :loading="loading"
      />
    </template>
    <Button v-else link to="/auth/login" label="Sign In" text size="small" />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '#auth'

const { signOut, data } = useAuth()
const router = useRouter()
const loading = ref(false)

const handleLogout = async () => {
  loading.value = true
  try {
    await signOut({ redirect: false })
    router.push('/auth/login')
  } finally {
    loading.value = false
  }
}
</script>
