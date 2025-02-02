<template>
    <grid-container
        :mode-control-display="modeControlDisplay"
        :filters="filters"
        :visible-mode-controls="visibleModeControls"
        :default-mode-control="defaultModeControl"
        :default-card-size="defaultCardSize"
        :visible-card-sizes="visibleCardSizes"
        :search-fields="searchFields"
        :listings="listingList"
        :category-options="categoryOptions"
        :listing-collection="collectionName"
        :on-item-created="handleItemCreated"
    >
        <template #controls>
            <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />
            <ShowControl v-model="showControlValues" />
            <SortControl :sort-options="sortOptions" />
            <SearchControl :search-fields="searchFields" />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" :edit-field="editField" />
        </template>

        <template #card="{ listing }">
            <CategoryCard :data-item="listing" />
        </template>
    </grid-container>
</template>

<script setup lang="ts">
import type { Event } from '~/types/collections/Events';
import GridContainer from '~/components/grids/common/GridContainer.vue';

// Collection & Grid Setup
const collectionName = 'categories';
const { listingList } = await useGrid<Event>({
    collectionName
});

// GridContainer Configuration
const modeControlDisplay = 'icon';
const visibleModeControls = ['view', 'select', 'edit', 'order'] as const;
const defaultModeControl = 'view';

// DisplayControl Props
const defaultCardSize = 'Big Cards';
const visibleCardSizes = ['Small Cards', 'Big Cards', 'List'] as const;

// Category Management
const categoryOptions = useCategories();
const selectedCategories = ref([]);

// Filter Controls (follows template order)
const filterControlConfig = {
    display: 'chip',
    optionLabel: 'name',
    filter: true,
    placeholder: 'Filter by Category',
    maxSelectedLabels: 2
} as const;

const filters = [
    {
        field: 'categories',
        options: categoryOptions,
        selected: selectedCategories
    }
];

// Show Controls
const showControlValues = ref([
    ['name', true],
    ['categories', true],
    ['description', false],
    ['start', false]
]);

// Sort Controls
const sortOptions = [
    { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
    { label: 'Name (Z-A)', sort: 'name', order: 'desc' }
] as const;

// Search Controls
const searchFields = [
    { field: 'name', label: 'Name' },
    { field: 'categories', label: 'Categories' }
];

// Edit Controls
const editField = 'categories';
</script>
