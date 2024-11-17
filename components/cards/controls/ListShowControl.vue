<template>
    <SelectButton :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :options="showOptions" multiple class="show-control" />
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

const props = defineProps({
    modelValue: {
        type: Array as PropType<string[]>,
        required: true
    },
    showOptions: {
        type: Array as PropType<string[]>,
        default: () => ['name', 'categories']
    }
});

const emit = defineEmits(['update:modelValue']);
</script>
