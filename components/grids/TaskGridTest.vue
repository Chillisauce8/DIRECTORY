<template>
    <grid-container
        :grid-id="gridId"
        :mode-control-display="modeControlDisplay"
        :filters="filters"
        :visible-mode-controls="visibleModeControls"
        :default-mode-control="defaultModeControl"
        :default-card-size="defaultCardSize"
        :visible-card-sizes="visibleCardSizes"
        :search-fields="searchFields"
        :listings="listingList"
        :listing-collection="collectionName"
        :sort-options="sortOptions"
    >
        <template #controls>
            <FilterControl :options="listingList" :filter-field="filterField" :placeholder="filterPlaceholder" v-model="selectedFilters" />
            <ShowControl v-model="showFields" />
            <SortControl :sort-options="sortOptions" />
            <SearchControl :search-fields="searchFields" />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" :edit-field="editField" />
        </template>

        <template #card="{ listing }">
            <TaskCard :data-item="listing" />
        </template>
    </grid-container>
</template>

<script setup lang="ts">
import type { Event } from '~/types/collections/Events';
import GridContainer from '~/components/grids/common/GridContainer.vue';
import { ref, computed, watch } from 'vue';
import { useFilterStore } from '~/stores/useFilterStore';

const gridId = 'taskGridTest';

// Collection Configuration
const collectionName = 'events';
const { listingList } = await useGrid<Event>({ collectionName });

// Mode Control Configuration
const modeControlDisplay = 'icon';
const visibleModeControls = ['view', 'select', 'edit', 'order'] as const;
const defaultModeControl = 'view';

// Display Control Configuration
const defaultCardSize = 'Big Cards';
const visibleCardSizes = ['Small Cards', 'Big Cards', 'List'] as const;

// Filter Control Configuration
const filterPlaceholder = 'Filter by Category';
const filterField = 'categories.name';

// Filter Configuration
const filterStore = useFilterStore();

// Keep only the filters configuration
const filters = computed(() => [
    {
        field: filterField,
        selected: filterStore.getSelectedFilters(filterField)
    }
]);

// Show Control Configuration
const showFields = ref([
    ['name', true],
    ['categories', true],
    ['description', false],
    ['start', false]
]);

// Sort Control Configuration
const sortOptions = [
    { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
    { label: 'Name (Z-A)', sort: 'name', order: 'desc' }
] as const;

// Search Control Configuration
const searchFields = [
    { field: 'name', label: 'Name' },
    { field: 'categories', label: 'Categories' }
] as const;

// Edit Control Configuration
const editField = 'categories';
</script>
