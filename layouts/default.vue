<script setup>
import AppLayout from './AppLayout.vue';
// PrimeVue Toast is auto-imported or can be explicitly imported if needed

console.log('Default layout mounting - should only see this once');

onMounted(() => {
  console.log('Toast component mounted in default layout - should only see this once');
});
</script>

<template>
  <div>
    <!-- Single PrimeVue Toast component at the root level -->
    <Toast />
    
    <AppLayout>
        <slot />
    </AppLayout>
  </div>
</template>
