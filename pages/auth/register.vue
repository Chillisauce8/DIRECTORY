<template>
  <div class="flex align-items-center justify-content-center">
    <div class="surface-card p-4 shadow-2 border-round w-full lg:w-6">
      <h2 class="text-center text-2xl mb-4">Create Account</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <span class="p-float-label">
            <InputText 
              id="name" 
              v-model="form.name" 
              class="w-full" 
              :class="{'p-invalid': errors.name}"
            />
            <label for="name">Name</label>
          </span>
          <small class="p-error" v-if="errors.name">{{ errors.name }}</small>
        </div>

        <div class="mb-4">
          <span class="p-float-label">
            <InputText 
              id="email" 
              v-model="form.email" 
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
              v-model="form.password" 
              class="w-full" 
              :class="{'p-invalid': errors.password}"
              :feedback="true"
              toggleMask
            />
            <label for="password">Password</label>
          </span>
          <small class="p-error" v-if="errors.password">{{ errors.password }}</small>
        </div>

        <Button 
          type="submit" 
          label="Register" 
          class="w-full"
          :loading="loading"
        />
      </form>
      
      <div class="text-center mt-4">
        <router-link to="/auth/login" class="text-primary">Already have an account?</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  auth: false
})

const router = useRouter()
const loading = ref(false)
const form = reactive({
  name: '',
  email: '',
  password: ''
})
const errors = ref({
  name: '',
  email: '',
  password: ''
})

const validateForm = () => {
  errors.value = {
    name: '',
    email: '',
    password: ''
  }
  
  if (!form.name) errors.value.name = 'Name is required'
  if (!form.email) errors.value.email = 'Email is required'
  if (!form.password) errors.value.password = 'Password is required'
  
  return !errors.value.name && !errors.value.email && !errors.value.password
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    // Implementation depends on your API
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form
    })
    router.push('/auth/login')
  } catch (e: any) {
    errors.value.email = e.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
