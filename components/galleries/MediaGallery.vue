<template>
    <!-- This Component should just be for configuration !!-->
    <card-list
        v-model:selectedCategories="controls.selectedCategories.value"
        v-model:show="controls.show.value"
        v-model:searchQuery="controls.searchQuery.value"
        v-model:sort="controls.sort.value"
        :filterUpdates="{
            selectedCategories: controls.selectedCategories.value
        }"
        functionControlDisplay="icon"
        :visibleFunctionControls="['view', 'select', 'edit', 'order']"
        defaultFunctionControl="view"
        defaultCardSize="Big Cards"
        :searchFields="searchFields"
        :filters="[
            {
                field: 'categories',
                options: categoryOptions,
                selected: controls.selectedCategories.value
            }
        ]"
    >
        <template #controls>
            <FilterControl :options="categoryOptions" filterField="categories" v-model="controls.selectedCategories.value" v-bind="filterControlConfig" />
            <ShowControl v-model="controls.show.value" :showOptions="mediaShowOptions" />
            <SortControl v-model="controls.sort.value" :sortOptions="mediaSortOptions" />
            <SearchControl v-model:searchQuery="controls.searchQuery.value" :searchFields="searchFields" :minSearchLength="1" />
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
interface SearchField {
    field: string;
    label: string;
}

// Keep only configuration and necessary state
const controls = useListControls({
    initialSort: { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
    initialShow: ['name', 'categories'],
    initialCategories: [],
    initialSearchQuery: ''
});

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
</script>
