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

const model = defineModel();

watchEffect(() => {
    console.log('FilterControl options:', props.options);
    console.log('FilterControl model value:', model.value);
});

defineOptions({
    inheritAttrs: true
});
</script>

<style lang="scss"></style>
