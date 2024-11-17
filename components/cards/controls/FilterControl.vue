<template>
    <MultiSelect v-bind="$attrs" v-model="model" :class="['multi-select-filter', className]">
        <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
            <slot :name="name" v-bind="slotData"></slot>
        </template>
    </MultiSelect>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';

defineProps({
    className: {
        type: String,
        default: ''
    }
});

// Create two-way binding
const model = defineModel();

// Inherit attrs and emit all events
defineOptions({
    inheritAttrs: true
});
</script>

<style lang="scss" scoped>
.multi-select-filter {
    &.w-full {
        width: 100%;
    }
}
</style>
