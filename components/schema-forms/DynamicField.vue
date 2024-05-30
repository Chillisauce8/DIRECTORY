<template>
  <div ref="selfRef" class="schema-form-dynamic-field">

    <template v-if="initDone">

      <ValueField v-if="props.description.formDirective === 'valueField'"
                 :model="fakeModel" @modelChange="onModelChange($event)"
                 :context="vm.context"
                 :description="props.description.description">
      </ValueField>

      <ObjectField v-else-if="props.description.formDirective === 'objectField'"
                  :model="fakeModel" @modelChange="onModelChange($event)"
                  :context="vm.context"
                  :description="props.description.description">
      </ObjectField>

      <ObjectField v-else-if="props.description.formDirective === 'structureTag'"
                  :model="fakeModel" @modelChange="onModelChange($event)"
                  :context="vm.context"
                  :description="props.description.description">
      </ObjectField>

      <ArrayOfValuesField v-else-if="props.description.formDirective === 'arrayOfValuesField'"
                         :model="fakeModel" @modelChange="onModelChange($event)"
                         :context="vm.context"
                         :description="props.description.description">
      </ArrayOfValuesField>

      <ArrayOfObjectsField v-else-if="props.description.formDirective === 'arrayOfObjectsField'"
                          :model="fakeModel" @modelChange="onModelChange($event)"
                          :context="vm.context"
                          :description="props.description.description">
      </ArrayOfObjectsField>

<!--    <ImagesArrayField v-else-if="props.description.formDirective === 'arrayOfImagesField'"-->
<!--                      :model="fakeModel" @modelChange="onModelChange($event)"-->
<!--                      :context="vm.context"-->
<!--                      :description="props.description.description">-->
<!--    </ImagesArrayField>-->

<!--    <VideoArrayField v-else-if="props.description.formDirective === 'arrayOfVideoField'"-->
<!--                     :model="fakeModel" @modelChange="onModelChange($event)"-->
<!--                     :context="vm.context"-->
<!--                     :description="props.description.description">-->
<!--    </VideoArrayField>-->

<!--    <MapPlaceField v-else-if="props.description.formDirective === 'mapPlaceField'"-->
<!--                   :model="fakeModel" @modelChange="onModelChange($event)"-->
<!--                   :context="vm.context"-->
<!--                   :description="props.description.description">-->
<!--    </MapPlaceField>-->
    </template>
  </div>
</template>

<script setup lang="ts">

import useBaseField from '~/composables/schema-forms/useBaseField';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import {schemaFormsProcessingHelper} from '~/service/schema-forms/schemaFormsProcessing.service';
import { isUndefined } from '~/service/utils';
import { isObject } from '~/service/utils';
import ArrayOfObjectsField from '~/components/schema-forms/ArrayOfObjectsField.vue';
import ArrayOfValuesField from '~/components/schema-forms/ArrayOfValuesField.vue';
import ObjectField from '~/components/schema-forms/ObjectField.vue';
import ValueField from '~/components/schema-forms/ValueField.vue';


// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

const formRef = ref(null);
const selfRef = ref(null);
const parentObjectFieldRef = ref(null);
const parentGroupFieldRef = ref(null);
const parentDynamicControlRef = ref(null);


const {im, vm, sharedFunctions} = useBaseField(props, emits);

const initDone = ref(false);

const fakeModel = computed(() => {
  const key = _getKeyForInnerModel();

  if (sharedFunctions.shouldSetValueForRealModelValue()) {
    const parentPath = sharedFunctions.getParentPath();
    const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);
    return parentModel[key];
  }

  return im._innerModel[key];
});


function onModelChange(value: any) {
  const key = _getKeyForInnerModel();

  if (sharedFunctions.getDescription() && sharedFunctions.getDescription().structureTagDescription && vm.context) {
    const parentPath = sharedFunctions.getParentPath();
    const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);

    const previousValue = parentModel[key];

    if (previousValue !== value) {
      parentModel[key] = value;
      sharedFunctions.processInnerModelChanged(parentModel);
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

function doOnMounted() {
  initField();
}


onMounted(() => {
  const refs = {
    self: selfRef,
    form: {
      formName: formRef.value?.name,
      needCorrectExistingValues: true,
    },
    parentObjectField: parentObjectFieldRef,
    parentGroupField: parentGroupFieldRef,
    parentDynamicControl: parentDynamicControlRef,
  };

  sharedFunctions.setRefs(refs);

  doOnMounted();
});


onDeactivated(() => {
  sharedFunctions.onDeactivated();
});


function initField(): void {
  initializeModel();

  initDone.value = true;
}

function setModelValueForStructureTagDescription(value: any) {
  //
}

function _getKeyForInnerModel(): string {
  if (['objectField', 'arrayOfObjectsField', 'arrayOfImagesField', 'arrayOfVideoField'].includes(
      props.description.formDirective)) {
    return props.description.description.header.name;
  }

  return props.description.description.name;
}

function initializeModel() {
  let parentModelToInit;

  if (sharedFunctions.shouldSetValueForRealModelValue()) {
    const parentPath = sharedFunctions.getParentPath();
    parentModelToInit = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);
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
      if (isObject(parentModelToInit) && !Array.isArray(parentModelToInit) &&
        !(props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = undefined;
      }
      break;

    // case 'objectField':
    //   if (! (props.description.description.header.name in parentModelToInit)) {
    //     parentModelToInit[props.description.description.header.name] = {};
    //   }
    //   break;

    case 'arrayOfValuesField':
      if (isObject(parentModelToInit) && !Array.isArray(parentModelToInit) &&
        !(props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = [];
      }

      break;

    case 'arrayOfObjectsField':
      if (! (props.description.description.header.name in parentModelToInit)) {
        parentModelToInit[props.description.description.header.name] = [];
      }
      break;

    case 'filter':
      if (! (props.description.description.name in parentModelToInit)) {
        parentModelToInit[props.description.description.name] = [];
      }
      break;

    case 'arrayOfImagesField':
      if (! (props.description.description.header.name in parentModelToInit)) {
        parentModelToInit[props.description.description.header.name] = [];
      }
      break;

    case 'arrayOfVideoField':
      if (! (props.description.description.header.name in parentModelToInit)) {
        parentModelToInit[props.description.description.header.name] = [];
      }
      break;
  }
}


sharedFunctions.initField = initField;

</script>

<style scoped>

</style>
