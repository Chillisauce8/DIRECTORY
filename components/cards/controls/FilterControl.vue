<template>
    <MultiSelect v-model="model" :options="props.options" :filter="true" :filterField="filterField" v-bind="$attrs" :class="['multi-select-filter', className]"> </MultiSelect>
</template>

<script setup lang="ts">
import { classNameProp } from '@/types/props';

const props = defineProps({
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

const model = defineModel<{ id: number; name: string }[]>({
    default: () => []
});

const emits = defineEmits(['update:modelValue']);

function updateModel(value: any) {
    model.value = value;
    emits('update:modelValue', value);
}

function handleModelUpdate(value: any) {
    model.value = value;
}

onMounted(() => {
    if (model.value === undefined) {
        updateModel([]);
    }
    if (!model.value) {
        handleModelUpdate([]);
    }
});

watch(
    () => props.options,
    (newOptions) => {
        console.log('Filter options updated:', newOptions);
        if (model.value?.length) {
            const validSelection = model.value.filter((item: any) => newOptions.some((option: any) => option.id === item.id));
            if (validSelection.length !== model.value.length) {
                updateModel(validSelection);
            }
        }
    },
    { deep: true }
);

watch(
    () => props.options,
    (newOptions) => {
        if (model.value && model.value.length) {
            const validSelection = model.value.filter((item) => newOptions.some((option) => option.id === item.id));
            if (validSelection.length !== model.value.length) {
                updateModel(validSelection);
            }
        }
    },
    { deep: true }
);

watchEffect(() => {
    console.log('FilterControl options:', props.options);
    console.log('FilterControl model value:', model.value);
});

defineOptions({
    inheritAttrs: true
});
</script>

<style lang="scss"></style>
