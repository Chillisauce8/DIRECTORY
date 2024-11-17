<template>
    <icon-field class="search-control">
        <InputText type="text" class="search" :placeholder="placeholder" v-model="modelValue" />
        <InputIcon class="pi pi-search" />
    </icon-field>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';

interface SearchField {
    field: string;
    label: string;
}

const props = defineProps({
    searchFields: {
        type: Array as PropType<SearchField[]>,
        default: () => [{ field: 'name', label: 'Name' }]
    },
    placeholder: {
        type: String,
        default: 'Search'
    },
    minSearchLength: {
        type: Number,
        default: 1
    }
});

const modelValue = defineModel<string>('searchQuery');

// Expose search method for parent components
const searchItems = (items: any[]) => {
    if (!modelValue.value || modelValue.value.length < props.minSearchLength) {
        return items;
    }

    const searchTerm = modelValue.value.toLowerCase();
    return items.filter((item) => {
        return props.searchFields.some((field) => {
            const value = item[field.field];
            if (!value) return false;
            return String(value).toLowerCase().includes(searchTerm);
        });
    });
};

// Expose the search function to parent components
defineExpose({
    searchItems
});
</script>

<style lang="scss" scoped>
.search-control {
    width: 100%;
    @media (min-width: 768px) {
        width: 300px;
    }
}
</style>
