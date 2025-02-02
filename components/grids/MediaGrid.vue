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
        modeControlDisplay="icon"
        :visibleModeControls="['view', 'select', 'edit', 'order']"
        defaultModeControl="view"
        defaultCardSize="Big Cards"
        :searchFields="searchFields"
        :listingCollection="'files'"
    >
        <template #controls>
            <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />
            <ShowControl :show-options="mediaShowOptions" />
            <SortControl :sort-options="mediaSortOptions" />
            <SearchControl :search-fields="searchFields" />
        </template>

        <template #card="{ listing }">
            <MediaCard :_id="listing._id" :data-item="listing" :categories="listing.categories" v-model:data-item="listing" />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" editField="categories" placeholder="Edit Categories" class="edit-array-control w-full md:w-80" />
        </template>
    </grid-container>
</template>

<script setup lang="ts">
import { useShowStore } from '~/stores/useShowStore';

const categoryOptions = useCategories();
const selectedCategories = ref([]);

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

const showStore = useShowStore();

// Initialize showStore with all available options instead of just 'name'
onMounted(() => {
    showStore.setShow(mediaShowOptions);
});
</script>
