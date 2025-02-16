<template>
  <div class="flex align-items-center justify-content-center">
    <div class="surface-card p-4 shadow-2 border-round w-full lg:w-6">
      <h2 class="text-center text-2xl mb-4">Sign In</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <span class="p-float-label">
            <InputText 
              id="email" 
              v-model="email" 
              type="email" 
              class="w-full" 
              :class="{'p-invalid': errors.email}"
            />
            <label for="email">Email</label>
          </span>
          <small class="p-error" v-if="errors.email">{{ errors.email }}</small>
        </div>

        <div class="mb-4">
          <span class="p-float-label">
            <Password 
              id="password" 
              v-model="password" 
              class="w-full" 
              :class="{'p-invalid': errors.password}"
              :feedback="false"
              toggleMask
            />
            <label for="password">Password</label>
          </span>
          <small class="p-error" v-if="errors.password">{{ errors.password }}</small>
        </div>

        <Button 
          type="submit" 
          label="Sign In" 
          class="w-full"
          :loading="loading"
        />
      </form>
      
      <div v-if="error" class="p-error mt-4 text-center">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '#auth'

const { signIn } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const errors = ref({
  email: '',
  password: ''
})

const validateForm = () => {
  errors.value = {
    email: '',
    password: ''
  }
  
  if (!email.value) errors.value.email = 'Email is required'
  if (!password.value) errors.value.password = 'Password is required'
  
  return !errors.value.email && !errors.value.password
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  error.value = ''
  
  try {
    await signIn({
      email: email.value,
      password: password.value
    })
    router.push('/')
  } catch (e: any) {
    error.value = e.message || 'An error occurred during sign in'
  } finally {
    loading.value = false
  }
}
</script>
