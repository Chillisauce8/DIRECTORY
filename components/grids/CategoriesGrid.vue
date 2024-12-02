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
    :show="selectedCategoryShowOptions"
    :listings="listingList"
    :category-options="categoryOptions"
    :listing-collection="collectionName">

    <template #controls>
<!--      <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />-->
      <ShowControl v-model="selectedCategoryShowOptions" :show-options="categoriesShowOptions" />
      <SortControl :sort-options="categoriesSortOptions" />
      <SearchControl :search-fields="searchFields" />
    </template>

    <template #card="{ listing, mode: cardMode, selected, show, onListingSelectionUpdate }">
      <DefaultCard :id="listing.id"
                 :imageId="listing?.images?.[0]?.id"
                 :name="listing.name"
                 :mode="cardMode"
                 :loveable="listing.loveable"
                 :selected="selected"
                 :show="show"
                 :categories="listing.categories">
        <template #inline-edit>
          <div v-if="cardMode === 'edit' && selected" @click.stop>
            <DataItemInlineEdit :collection="collectionName"
                                :fields="{name: 1, categories: 1}"
                                :data-item="listing.dbNode"
                                @update:data-item="onDbNodeUpdate($event); onListingSelectionUpdate(false)"/>
          </div>
        </template>
      </DefaultCard>
    </template>

    <template #edit-controls>
      <EditArrayControl :options="categoryOptions"
                        editField="categories"
                        placeholder="Edit Categories"
                        class="edit-array-control w-full md:w-80" />
    </template>
  </grid-container>
</template>

<script setup lang="ts">
import {Listing} from '~/composables/useListControls';
import {CategoryDbNode, useCategoriesService} from '~/service/cars/categories.service';

const categoriesService = useCategoriesService();

const categoryOptions = ref<any[]>([]);
const selectedCategories = ref([]);
const selectedCategoryShowOptions = ref(['name']);

const categoriesShowOptions = ['name'/*, 'categories'*/];
const categoriesSortOptions = [
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
  // { field: 'categories', label: 'Categories' }
];

const collectionName = 'categories';

const {listingList, updateDbNodeInListingList} = await useGrid({
    collectionName,
    prepareListingItem,
});

function prepareListingItem(category: CategoryDbNode): Listing<any> {
  return {
    id: category._doc,
    name: category.name,
    categories: (category?.categories ?? []),
    images: (category?.images ?? []).map(i => ({id: i.image.id, alt: i.image.name})),
    dbNode: category,
  };
}

function onDbNodeUpdate(dbNode: CategoryDbNode) {
  updateDbNodeInListingList(dbNode);
}
</script>

<style scoped lang="scss">

</style>
