<template>
    <div ref="container">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, onUnmounted, ref } from 'vue';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

// Props
const props = defineProps({
    options: Object
});

// Refs
const container = ref(null);

// Bind Fancybox on mount
onMounted(() => {
    Fancybox.bind(container.value, '[data-fancybox]', {
        ...(props.options || {})
    });
});

// Rebind Fancybox on updates
onUpdated(() => {
    Fancybox.unbind(container.value);
    Fancybox.close();

    Fancybox.bind(container.value, '[data-fancybox]', {
        ...(props.options || {})
    });
});

// Destroy Fancybox on unmount
onUnmounted(() => {
    Fancybox.destroy();
});
</script>

<style></style>
