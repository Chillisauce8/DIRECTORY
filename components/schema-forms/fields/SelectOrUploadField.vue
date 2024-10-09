<template>
  <section :class="sharedFunctions.prepareClasses('array')" :id="props.description.id">
    <template v-if="initDone && sharedFunctions.shouldBeConstructed(props.description.header)"
              v-show="!props.description.xHideValue">

      <div class="array-of-files-header">
        <h1 class="title array-of-object" v-if="props.description.header.title">
          {{ sharedFunctions.getTitle() }}
        </h1>

        <Button icon="pi pi-plus" aria-label="Select Image"
                v-if="!sharedFunctions.isReadonly()"
                @click="openSelectImageDialog()">
        </Button>

        <SpeedDial v-if="vm.model?.length" :model="createSpeedDialItems()" direction="left" />
      </div>

      <template v-if="model?.length">
        <div class="field_wrap">
          <div class="row wrap">

            <div v-for="(item, itemIndex) in vm.model" :key="itemIndex">
              <div v-if="item.image && item.image.id">
                <ImageWrapper
                  :cloudinaryId="item.image.id"
                  :alt="item.image.name"
                  :width="501"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <div class="empty row start-center" v-if="!model?.length">
        <p class="label flex">{{ description.header.title }}</p>

        <button mat-icon-button aria-label="Add"
                *ngIf="!isReadonly() && canAddMore()"
                (click)="openSelectImageDialog()">
          <i class="icon icon-add"></i>
        </button>
      </div>

      <div v-if="!sharedFunctions.isValidMaxItems()"
           class="text-color_red field_wrap">Max items value is {{ props.description.xMaxItemsValue }}</div>

      <div v-if="!sharedFunctions.isValidMinItems()"
           class="text-color_red field_wrap">Min items value is {{ props.description.xMinItemsValue }}</div>
    </template>
  </section>

  <Dialog
    v-model:visible="showSelectDialog"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{width: '36rem'}"
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
                  <img class="rounded w-full" :src="`https://primefaces.org/cdn/primevue/images/product/${item.image}`" :alt="item.name" style="max-width: 300px"/>
                  <Tag :value="'SELECTED'" severity="success" class="absolute dark:!bg-surface-900" style="left: 4px; top: 4px"></Tag>
                </div>
              </div>
              <div class="pt-6">
                <div class="flex flex-row justify-between items-start gap-2">
                  <div>
                    <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.category }}</span>
                    <div class="text-lg font-medium mt-1">{{ item.name }}</div>
                  </div>
                  <div class="bg-surface-100 p-1" style="border-radius: 30px">
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
      <Button label="Save" icon="pi pi-check" @click="handleAddFiles()" :disabled="false"></Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance, ref } from 'vue';
import { filesService } from '~/service/file/files-service';


// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

let { vm, sharedFunctions, initDone } = useBaseArrayFieldControl(props, emits);

const showSelectDialog = ref(false);

const filteredFiles = ref([]);

onMounted(async () => {
  filteredFiles.value = await filesService.getFiles({type: 'Image'});
});

function createSpeedDialItems() {
  const index = vm.model.length - 1;
  return [
    // {
    //   icon: 'pi pi-plus',
    //   command: () => openContextMenu(index),
    //   visible: () => sharedFunctions.canAddMore() && vm.isSelectionMode
    // },
    // {
    //   icon: 'pi pi-plus',
    //   command: () => addRowAfter(index),
    //   visible: () => sharedFunctions.canAddMore() && !vm.isSelectionMode
    // },
    {
      icon: 'pi pi-times',
      command: () => sharedFunctions.deleteRow(index),
      visible: () => sharedFunctions.canRemoveMore() && !(props.description.header.required && index === 0 && vm.model.length === 1)
    },
    {
      icon: 'pi pi-chevron-up',
      command: () => sharedFunctions.moveRowUp(index),
      visible: () => index !== 0
    },
    {
      icon: 'pi pi-chevron-down',
      command: () => sharedFunctions.moveRowDown(index),
      visible: () => index !== vm.model.length - 1
    }
  ];
}


function openSelectImageDialog() {
  showSelectDialog.value = true;
}


function handleAddFiles() {
  showSelectDialog.value = false;
}

</script>

<style scoped lang="scss">

</style>
