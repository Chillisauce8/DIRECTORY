<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  auth: false
})

// Handle the OAuth callback
onMounted(async () => {
  try {
    await navigateTo('/')
  } catch (error) {
    await navigateTo('/auth/login')
  }
})
</script>
