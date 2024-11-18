<template>
    <span class="p-input-icon-left p-input-icon-right search-control">
        <InputText v-model="searchValue" @input="handleInput" type="text" placeholder="Search" />
        <i v-if="searchValue" class="pi pi-times" @click="clearSearch" />
        <i v-else class="pi pi-search" />
    </span>
</template>

<script setup lang="ts">
import { ref, watch, computed, inject } from 'vue';
import type { PropType } from 'vue';
import InputText from 'primevue/inputtext';

interface SearchField {
    field: string;
    label: string;
}

const props = defineProps({
    searchFields: {
        type: Array as PropType<SearchField[]>,
        default: () => [{ field: 'name', label: 'Name' }]
    },
    minSearchLength: {
        type: Number,
        default: 1
    },
    items: {
        type: Array as PropType<Record<string, any>[]>,
        default: () => []
    }
});

// Single state source
const searchValue = ref('');

// Type the injected function
type UpdateSearchFn = (items: any[]) => void;
const updateSearch = inject<UpdateSearchFn>('updateSearch', () => {});

// Emit results, not state
const emit = defineEmits<{
    'search-results': [Record<string, any>[]];
}>();

function handleInput() {
    const results = searchItems(props.items);
    updateSearch(results);
}

function clearSearch() {
    searchValue.value = '';
    updateSearch(props.items);
}

function searchItems<T extends Record<string, any>>(items: T[]): T[] {
    if (!searchValue.value) return items;

    const searchTerm = searchValue.value.toLowerCase().trim();
    return items.filter((item) =>
        props.searchFields.some((field) => {
            const value = item[field.field];
            return value != null && String(value).toLowerCase().includes(searchTerm);
        })
    );
}

// Expose search functionality
defineExpose({
    searchItems,
    searchQuery: searchValue
});
</script>

<style lang="scss" scoped>
.search-control {
    width: 100%;
    display: inline-flex;
    position: relative;

    .p-inputtext {
        width: 100%;
        padding-left: 2.5rem;
        padding-right: 2.5rem;
    }

    i {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-color-secondary);
        right: 0.75rem;
    }

    @media (min-width: 768px) {
        width: 150px;
    }
}
</style>
