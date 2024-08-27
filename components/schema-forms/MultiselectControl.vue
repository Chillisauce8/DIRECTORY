<template>
  <SchemaControl :vm=vm :vuelidateField="$v.model">
    <component :is="vm.componentName"
             v-if="vm.filteredSelectValues"
             v-model="_fakeModel" @update:modelValue="onModelChange($event)"
             :options="autocompleteItems"
             :optionLabel="props.description.optionLabel || autocompleteItems?.[0]?.title ? 'title' : autocompleteItems?.[0]?.name ? 'name' : undefined"
             :placeholder="vm.placeholderValue"
             :showClear="!props.description.required"
             :maxSelectedLabels="getLimitTo()"
             v-bind="props.description"
             :class="[...sharedFunctions.getClasses(), $v.$error ? 'p-invalid' : '']">
    </component>
  </SchemaControl>
</template>

<script setup lang="ts">
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required } from '@vuelidate/validators'
import FieldError from '~/components/schema-forms/FieldError.vue';
import { isObject, isEqual } from '~/service/utils';
import useBaseSelectableControl from '~/composables/schema-forms/useBaseSelectableControl';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const baseFieldExport = useBaseSelectableControl(props, emits);

let {
  vm,
  sharedFunctions,
} = baseFieldExport;

if (!vm.componentName) {
  vm.componentName = 'MultiSelect';
}


const correctExistingValueBase = sharedFunctions.correctExistingValue;
const initFieldBase = sharedFunctions.initField;
const processXFeaturesBase = sharedFunctions.processXFeatures;
const getDefaultValueBase = sharedFunctions.getDefaultValue;


const validateRules = computed(() => {
  const result: any = {
  };

  if (props.description.required) {
    result['model']['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, vm, {$autoDirty: true});

const autocompleteItems = ref();

const _fakeModel = ref();

let _isObjects = false;

let _prevXFeatures: any;


onMounted(() => {
  const instance = getCurrentInstance();

  const parentObjectField = sharedFunctions.getParentByName(instance, 'ObjectField');
  const parentDynamicControl = sharedFunctions.getParentByName(instance, 'DynamicControl');
  const parentGroupField = sharedFunctions.getParentByName(instance, 'FormGroup');
  const schemaForm = sharedFunctions.getParentByName(instance, 'SchemaForm');

  const refs = {
    self: instance,
    form: {
      formName: schemaForm?.props.formName,
      needCorrectExistingValues: true,
    },
    parentObjectField: parentObjectField,
    parentGroupField: parentGroupField,
    parentDynamicControl: parentDynamicControl,
  };

  sharedFunctions.setRefs(refs);
  sharedFunctions.setValidation($v);

  sharedFunctions.doOnMounted();
});

function onModelChange(value: any) {
  _fakeModel.value = value;

  if (value) {
    if (_isObjects) {
      vm.model = value.map((valueItem: any) => {
        return autocompleteItems.value.find((optionsItem: any) => {
          if ('id' in valueItem) {
            return valueItem.id === optionsItem.id;
          } else if ('code' in valueItem) {
            return valueItem.code === optionsItem.code;
          } else if ('value' in valueItem) {
            return valueItem.value === optionsItem.value;
          }
        });
      });
    } else {
      vm.model = value;
    }
  } else {
    vm.model = undefined;
  }

  $v.value.$validate();

  emits('modelChange', vm.model);
}

function initField() {
  initFieldBase();
  _initInnerData();
}

function getLimitTo() {
  if (props.description.maxSelectedLabels) {
    return props.description.maxSelectedLabels;
  }

  if (props.description.xLimitTo === 'null') {
    return null;
  } else if (props.description.xLimitTo) {
    return props.description.xLimitTo;
  }

  return 30;
}

function processXFeatures() {
  const features = processXFeaturesBase();
  if (!isEqual(_prevXFeatures, features) ||
    !isEqual(vm.cachedPossibleValues, autocompleteItems.value)) {
    _prevXFeatures = features;
    _initInnerData();
  }

  return features;
}

function getDefaultValue(): any {
  const defaultValue = getDefaultValueBase();
  if (defaultValue && !(defaultValue instanceof Array)) {
    return [defaultValue];
  }

  return defaultValue;
}

function fillEmptyModel() {
  if (vm.model === undefined) {
    const defaultValue = getDefaultValue();

    if (defaultValue === undefined) {
      vm.model = [];
    } else {
      vm.model = defaultValue;
      _initInnerModel();
    }
  }
}

function correctExistingValue() {
  if (!Array.isArray(vm.model)) {
    vm.model = [];
  } else {
    correctExistingValueBase();
  }
}

function _initInnerData() {
  autocompleteItems.value = sharedFunctions.filterPossibleValues();
  _isObjects = autocompleteItems.value && autocompleteItems.value.length && isObject(autocompleteItems.value[0]);

  if (_fakeModel) {
    return;
  }

  _initInnerModel();
}

function _initInnerModel() {
  if (vm.model) {
    if (_isObjects) {
      _fakeModel.value = vm.model.map((item: any) => {
        return autocompleteItems.value.find((item: any) => item.id === item.id);
      });
    } else {
      _fakeModel.value = vm.model;
    }
  } else {
    _fakeModel.value = [];
  }
}


sharedFunctions.initField = initField;
sharedFunctions.processXFeatures = processXFeatures;
sharedFunctions.getDefaultValue = getDefaultValue;
sharedFunctions.fillEmptyModel = fillEmptyModel;
sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style scoped>

</style>
