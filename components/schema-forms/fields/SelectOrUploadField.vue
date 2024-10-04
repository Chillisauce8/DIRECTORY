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
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { uniqWith } from '~/service/utils';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import { getCurrentInstance } from 'vue';
import { BlockComponents } from '~/service/schema-forms/blockComponents';


// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

let { vm, sharedFunctions, initDone } = useBaseArrayFieldControl(props, emits);



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

}

</script>

<style scoped lang="scss">

</style>
