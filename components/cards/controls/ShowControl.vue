<template>
    <MultiSelect v-model="internalValue" :options="showOptions" :class="['show-control', className]" display="chip" placeholder="Show Fields" :maxSelectedLabels="2" />
</template>

<script setup lang="ts">
import { classNameProp } from '@/types/props';

const props = defineProps({
    modelValue: { type: Array as PropType<string[]>, required: true },
    showOptions: { type: Array as PropType<string[]>, required: true },
    className: classNameProp
});

const emit = defineEmits<{
    'update:modelValue': [string[]];
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
</script>

<style lang="scss">
.show-control {
    min-width: 150px;
}
</style>
