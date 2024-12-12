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
      <FileUpload mode="basic" @select="onFileSelect" customUpload auto severity="secondary" class="p-button-outlined" chooseLabel="Add" />

      <Dialog v-model:visible="fileDialog" :style="{ width: '450px' }" header="File Details" :modal="true"
              class="p-fluid">

        <div class="p-8 rounded-border flex flex-col border border-surface items-center gap-8">
          <FloatLabel>
            <InputText :id="'name-' + fileNode.name + fileNode.type + fileNode.size" type="text"
                       v-model="fileNode.name" required/>
            <label :for="'name-' + fileNode.name + fileNode.type + fileNode.size">File Name</label>
          </FloatLabel>

          <FloatLabel>
            <InputText :id="'description-' + fileNode.name + fileNode.type + fileNode.size" type="text"
                       v-model="fileNode.description" maxlength="1000"/>
            <label :for="'description-' + fileNode.name + fileNode.type + fileNode.size">Description</label>
          </FloatLabel>

          <FloatLabel>
            <Select id="'rating-' + file.name + file.type + file.size"
                    v-model="fileNode.rating" :options="ratingItems">
            </Select>
            <label :for="'rating-' + fileNode.name + fileNode.type + fileNode.size">Rating</label>
          </FloatLabel>
        </div>

        <template #footer>
          <Button label="Cancel" icon="pi pi-times" @click="fileDialog = false" />
          <Button label="Save" icon="pi pi-check" @click="uploadFile" />
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
      <EditArrayControl :options="categoryOptions" editField="categories" placeholder="Edit Categories" class="edit-array-control w-full md:w-80" />
    </template>
  </grid-container>
</template>

<script setup lang="ts">
import {FileDbNode} from '~/service/file/files-service';
import type {Listing} from '~/composables/useListControls';
import {fileHelperService, FileType} from '~/service/file/file-helper-service';
import EXIF from '~/service/file/exif';
import {fileUploaderService} from '~/service/file/file-uploader-service';
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

let fileNode = ref<any>({});
let fileToUpload: File | null = null;

const ratingItems = ref([0, 1, 2, 3, 4, 5]);
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

async function prepareFileNode(file: File): Promise<{node: FileDbNode; file: File}> {
  return new Promise((resolve) => {
    const type = fileHelperService.getFileType(file);
    const extension = fileHelperService.getFileExtension(file.name);
    const originalType = file.type || extension;

    const medialProperties = fileHelperService.getMediaFileProperties(file);

    let imgEl;
    let imageInfo: any = {};

    if (type === FileType.Image) {
      imgEl = document.getElementById('img-' + file.name + file.type + file.size);

      if (medialProperties.aspectRatio) {
        imageInfo = {
          width: medialProperties.width,
          height: medialProperties.height,
          aspectRatio: medialProperties.aspectRatio,
        }
      } else if (imgEl) {
        const w = imgEl.naturalWidth;
        const h = imgEl.naturalHeight;
        const aspectRation = fileHelperService.calculateAspectRatio(w, h);

        imageInfo = {
          width: w,
          height: h,
          aspectRation
        }
      }
    }

    const exif = new EXIF();
    exif.getData(file, function () {

      const metadata = exif.getAllTags(this);

      const data: any = {
        node: {
          name: file.name,
          description: '',
          rating: null,
          originalType,
          type,
          extension,
          size: file.size,
          imageInfo,
          data: metadata,
        },
        file: file,
      };

      resolve(data);
    });
  });
}

async function onFileSelect(event: {files: File[]}) {
  fileNode.value = null;
  fileToUpload = null;

  const file = event.files[0];

  const nodeInfo = await prepareFileNode(file);

  fileNode.value = nodeInfo.node;
  fileToUpload = nodeInfo.file;

  fileDialog.value = true;
}

async function uploadFile() {
  if (!fileNode.value || !fileToUpload) {
    return;
  }

  const config: any = {
    url: '/api/files',
    data: {model: fileNode.value, file: fileToUpload},
    method: 'POST',
  }

  const result = await fileUploaderService.upload<FileDbNode>(config);

  if (!result) {
    return;
  }

  fileDialog.value = false;
  listingList.value = [...listingList.value, prepareListingItem(result)];

  updateCategoryOptions(listingList.value);
}
</script>
