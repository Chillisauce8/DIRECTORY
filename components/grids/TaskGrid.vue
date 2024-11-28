<template>
    <grid-container-events
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
            <ShowControl v-model="selectedMediaShowOptions" @update:modelValue="test" :show-options="mediaShowOptions" />
            <SortControl :sort-options="mediaSortOptions" />
            <SearchControl :search-fields="searchFields" />
        </template>

        <template #card="{ event, mode: cardMode, selected, show, onNameUpdate, onCategoriesUpdate, onEventSelectionUpdate }">
            <TaskCard
                :id="event.id"
                :imageId="event.files[0]?.id"
                :name="event.name"
                :description="event.description"
                :vehicles="event.vehicles"
                :status="event.status"
                :files="event.files"
                :start="event.start"
                :end="event.end"
                :duration="event.duration"
                :mode="cardMode"
                :selected="selected"
                :show="show"
                :categories="event.categories"
                @update:name="onNameUpdate"
                @update:categories="onCategoriesUpdate"
                @update:selected="onEventSelectionUpdate"
            />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" editField="categories" class="edit-array-control w-full md:w-80" />
        </template>
    </grid-container-events>
</template>

<script setup lang="ts">
const selectedCategories = ref([]);
const selectedMediaShowOptions = ref(['name', 'categories', 'description', 'start']);
const categoryOptions = useCategories();

// Update mediaShowOptions to include all available fields
const mediaShowOptions = ['name', 'categories', 'description', 'vehicles', 'start', 'status'];

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

function test(v: string[]) {
    console.log(v);
}

// Remove these as they're not needed anymore
// const emit = defineEmits<{
//     'update:selected': [payload: { id: string; selected: boolean }];
// }>();
// function handleItemSelection(id: string, selected: boolean) { ... }
</script>
