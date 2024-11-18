<template>
    <card-list
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
    >
        <template #controls="{ items }">
            <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />
            <ShowControl :show-options="mediaShowOptions" />
            <SortControl :sort-options="mediaSortOptions" :items="items" />
            <SearchControl :search-fields="searchFields" :items="items" />
        </template>

        <template #card="{ listing, mode, selected, show }">
            <TestCard :id="listing.id" :imageId="listing.images[0].id" :name="listing.name" :mode="mode" :loveable="listing.loveable" :selected="selected" :show="show" :categories="listing.categories" />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" editField="categories" class="edit-array-control w-full md:w-80" />
        </template>
    </card-list>
</template>

<script setup lang="ts">
const selectedCategories = ref([]);
const categoryOptions = useCategories();

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
