<template>
    <grid-container
        modeControlDisplay="icon"
        :filters="[
            {
                field: 'categoryGroup',
                options: categoryOptions,
                selected: selectedCategories,
                isArray: false
            }
        ]"
        :visibleModeControls="['select', 'edit']"
        defaultModeControl="select"
        defaultCardSize="Big Cards"
        :searchFields="searchFields"
        :listings="listingList"
        :category-options="categoryOptions"
        :listing-collection="collectionName"
        :on-item-created="handleItemCreated"
    >
        <template #controls>
            <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />
            <ShowControl v-model="selectedCategoryShowOptions" :show-options="categoriesShowOptions" />
            <SearchControl :search-fields="searchFields" />
        </template>

        <template #card="{ listing }">
            <category-card :id="listing.id" :data-item="listing" @update:data-item="onDbNodeUpdate" />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" editField="categories" placeholder="Edit Categories" class="edit-array-control w-full md:w-80" />
        </template>
    </grid-container>
</template>

<script setup lang="ts">
import { Listing } from '~/composables/useListControls';
import { CategoryDbNode } from '~/service/cars/categories.service';
import GridContainer from '~/components/grids/common/GridContainer.vue';

const collectionName = 'categories';

const { listingList, updateDbNodeInListingList } = await useGrid({
    collectionName,
    prepareListingItem
});

const categoryOptions = ref<any[]>(listingList.value.filter(({ dbNode }) => dbNode.type === 'Category Group').map(({ dbNode }) => ({ id: dbNode._id, name: dbNode.name })));
const selectedCategories = ref([]);
const selectedCategoryShowOptions = ref(['name']);

const categoriesShowOptions = ['name', 'categories'];

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
        id: category._id,
        name: category.name,
        type: category.type,
        categoryGroup: category.categoryGroup,
        categories: category?.categories ?? [],
        images: category?.images?.length
            ? category.images.map((i) => ({
                  id: i.image?.id || null,
                  alt: i.image?.name || ''
              }))
            : [],
        dbNode: category
    };
}

watch(
    () => listingList.value,
    (newValue) => {
        console.log('listingList updated:', newValue);
        if (newValue?.length) {
            console.log('First item images:', newValue[0].images);
        }
    },
    { deep: true }
);

async function handleItemCreated(newItem: any) {
    const listing = prepareListingItem(newItem);
    listingList.value = [...listingList.value, listing];

    if (newItem.type === 'Category Group') {
        categoryOptions.value = [...categoryOptions.value, { id: newItem._id, name: newItem.name }];
    }
}
</script>

<style scoped lang="scss"></style>
