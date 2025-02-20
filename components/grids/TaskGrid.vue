<template>
    <grid-container :grid-id="gridId" :filters="filters" :listings="listingList" :listing-collection="collectionName" :sort-options="sortOptions" :show-selected-options="showSelectedOptions">
        <template #controls>
            <ModeControl :display="modeControlDisplay" :visible-controls="visibleModeControls" :default-control="defaultModeControl" :grid-id="gridId" />
            <FilterControl :options="listingList" :filter-field="filterField" :placeholder="filterPlaceholder" v-model="selectedFilters" />
            <ShowControl :show-all-options="showAllOptions" :grid-id="gridId" />
            <SortControl :sort-options="sortOptions" />
            <SearchControl :search-fields="searchFields" />
            <DisplayControl :visible-sizes="visibleCardSizes" :default-size="defaultCardSize" :grid-id="gridId" />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" :edit-field="editField" />
        </template>

        <template #card="{ listing }">
            <TaskCard :data-item="listing" :grid-id="gridId" />
        </template>
    </grid-container>
</template>

<script setup lang="ts">
import type { Event } from '~/types/collections/events';
import GridContainer from '~/components/grids/common/GridContainer.vue';
import { ref, computed } from 'vue';

// Grid Configuration
const gridId = 'taskGrid';

// Collection Configuration
const collectionName = 'events';
const { listingList } = await useGrid<Event>({ collectionName });

// Mode Control Configuration
const modeControlDisplay = 'icon';
const visibleModeControls = ['view', 'select', 'edit', 'order'] as const;
const defaultModeControl = 'select';

// Display Control Configuration
const defaultCardSize = 'Big Cards';
const visibleCardSizes = ['Small Cards', 'Big Cards', 'List'] as const;

// Filter Control Configuration
const filterPlaceholder = 'Filter by Category';
const filterField = 'categories.name';

// Add definition for selectedFilters, used with v-model on <FilterControl>
const selectedFilters = ref([]);

// Simplify filters computation
const filters = computed(() => [
    {
        field: filterField,
        selected: [] // GridContainer will handle the selected state
    }
]);

// Show Control Configuration
const showAllOptions = ['name', 'categories', 'description', 'start'];
const showSelectedOptions = ['name', 'categories'];

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

// Edit Control Configuration // Currently not working
const editField = 'categories';
</script>
