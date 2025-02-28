<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card p-4 shadow-2 border-round" style="width: 100%; max-width: 450px;">
      <h2 class="text-center mb-5">Register</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-3">
          <label for="name" class="block mb-2">Name</label>
          <InputText id="name" v-model="form.name" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="email" class="block mb-2">Email</label>
          <InputText id="email" v-model="form.email" type="email" class="w-full" />
        </div>
        <div class="mb-3">
          <label for="password" class="block mb-2">Password</label>
          <Password id="password" v-model="form.password" class="w-full" toggleMask />
        </div>
        <Button type="submit" label="Register" class="w-full" :loading="loading" />
        
        <div class="mt-3 text-center">
          <router-link to="/auth/login" class="text-sm">Already have an account? Sign in</router-link>
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
  name: '',
  email: '',
  password: ''
})

const router = useRouter()

async function handleRegister() {
  try {
    loading.value = true

    // First create the user in the database (without hashing for now)
    await $fetch('/api/query', {
      method: 'POST',
      body: {
        collection: 'users',
        operation: 'insertOne',
        document: {
          name: form.name,
          email: form.email,
          password: form.password  // Temporarily store as plain text
        }
      }
    })

    // Then sign in
    const { signIn } = useAuth()
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    
    if (result?.error) {
      throw new Error(result.error)
    }
    
    await router.push('/')
  } catch (error) {
    console.error('Registration error:', error)
  } finally {
    loading.value = false
  }
}
</script>
