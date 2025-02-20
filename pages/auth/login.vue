<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card p-4 shadow-2 border-round" style="width: 100%; max-width: 450px;">
      <h2 class="text-center mb-5">Sign In</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="block mb-2">Email</label>
          <InputText id="email" v-model="form.email" type="email" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="password" class="block mb-2">Password</label>
          <Password id="password" v-model="form.password" class="w-full" toggleMask />
        </div>
        <Button type="submit" label="Sign In" class="w-full" :loading="loading" />
        
        <div class="text-center mt-3">
          <NuxtLink to="/auth/register" class="text-sm">
            Need an account? Sign up
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '#imports'
import Password from 'primevue/password'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})

const loading = ref(false)
const form = reactive({
  email: '',
  password: ''
})

const { signIn } = useAuth()
const router = useRouter()

async function handleLogin() {
  try {
    loading.value = true
    const result = await signIn('credentials', {
      ...form,
      redirect: false,
    })
    
    if (result?.error) {
      throw new Error(result.error)
    }
    
    await router.push('/')
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>
