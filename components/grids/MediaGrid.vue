<template>
    <grid-container
        v-model:selected-categories="selectedCategories"
        :filters="[
            {
                field: 'categories',
                options: categoryOptions,
                selected: selectedCategories
            }
        ]"
        functionControlDisplay="icon"
        :visibleFunctionControls="['view', 'select', 'edit', 'order']"
        defaultFunctionControl="view"
        defaultCardSize="Big Cards"
        :searchFields="searchFields"
        :show="selectedMediaShowOptions"
    >
        <template #controls>
            <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />
            <ShowControl v-model="selectedMediaShowOptions" :show-options="mediaShowOptions" />
            <SortControl :sort-options="mediaSortOptions" />
            <SearchControl :search-fields="searchFields" />
        </template>

        <template #card="{ listing, mode: cardMode, selected, show, onNameUpdate, onCategoriesUpdate }">
            <MediaCard
                :id="listing.id"
                :imageId="listing.images[0].id"
                :name="listing.name"
                :mode="cardMode"
                :loveable="listing.loveable"
                :selected="selected"
                :show="show"
                :categories="listing.categories"
                :onNameUpdate="onNameUpdate"
                :onCategoriesUpdate="onCategoriesUpdate"
            />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" editField="categories" placeholder="Edit Categories" class="edit-array-control w-full md:w-80" />
        </template>
    </grid-container>
</template>

<script setup lang="ts">
const categoryOptions = useCategories();
const selectedCategories = ref([]);
const selectedMediaShowOptions = ref(['name']);

// Simple configuration objects
const mediaShowOptions = ['name', 'categories'];
const mediaSortOptions = [
    { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
    { label: 'Name (Z-A)', sort: 'name', order: 'desc' }
] as { label: string; sort: string; order: 'asc' | 'desc' }[]; // Remove the as const

const filterControlConfig = {
    display: 'chip',
    optionLabel: 'name',
    filter: true,
    placeholder: 'Filter by Category',
    maxSelectedLabels: 2,
    className: 'category-control md:w-60'
} as const;

const searchFields = [
    { field: 'name', label: 'Name' },
    { field: 'categories', label: 'Categories' }
];
</script>
