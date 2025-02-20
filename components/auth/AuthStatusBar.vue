<template>
  <div class="flex justify-end gap-2">
    <template v-if="data?.user">
      <span class="text-sm">{{ data.user.email }}</span>
      <Button 
        icon="pi pi-bug" 
        @click="showDebugInfo" 
        severity="info" 
        text 
        size="small"
      />
      <Button 
        icon="pi pi-sign-out" 
        @click="handleLogout" 
        severity="secondary" 
        text 
        size="small"
        :loading="loading"
      />
    </template>
    <NuxtLink to="/auth/login" class="no-underline">
      <Button class="sign-in-button" label="Sign In" text size="medium"  severity="alert"  icon="pi pi-user" />
    </NuxtLink>

    <!-- Debug Dialog -->
    <Dialog 
      v-model:visible="debugVisible" 
      header="Auth Debug Info" 
      :style="{ width: '50vw' }"
      modal
    >
      <div class="flex flex-column gap-3">
        <div class="surface-ground p-3 border-round">
          <h3 class="mt-0 mb-2">Session Status</h3>
          <code>{{ status }}</code>
        </div>
        
        <div class="surface-ground p-3 border-round">
          <h3 class="mt-0 mb-2">User Data</h3>
          <code>{{ data?.user }}</code>
        </div>

        <div class="surface-ground p-3 border-round">
          <h3 class="mt-0 mb-2">API Test</h3>
          <Button @click="testAuthAPI" :loading="testing" severity="info" text>
            Test Auth API
          </Button>
          <div v-if="testResult" class="mt-2">
            <code>{{ testResult }}</code>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '#imports'
import { useRouter } from '#app'

const { signOut, data, status } = useAuth()
const router = useRouter()
const loading = ref(false)
const debugVisible = ref(false)
const testing = ref(false)
const testResult = ref(null)

const handleLogout = async () => {
  loading.value = true
  try {
    await signOut({ redirect: false })
    router.push('/auth/login')
  } finally {
    loading.value = false
  }
}

const showDebugInfo = () => {
  debugVisible.value = true
}

const testAuthAPI = async () => {
  testing.value = true
  try {
    const result = await $fetch('/api/auth/test', {
      method: 'POST'
    })
    testResult.value = result
  } catch (error) {
    testResult.value = { error: error.message }
  } finally {
    testing.value = false
  }
}

const onLoginSuccess = () => {
  loginVisible.value = false
}
</script>

<style >
code {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
