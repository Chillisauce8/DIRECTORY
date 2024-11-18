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
            <TestCard :imageId="listing.images[0].id" :name="listing.name" :mode="mode" :loveable="listing.loveable" :selected="selected" :show="show" :categories="listing.categories" />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" editField="categories" class="edit-array-control w-full md:w-80" />
        </template>
    </card-list>
</template>

<script setup lang="ts">
// Only selectedCategories needs to be managed at this level
// because it's core business logic specific to this gallery
const selectedCategories = ref([]);
const show = ref(['name', 'categories']);
const sort = ref(null);
const searchQuery = ref('');

// These could be moved to their respective components with defaults
// and only overridden here if needed
const categoryOptions = useCategories();

// Configuration objects
const mediaShowOptions = ['name', 'categories'];
const mediaSortOptions: { label: string; sort: string; order: 'asc' | 'desc' }[] = [
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
const searchFields = [
    { field: 'name', label: 'Name' },
    { field: 'categories', label: 'Categories' }
];

// Handle emitted results from controls
function updateShow(fields: string[]) {
    // Handle show fields update
}

function updateSortedItems(items: any[]) {
    // Handle sorted items
}

function updateSearchResults(results: any[]) {
    // Handle search results
}
</script>
