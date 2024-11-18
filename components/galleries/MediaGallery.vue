<template>
    <card-list
        v-model:selectedCategories="controls.selectedCategories.value"
        v-model:show="controls.show.value"
        v-model:searchQuery="controls.searchQuery.value"
        v-model:sort="controls.sort.value"
        functionControlDisplay="icon"
        :visibleFunctionControls="['view', 'select', 'edit', 'order']"
        defaultFunctionControl="view"
        defaultCardSize="Big Cards"
        :searchFields="searchFields"
    >
        <template #controls>
            <FilterControl v-model="controls.selectedCategories.value" :options="mediaCategories" v-bind="filterControlConfig" />

            <ShowControl v-model="controls.show.value" :showOptions="mediaShowOptions" />

            <SortControl v-model="controls.sort.value" :sortOptions="mediaSortOptions" />

            <SearchControl v-model:searchQuery="controls.searchQuery.value" :searchFields="searchFields" :minSearchLength="1" />
        </template>

        <template #card="{ listing, mode, selected, show }">
            <TestCard :imageId="listing.images[0].id" :name="listing.name" :mode="mode" :loveable="listing.loveable" :selected="selected" :show="show" :categories="listing.categories" />
        </template>
    </card-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useListControls } from '@/composables/useListControls';
import type { Category, SortOption } from '@/composables/useListControls';

interface SearchField {
    field: string;
    label: string;
}

// Control Configurations with proper types
const mediaCategories: Category[] = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' }
];

const mediaShowOptions: string[] = ['name', 'categories']; // Remove 'description'

const mediaSortOptions: SortOption[] = [
    { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
    { label: 'Name (Z-A)', sort: 'name', order: 'desc' }
];

const filterControlConfig = {
    display: 'chip',
    optionLabel: 'name',
    filter: true,
    placeholder: 'Filter by Category',
    maxSelectedLabels: 2,
    className: 'category-control md:w-60'
} as const;

const searchFields: SearchField[] = [
    { field: 'name', label: 'Name' },
    { field: 'categories', label: 'Categories' }
];

// Use the shared control logic with initial values - remove generic type
const controls = useListControls({
    initialSort: { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
    initialShow: ['name', 'categories'], // Update initial show value
    initialCategories: [],
    initialSearchQuery: ''
});
</script>
