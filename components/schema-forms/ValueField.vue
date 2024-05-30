<template>
  <div ref="selfRef">
    <div class="field_wrap row start-baseline gap-horizontal_15"
         v-if="shouldFieldBeConstructed" v-show="!props.description.xHideValue">

      <p class="label flex-none" v-if="showTitle">
        {{ sharedFunctions.getTitle() }}

        <i class="icon icon-question-mark padding_-5" v-if="vm.descriptionText"
           v-tooltip.bottom="vm.descriptionText"></i>
      </p>

      <div class="flex">
        <DynamicControl
          :description="props.description"
          :model="vm.model" @modelChange="onModelChange($event)"
          :context="props.context"
          :noPlaceholder="showTitle">
        </DynamicControl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import type { BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import useBaseField from '~/composables/schema-forms/useBaseField';
import DynamicControl from '~/components/schema-forms/DynamicControl.vue';
import { getCurrentInstance } from 'vue';



export interface ValueFieldProps extends BaseFieldProps {
  showTitle?: boolean;
}


// @ts-ignore
const props = defineProps<ValueFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const selfRef = ref(null);


let {im, vm, sharedFunctions} = useBaseField(props, emits);

const processXFeaturesBase = sharedFunctions.processXFeatures;

vm = extend(vm, {
  descriptionText: '',
  showTitle: props.showTitle,
});


const shouldFieldBeConstructed = ref(false);

function doOnMounted() {
  refreshShouldBeConstructedValues();

  if (shouldFieldBeConstructed) {
    refreshDescription();
    initField();
  }
}

function initField(): void {
  if (vm.model === undefined || vm.model === null) {
    createModel();
  }

  if (props.description.showTitle !== undefined) {
    vm.showTitle = props.description.showTitle;
  }

  if (props.showTitle === undefined) {
    if (props.description.formType === 'checkbox') {
      vm.showTitle = false;
    } else {
      vm.showTitle = true;
    }
  }
}


onMounted(() => {
  const instance = getCurrentInstance();

  const parentObjectField = sharedFunctions.getParentByName(instance, 'ObjectField');
  const parentDynamicControl = sharedFunctions.getParentByName(instance, 'DynamicControl');
  const parentGroupField = sharedFunctions.getParentByName(instance, 'FormGroup');
  const schemaForm = sharedFunctions.getParentByName(instance, 'SchemaForm');

  const refs = {
    self: selfRef,
    form: {
      formName: schemaForm?.props.formName,
      needCorrectExistingValues: true,
    },
    parentObjectField: parentObjectField?.refs.selfRef,
    parentGroupField: parentGroupField?.refs.selfRef,
    parentDynamicControl: parentDynamicControl?.refs.selfRef,
  };

  sharedFunctions.setRefs(refs);

  doOnMounted();
});


onDeactivated(() => {
  sharedFunctions.onDeactivated();
});

function onModelChange($event: any) {
  vm.model = $event;
}

function _createModel(): any {
  if (props.description.formType === 'multiselect') {
    return [];
  }

  if (props.description.formType === 'chips') {
    return [];
  }

  return undefined;
}

function createModel(): void {
  vm.model = _createModel();
}

function deleteModel(): void {
  vm.model = undefined;
}

function refreshShouldBeConstructedValues() {
  shouldFieldBeConstructed.value = sharedFunctions.shouldBeConstructed(props.description, undefined,
    shouldFieldBeConstructed.value);
}

function refreshDescription() {
  vm.descriptionText = sharedFunctions.getDescriptionText();
}

function processXFeatures() {
  const result = processXFeaturesBase();
  refreshShouldBeConstructedValues();
  refreshDescription();
  return result;
}

sharedFunctions.initField = initField;
sharedFunctions.createModel = createModel;
sharedFunctions.deleteModel = deleteModel;
sharedFunctions.processXFeatures = processXFeatures;

</script>

<style scoped>

</style>
