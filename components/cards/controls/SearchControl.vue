<template>
    <span class="p-input-icon-left p-input-icon-right search-control">
        <InputText v-model="localSearchQuery" type="text" placeholder="Search" class="search-control" @input="handleInput" />
        <i v-if="localSearchQuery" class="pi pi-times" @click="clearSearch" style="cursor: pointer" />
        <i v-else class="pi pi-search" />
    </span>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { PropType } from 'vue';
import InputText from 'primevue/inputtext';

interface SearchField {
    field: string;
    label: string;
}

const props = defineProps({
    searchQuery: String,
    searchFields: {
        type: Array as PropType<SearchField[]>,
        default: () => [{ field: 'name', label: 'Name' }]
    },
    minSearchLength: {
        type: Number,
        default: 1
    }
});

const emit = defineEmits(['update:searchQuery']);

const localSearchQuery = ref(props.searchQuery || '');

// Update search when local value changes
watch(localSearchQuery, (newValue) => {
    if (newValue.length >= props.minSearchLength || newValue.length === 0) {
        emit('update:searchQuery', newValue);
    }
});

// Update local search when prop changes
watch(
    () => props.searchQuery,
    (newValue) => {
        if (newValue !== localSearchQuery.value) {
            localSearchQuery.value = newValue || '';
        }
    }
);

const searchFieldLabels = computed(() => props.searchFields.map((field) => field.label).join(', '));

function handleInput() {
    // Add any specific logic for handling input if needed
}

function clearSearch() {
    localSearchQuery.value = '';
    emit('update:searchQuery', '');
}

// Update the search function to be more robust
function searchItems<T extends Record<string, any>>(items: T[]): T[] {
    if (!localSearchQuery.value) return items;

    const searchTerm = localSearchQuery.value.toLowerCase().trim();
    return items.filter((item) =>
        props.searchFields.some((field) => {
            const value = item[field.field];
            return value != null && String(value).toLowerCase().includes(searchTerm);
        })
    );
}

defineExpose({
    searchItems
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
