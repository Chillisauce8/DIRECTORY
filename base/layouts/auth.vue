<template>
  <div class="min-h-screen flex align-items-center justify-content-center bg-surface-ground">
    <NuxtLayout>
      <slot />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>
