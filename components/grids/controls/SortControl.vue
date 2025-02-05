<!-- SortControl.vue -->
<template>
    <div class="sort-control">
        <Dropdown v-model="selectedSort" :options="props.sortOptions" optionLabel="label" placeholder="Sort by..." />
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { SortOption } from '~/stores/useSortStore';
import { createSortStore } from '~/stores/useSortStore'; // Updated import

// Define props for sort options
const props = defineProps({
    sortOptions: {
        type: Array as () => SortOption[],
        default: () => []
    }
});

// Try to inject the grid-specific sort store provided by GridContainer
const injectedSortStore = inject('sortStore');

// Use the injected store or fall back to a global store instance created via the factory
// (Here we create a fallback global instance with an id of 'global')
const sortStore = injectedSortStore || createSortStore('global')();

// Create a computed property for two-way binding with the Dropdown
const selectedSort = computed({
    get: () => sortStore.currentSort || props.sortOptions[0] || null,
    set: (value: SortOption | null) => {
        if (value) {
            sortStore.setSort(value);
        }
    }
});
</script>
