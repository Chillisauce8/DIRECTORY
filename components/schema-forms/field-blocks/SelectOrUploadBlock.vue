<template>
  <section :class="sharedFunctions.prepareClasses('array')" :id="props.description.id">
    <template v-if="initDone && sharedFunctions.shouldBeConstructed(props.description)"
              v-show="!props.description.xHideValue">

      <div class="array-of-files-header">
        <h1 class="title array-of-object" v-if="props.description.title">
          {{ sharedFunctions.getTitle() }}
        </h1>

        <Button icon="pi pi-plus" aria-label="Select Image" class="mr-2 mb-2"
                v-if="!sharedFunctions.isReadonly()"
                @click="openSelectImageDialog()">
        </Button>

        <Button icon="pi pi-upload" aria-label="Load Image" class="mr-2 mb-2"
                name="upload"
                v-if="!sharedFunctions.isReadonly()"
                @click="chooseFile()">
        </Button>

        <FileUpload mode="basic" ref="fileupload"
                    class="file-input"
                    customUpload @uploader="customUploader"
                    v-show="false"
                    @select="onFileChanged($event)" />

        <Button icon="pi pi-times" aria-label="Delete Images" class="mr-2 mb-2"
                v-if="selectedFiled.length > 0"
                @click="removeSelectedImages()">
        </Button>

      </div>

      <OrderList v-if="vm.model?.length" v-model="vm.model" dataKey="_doc" breakpoint="575px" scrollHeight="20rem"
        @update:selection="listSelectionChanged($event)">
        <template #item="{ item , index }">
          <div class="flex flex-wrap p-1 items-center gap-4 w-full">
            <img v-if="item.url" :src="item.url" :alt="item.name" :width="30" :height="30">
            <ImageWrapper
              v-else
              class="shrink-0 rounded"
              :id="item._doc"
              :alt="item.name"
              :width="30"
              :height="30"
              dpr="1"
              :singleImage="true"
            />

            <div class="flex flex-col">
              <span class="font-medium text-sm">{{ item.name }}</span>
              <span class="text-sm">{{ item.description }}</span>
            </div>
            <div v-if="item.rating" class="bg-surface-100 p-1" style="border-radius: 30px">
              <div class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2"
                   style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                <span class="text-surface-900 font-medium text-sm">{{ item.rating }}</span>
                <i class="pi pi-star-fill text-yellow-500"></i>
              </div>
            </div>
          </div>
        </template>
      </OrderList>

      <div v-if="!sharedFunctions.isValidMaxItems()"
           class="text-color_red field_wrap">Max items value is {{ props.description.xMaxItemsValue }}</div>

      <div v-if="!sharedFunctions.isValidMinItems()"
           class="text-color_red field_wrap">Min items value is {{ props.description.xMinItemsValue }}</div>
    </template>
  </section>

  <Dialog
    v-model:visible="showSelectDialog"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{width: '70rem'}"
    modal
    closable>
    <template #header>
      <span class="text-900 font-semibold text-xl">Select files</span>
      <div>
<!--          <input matInput type="text" (ngModelChange)="getFilteredList()" placeholder="Search" [(ngModel)]="queryConfig.search">-->
      </div>
    </template>

    <DataView :value="filteredFiles" layout="grid">
      <template #grid="slotProps">
        <div class="grid grid-cols-12 gap-4">
          <div v-for="(item, index) in slotProps.items" :key="index"
               class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-6 p-2">
            <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col">
              <div class="bg-surface-50 flex justify-center rounded p-4">
                <div class="relative mx-auto">
                  <ImageWrapper
                    class="rounded w-full select-image"
                    :id="item._doc"
                    :alt="item.name"
                    :width="200"
                    :height="200"
                    dpr="1"
                    :singleImage="true"
                    @click="item.selected = !item.selected"
                  />
                  <Tag :value="'SELECTED'" severity="success" class="absolute dark:!bg-surface-900"
                       v-if="item.selected"
                       style="left: 4px; top: 4px">
                  </Tag>
                </div>
              </div>
              <div class="pt-6">
                <div class="flex flex-row justify-between items-start gap-2">
                  <div>
                    <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">
                      {{ item.description }}
                    </span>
                    <div class="text-lg font-medium mt-1">{{ item.name }}</div>
                  </div>
                  <div v-if="item.rating" class="bg-surface-100 p-1" style="border-radius: 30px">
                    <div class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2" style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                      <span class="text-surface-900 font-medium text-sm">{{ item.rating }}</span>
                      <i class="pi pi-star-fill text-yellow-500"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>

    <template #footer>
      <Button label="Select" icon="pi pi-check" @click="handleAddFiles()" :disabled="false"></Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance, ref } from 'vue';
import { filesService } from '~/service/file/files-service';
import { pick } from '~/service/utils';
import FileUpload from 'primevue/fileupload';
import { fileHelperService } from '~/service/file/file-helper-service';


// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

let { vm, sharedFunctions, initDone } = useBaseArrayFieldControl(props, emits);

const showSelectDialog = ref(false);

const filteredFiles = ref([]);

const selectedFiled = ref([]);

const fileupload = ref();

let virtualIdCounter = 0;

onMounted(async () => {
  filteredFiles.value = await filesService.getFiles({type: 'Image'});

  const instance = getCurrentInstance();
  sharedFunctions.doOnMounted(instance);
});


function getNextVirtualId(): string {
  virtualIdCounter += 1;
  return 'v_' + virtualIdCounter;
}

function openSelectImageDialog() {
  showSelectDialog.value = true;
}

function handleAddFiles() {
  showSelectDialog.value = false;

  const selectedFiles: any = filteredFiles.value
    .filter((item: any) => item.selected)
    .map((item: any) => pick(item, ['_doc', 'name', 'description', 'rating']));

  if (!vm.model) {
    vm.model = [];
  }

  const selectedFilesIdList = selectedFiles.map((item: any) => item._doc);

  vm.model = vm.model.filter((item: any) => {
    if (item.uploaded) {
      return true;
    }

    if (selectedFilesIdList.includes(item._doc)) {
      return true;
    }

    return false;
  });

  const modelIdList = vm.model.map((item: any) => item._doc);

  for (const selectedFile of selectedFiles) {
    if (!modelIdList.includes(selectedFile._doc)) {
      vm.model.push(selectedFile);
    }
  }
}

function listSelectionChanged($event: any[]) {
  const modelIdList = vm.model.map((item: any) => item._doc);

  const value = $event.filter((item: any) => {
    if (modelIdList.includes(item._doc)) {
      return true;
    }

    return false;
  });

  selectedFiled.value = value;
}

function removeSelectedImages() {
  const selectedFilesIdList = selectedFiled.value.map((item: any) => item._doc);

  vm.model = vm.model.filter((item: any) => {
    if (selectedFilesIdList.includes(item._doc)) {
      return false;
    }

    return true;
  });

  if (selectedFiled.value) {
    const modelIdList = vm.model.map((item: any) => item._doc);

    const value = selectedFiled.value.filter((item: any) => {
      if (modelIdList.includes(item._doc)) {
        return true;
      }

      return false;
    });

    selectedFiled.value = value;
  }
}

const chooseFile = async () => {
  if (fileupload.value.hasFiles) {
     fileupload.value.upload();
     setTimeout(() => {
       fileupload.value.choose();
     }, 1000);
  } else {
    fileupload.value.choose();
  }
};

function onFileChanged(event: {files: File[]}) {
  if (event.files[0]) {
    const file = event.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const value: string = <string>reader.result;

      const extension: string = file.type || fileHelperService.getFileExtension(file.name);
      const type = fileHelperService.getFileType(file);

      const preparedValue = value.split(',')[1];

      const model = {
        name: file.name,
        extension,
        type,
        size: file.size,
        value: preparedValue,
        uploaded: true,
        _doc: getNextVirtualId(),
        url: fileHelperService.getUrlForFileData(preparedValue, extension),
      };

      vm.model.push(model);
    }
  }
}

const customUploader = async (event: any) => {
  //
};

</script>

<style lang="scss">

  .select-image img {
    width: 200px;
    height: 200px;
  }

</style>
