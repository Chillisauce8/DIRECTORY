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
    :show="selectedFilesShowOptions"
    :listings="listingList"
    :category-options="categoryOptions"
    :listing-collection="collectionName"
  >
    <template #controls>
      <FilterControl :options="categoryOptions" v-model="selectedCategories" v-bind="filterControlConfig" />
      <ShowControl v-model="selectedFilesShowOptions" :show-options="filesShowOptions" />
      <SortControl :sort-options="filesSortOptions" />
      <SearchControl :search-fields="searchFields" />
    </template>

    <template #add-controls>
<!--      <FileUpload mode="basic" @select="onFileSelect" customUpload auto severity="secondary" class="p-button-outlined" chooseLabel="Add" />-->
      <Button label="Add" @click="fileDialog=true"/>

      <Dialog v-model:visible="fileDialog" :style="{ width: '900px' }" header="File Details" :modal="true"
              class="p-fluid">

        <div class="p-8 rounded-border flex flex-col border border-surface items-center gap-8">
          <FilesUpload @uploaded:file="onFileUploaded($event)">
          </FilesUpload>
        </div>

        <template #footer>
          <Button label="Cancel" icon="pi pi-times" @click="fileDialog = false" />
<!--          <Button label="Save" icon="pi pi-check" @click="uploadFile" />-->
        </template>
      </Dialog>
    </template>

    <template #card="{ listing, mode: cardMode, selected, show, onListingSelectionUpdate }">
        <MediaCard :id="listing.id"
                   :imageId="listing?.images?.[0]?.id"
                   :name="listing.name"
                   :mode="cardMode"
                   :loveable="listing.loveable"
                   :selected="selected"
                   :show="show"
                   :data-item="listing.dbNode"
                   :categories="listing.categories"
                   @update:data-item="onDbNodeUpdate($event); onListingSelectionUpdate(false)">
        </MediaCard>
    </template>

    <template #edit-controls>
      <EditArrayControl :options="categoryOptions" editField="categories" placeholder="Edit Categories"
                        class="edit-array-control w-full md:w-80" />
    </template>
  </grid-container>
</template>

<script setup lang="ts">
import {FileDbNode} from '~/service/file/files-service';
import type {Listing} from '~/composables/useListControls';
import {FileType} from '~/service/file/file-helper-service';
import {useGrid} from '~/composables/grid.composables';
import {useCategoriesService} from '~/service/cars/categories.service';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const categoriesService = useCategoriesService();

const collectionName = 'files';

const {listingList, updateDbNodeInListingList} = await useGrid({
  collectionName,
  prepareListingItem,
  createDbNode: async (dbNode: any) => {return dbNode},
});

const categoryList = await categoriesService.getList();

const categoryOptions = ref<any[]>(categoryList.map((category) => ({id: category._doc, name: category.name})));
const selectedCategories = ref([]);
const selectedFilesShowOptions = ref(['name']);

const filesShowOptions = ['name', 'categories'];
const filesSortOptions = [
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

const fileDialog = ref(false);

function prepareListingItem(file: FileDbNode): Listing<FileDbNode> {
  return {
    id: file._doc,
    name: file.name,
    categories: (file?.categories ?? []),
    images: file.type !== FileType.Document ? [{id: file._doc, alt: file.name}] : [],
    dbNode: file
  };
}

function onDbNodeUpdate(dbNode: any) {
  updateDbNodeInListingList(dbNode);

  toast.add({ severity: 'success', summary: 'Successful', detail: 'File Data Updated', life: 3000 });
}

function onFileUploaded(data) {
  listingList.value = [...listingList.value, prepareListingItem(data)];

  toast.add({ severity: 'success', summary: 'Successful', detail: 'File Added', life: 3000 });
}

</script>
