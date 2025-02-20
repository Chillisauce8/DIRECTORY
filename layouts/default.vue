<script setup>
import AppLayout from './AppLayout.vue';
</script>

<template>
    <AuthStatusBar /> 
    <AppLayout>
        <slot />
    </AppLayout>

</template>
