<template>
    <grid-container
        functionControlDisplay="icon"
        :filters="[
            {
                field: 'categories',
                options: categoryOptions,
                selected: selectedCategories
            }
        ]"
        :visibleFunctionControls="['view', 'select', 'edit', 'order']"
        defaultFunctionControl="view"
        defaultCardSize="Big Cards"
        :searchFields="searchFields"
        :show="selectedMediaShowOptions"
        :listings="listingList"
        :category-options="categoryOptions"
        :listing-collection="collectionName"
        :on-item-created="handleItemCreated"
    >
        <template #controls>
            <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />
            <ShowControl v-model="selectedMediaShowOptions" @update:modelValue="test" :show-options="mediaShowOptions" />
            <SortControl :sort-options="mediaSortOptions" />
            <SearchControl :search-fields="searchFields" />
        </template>

        <template #card="{ listing, mode: cardMode, selected, show, onListingSelectionUpdate }">
            <TaskCard
                :id="listing.id"
                :imageId="listing.files?.[0]?.id"
                :name="listing.name"
                :description="listing.description"
                :vehicles="listing.vehicles"
                :status="listing.status"
                :files="listing.files"
                :start="listing.start"
                :end="listing.end"
                :duration="listing.duration"
                :mode="cardMode"
                :selected="selected"
                :show="show"
                :categories="listing.categories"
                :data-item="listing.dbNode"
                @update:data-item="
                    onDbNodeUpdate($event);
                    onListingSelectionUpdate(false);
                "
            />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" editField="categories" class="edit-array-control w-full md:w-80" />
        </template>
    </grid-container>
</template>

<script setup lang="ts">
import { Listing } from '~/composables/useListControls';
import GridContainer from '~/components/grids/common/GridContainer.vue';

const collectionName = 'events'; // Changed from 'tasks' to 'events'

const { listingList, updateDbNodeInListingList } = await useGrid({
    collectionName,
    prepareListingItem
});

const selectedCategories = ref([]);
const selectedMediaShowOptions = ref(['name', 'categories', 'description', 'start']);
const categoryOptions = useCategories();

const mediaShowOptions = ['name', 'categories', 'description', 'vehicles', 'start', 'status'];

const mediaSortOptions = [
    { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
    { label: 'Name (Z-A)', sort: 'name', order: 'desc' }
] as { label: string; sort: string; order: 'asc' | 'desc' }[];

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

function prepareListingItem(task: any): Listing<any> {
    return {
        id: task._id,
        name: task.name,
        description: task.description,
        vehicles: task.vehicles || [],
        status: task.status || [],
        files: task.files || [],
        start: task.start,
        end: task.end,
        duration: task.duration,
        categories: task.categories || [],
        dbNode: task
    };
}

function onDbNodeUpdate(dbNode: any) {
    updateDbNodeInListingList(dbNode);
}

async function handleItemCreated(newItem: any) {
    const listing = prepareListingItem(newItem);
    listingList.value = [...listingList.value, listing];
}

function test(v: string[]) {
    console.log(v);
}
</script>
