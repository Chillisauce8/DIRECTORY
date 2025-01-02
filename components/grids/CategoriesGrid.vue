<template>
    <grid-container
        functionControlDisplay="icon"
        :filters="[
            {
                field: 'categoryGroup',
                options: categoryOptions,
                selected: selectedCategories
            }
        ]"
        :visibleFunctionControls="['select', 'edit']"
        defaultFunctionControl="select"
        defaultCardSize="Big Cards"
        :searchFields="searchFields"
        :show="selectedCategoryShowOptions"
        :listings="listingList"
        :category-options="categoryOptions"
        :listing-collection="collectionName"
        :on-item-created="handleItemCreated"
    >
        <template #controls>
            <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />
            <ShowControl v-model="selectedCategoryShowOptions" :show-options="categoriesShowOptions" />
            <!-- <SortControl :sort-options="categoriesSortOptions" /> -->
            <SearchControl :search-fields="searchFields" />
        </template>
        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" editField="categories" placeholder="Edit Categories" class="edit-array-control w-full md:w-80" />
        </template>

        <template #card="{ listing, mode: cardMode, selected, show, onListingSelectionUpdate }">
            <category-card
                :id="listing.id"
                :imageId="listing?.images?.[0]?.id"
                :name="listing.name"
                :type="listing.type"
                :mode="cardMode"
                :loveable="listing.loveable"
                :selected="selected"
                :show="show"
                :data-item="listing.dbNode"
                :categoryGroup="listing.categoryGroup"
                @update:data-item="
                    onDbNodeUpdate($event);
                    onListingSelectionUpdate(false);
                "
            >
            </category-card>
        </template>
    </grid-container>
</template>

<script setup lang="ts">
import { Listing } from '~/composables/useListControls';
import { CategoryDbNode } from '~/service/cars/categories.service';

const collectionName = 'categories';

const { listingList, updateDbNodeInListingList } = await useGrid({
    collectionName,
    prepareListingItem
});

const categoryOptions = ref<any[]>(listingList.value.filter(({ dbNode }) => dbNode.type === 'Category Group').map(({ dbNode }) => ({ id: dbNode._doc, name: dbNode.name })));
const selectedCategories = ref([]);
const selectedCategoryShowOptions = ref(['name']);

const categoriesShowOptions = ['name', 'categories'];
// const categoriesSortOptions = [
//     { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
//     { label: 'Name (Z-A)', sort: 'name', order: 'desc' }
// ];

const filterControlConfig = {
    display: 'chip',
    optionLabel: 'name',
    filter: true,
    placeholder: 'Filter by Category Group',
    maxSelectedLabels: 2,
    className: 'category-control md:w-60'
} as const;

const searchFields = [{ field: 'name', label: 'Name' }];

function prepareListingItem(category: CategoryDbNode): Listing<any> {
    return {
        id: category._doc,
        name: category.name,
        type: category.type,
        categoryGroup: category.categoryGroup,
        categories: category?.categories ?? [],
        images: (category?.images ?? []).map((i) => ({ id: i.image.id, alt: i.image.name })),
        dbNode: category
    };
}

function onDbNodeUpdate(dbNode: CategoryDbNode) {
    updateDbNodeInListingList(dbNode);
}

async function handleItemCreated(newItem: any) {
    // Add the new item to the listing list
    const listing = prepareListingItem(newItem);
    listingList.value = [...listingList.value, listing];

    // If it's a category group, update options
    if (newItem.type === 'Category Group') {
        categoryOptions.value = [...categoryOptions.value, { id: newItem._doc, name: newItem.name }];
    }
}
</script>

<style scoped lang="scss"></style>
