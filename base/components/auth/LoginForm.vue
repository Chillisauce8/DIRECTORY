<template>
  <form @submit.prevent="handleSubmit" class="flex flex-column gap-3">
    <div class="field">
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

    <div class="field">
      <span class="p-float-label">
        <Password 
          id="password" 
          v-model="form.password" 
          class="w-full" 
          :class="{'p-invalid': errors.password}"
          :feedback="false"
          toggleMask
        />
        <label for="password">Password</label>
      </span>
      <small class="p-error" v-if="errors.password">{{ errors.password }}</small>
    </div>

    <div v-if="error" class="p-error text-center">
      {{ error }}
    </div>

    <Button 
      type="submit" 
      label="Sign In" 
      class="w-full"
      :loading="loading"
    />

    <div class="text-center text-md">
      <NuxtLink to="/auth/register">Need an account? Register</NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits(['success', 'loading'])
const loading = ref(false)
const error = ref('')
const form = reactive({
  email: '',
  password: ''
})
const errors = reactive({
  email: '',
  password: ''
})

async function handleSubmit() {
  // ...existing validation logic...

  loading.value = true
  emit('loading', true)
  
  try {
    const { signIn } = useAuth()
    const result = await signIn('credentials', {
      ...form,
      redirect: false,
    })
    
    if (result?.error) {
      throw new Error(result.error)
    }
    
    emit('success')
  } catch (e: any) {
    error.value = e.message || 'Sign in failed'
    console.error('Login error:', e)
  } finally {
    loading.value = false
    emit('loading', false)
  }
}
</script>
