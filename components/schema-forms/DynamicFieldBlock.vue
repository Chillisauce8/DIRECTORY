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

const SimpleFieldBlock = resolveComponent('SimpleFieldBlock');
const ArrayOfObjectsFieldBlock = resolveComponent('ArrayOfObjectsFieldBlock');
const ArrayOfSimpleFieldBlock = resolveComponent('ArrayOfSimpleFieldBlock');
const ObjectFieldBlock = resolveComponent('ObjectFieldBlock');


// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const { im, vm, sharedFunctions } = useBaseField(props, emits);

const initDone = ref(false);


const componentInstance = computed(() => {
  switch (props.description.formDirective) {
    case 'valueField': return SimpleFieldBlock;
    case 'objectField': return ObjectFieldBlock;
    case 'container': return ObjectFieldBlock;
    case 'arrayOfValuesField': return ArrayOfSimpleFieldBlock;
    case 'arrayOfObjectsField': return ArrayOfObjectsFieldBlock;
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
  if (['objectField', 'arrayOfObjectsField', 'arrayOfImagesField', 'arrayOfVideoField'].includes(props.description.formDirective)) {
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

  switch (props.description.formDirective) {
    case 'valueField':
      if (isObject(parentModelToInit) && !Array.isArray(parentModelToInit) && !(props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = undefined;
      }
      break;

    // case 'objectField':
    //   if (! (props.description.description.header.name in parentModelToInit)) {
    //     parentModelToInit[props.description.description.header.name] = {};
    //   }
    //   break;

    case 'arrayOfValuesField':
      if (isObject(parentModelToInit) && !Array.isArray(parentModelToInit) && !(props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = [];
      }

      break;

    case 'arrayOfObjectsField':
      if (!(props.description.description.header.name in parentModelToInit)) {
        parentModelToInit[props.description.description.header.name] = [];
      }
      break;

    case 'filter':
      if (!(props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = [];
      }
      break;

    case 'arrayOfImagesField':
      if (!(props.description.description.header.name in parentModelToInit)) {
        parentModelToInit[props.description.description.header.name] = [];
      }
      break;

    case 'arrayOfVideoField':
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
