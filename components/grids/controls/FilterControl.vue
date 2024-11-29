<template>
    <div class="filter-control">
        <MultiSelect :modelValue="modelValue" @update:modelValue="(val) => $emit('update:modelValue', val)" :options="props.options" :filter="true" :filterField="filterField" v-bind="$attrs" :class="className"> </MultiSelect>
    </div>
</template>

<script setup lang="ts">
import { classNameProp } from '@/types/props';

const props = defineProps({
    modelValue: {
        type: Array as PropType<{ id: number; name: string }[]>,
        required: true
    },
    className: classNameProp,
    options: {
        type: Array as PropType<{ id: number; name: string }[]>,
        required: true
    },
    filterField: {
        type: String,
        default: 'categories'
    }
});

const emit = defineEmits(['update:modelValue']);

onMounted(() => {
    if (props.modelValue === undefined) {
        emit('update:modelValue', []);
    }
    if (!props.modelValue) {
        emit('update:modelValue', []);
    }
});

watch(
    () => props.options,
    (newOptions) => {
        console.log('Filter options updated:', newOptions);
        if (props.modelValue?.length) {
            const validSelection = props.modelValue.filter((item: any) => newOptions.some((option: any) => option.id === item.id));
            if (validSelection.length !== props.modelValue.length) {
                emit('update:modelValue', validSelection);
            }
        }
    },
    { deep: true }
);

watch(
    () => props.options,
    (newOptions) => {
        if (props.modelValue && props.modelValue.length) {
            const validSelection = props.modelValue.filter((item) => newOptions.some((option) => option.id === item.id));
            if (validSelection.length !== props.modelValue.length) {
                emit('update:modelValue', validSelection);
            }
        }
    },
    { deep: true }
);

watchEffect(() => {
    console.log('FilterControl options:', props.options);
    console.log('FilterControl model value:', props.modelValue);
});

defineOptions({
    inheritAttrs: true
});
</script>

<style lang="scss"></style>
