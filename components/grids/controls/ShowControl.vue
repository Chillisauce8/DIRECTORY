<template>
    <MultiSelect v-model="selectedFields" :options="showOptions" :class="['show-control', className]" display="chip" placeholder="Show Fields" />
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { classNameProp } from '@/types/props';

// Internal state only
const selectedFields = ref(['name']);

// Type the injected function
type UpdateShowFn = (fields: string[]) => void;
const updateShow = inject<UpdateShowFn>('updateShow', () => {});

// Emit the selected fields
const emit = defineEmits<{
    'update:fields': [string[]];
}>();

const props = defineProps({
    showOptions: { type: Array as PropType<string[]>, required: true },
    className: classNameProp
});

// Remove both model and selectedFields - use only one
watch(selectedFields, (newFields) => {
    updateShow(newFields);
    emit('update:fields', newFields);
});

watchEffect(() => {
    console.log('ShowControl options:', props.showOptions);
});
</script>

<style lang="scss">
.show-control {
    min-width: 150px;
}
</style>
