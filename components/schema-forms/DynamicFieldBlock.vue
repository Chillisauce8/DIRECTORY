<template>
  <component v-if="initDone"
             :is="componentInstance"
             :model="fakeModel" @modelChange="onModelChange($event)"
             :context="vm.context" :description="props.description.description">
  </component>
</template>


<script setup lang="ts">
import useBaseField from '~/composables/schema-forms/useBaseField';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { schemaFormsProcessingHelper } from '~/service/schema-forms/schemaFormsProcessing.service';
import { isUndefined, pick } from '~/service/utils';
import { isObject } from '~/service/utils';
// @ts-ignore
import { getCurrentInstance } from 'vue';
import { BlockComponents } from '~/service/schema-forms/blockComponents';

const ValueBlock = resolveComponent('ValueBlock');
const ArrayOfObjectsBlock = resolveComponent('ArrayOfObjectsBlock');
const ArrayOfValuesBlock = resolveComponent('ArrayOfValuesBlock');
const ObjectBlock = resolveComponent('ObjectBlock');
const SelectOrUploadBlock = resolveComponent('SelectOrUploadBlock');


// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const { im, vm, sharedFunctions } = useBaseField(props, emits);

const initDone = ref(false);


const componentInstance = computed(() => {
  switch (props.description.blockComponent) {
    case BlockComponents.value: return ValueBlock;
    case BlockComponents.object: return ObjectBlock;
    case BlockComponents.container: return ObjectBlock;
    case BlockComponents.arrayOfValues: return ArrayOfValuesBlock;
    case BlockComponents.arrayOfObjects: return ArrayOfObjectsBlock;
    case BlockComponents.selectOrUploadArray: return SelectOrUploadBlock;
  }
});


const fakeModel = computed(() => {
  const key = _getKeyForInnerModel();

  if (sharedFunctions.shouldSetValueForRealModelValue()) {
    // const parentPath = sharedFunctions.getParentPath();
    // const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);
    //
    // return pick(parentModel, sharedFunctions.getDescription().content.map((item: any) =>
    //   item.description.name));

    return im._innerModel;
  }

  return im._innerModel[key];
});

function onModelChange(value: any) {
  const key = _getKeyForInnerModel();

  if (sharedFunctions.getDescription() && sharedFunctions.getDescription().isContainer && vm.context) {
    // const parentPath = sharedFunctions.getParentPath();
    // let parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);
    //
    // // const previousValue = parentModel[key];
    //
    // Object.assign(parentModel, value);
    // sharedFunctions.processInnerModelChanged(parentModel);
    // schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());

    if (im._innerModel !== value) {
      im._innerModel = value;
      sharedFunctions.processInnerModelChanged(value);
      schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
    }
  } else {
    const previousValue = im._innerModel[key];

    if (previousValue !== value) {
      im._innerModel[key] = value;
      sharedFunctions.processInnerModelChanged();
      schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
    }
  }
}

onMounted(() => {
  const instance = getCurrentInstance();
  sharedFunctions.doOnMounted(instance);
});

onDeactivated(() => {
  sharedFunctions.onDeactivated();
});

function initField(): void {
  initializeModel();

  initDone.value = true;
}

function setModelValueForContainerTagDescription(value: any) {
  //
}

function _getKeyForInnerModel(): string {
  if ([BlockComponents.object, BlockComponents.arrayOfObjects,
    BlockComponents.arrayOfImages, BlockComponents.arrayOfVideo].includes(props.description.blockComponent)) {
    return props.description.description.header.name;
  }

  return props.description.description.name;
}

function initializeModel() {
  let parentModelToInit;

  if (sharedFunctions.shouldSetValueForRealModelValue()) {
    const parentPath = sharedFunctions.getParentPath();
    const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);

    vm.model = pick(parentModel, sharedFunctions.getDescription().content.map((item: any) =>
      item.description.name));

    // const parentPath = sharedFunctions.getParentPath();
    // parentModelToInit = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);
  } else {
    vm.model = props.model || {};
    parentModelToInit = props.model;
  }

  if (isUndefined(parentModelToInit)) {
    // related with structure tag processing
    return;
  }

  switch (props.description.blockComponent) {
    case BlockComponents.value:
      if (isObject(parentModelToInit) && !Array.isArray(parentModelToInit) && !(props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = undefined;
      }
      break;

    // case BlockComponents.object:
    //   if (! (props.description.description.header.name in parentModelToInit)) {
    //     parentModelToInit[props.description.description.header.name] = {};
    //   }
    //   break;

    case BlockComponents.arrayOfValues:
      if (isObject(parentModelToInit) && !Array.isArray(parentModelToInit) && !(props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = [];
      }

      break;

    case BlockComponents.arrayOfObjects:
      if (!(props.description.description.header.name in parentModelToInit)) {
        parentModelToInit[props.description.description.header.name] = [];
      }
      break;

    case 'filter':
      if (!(props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = [];
      }
      break;

    case BlockComponents.arrayOfImages:
      if (!(props.description.description.header.name in parentModelToInit)) {
        parentModelToInit[props.description.description.header.name] = [];
      }
      break;

    case BlockComponents.arrayOfVideo:
      if (!(props.description.description.header.name in parentModelToInit)) {
        parentModelToInit[props.description.description.header.name] = [];
      }
      break;
  }
}

sharedFunctions.initField = initField;
</script>


<style>

</style>
