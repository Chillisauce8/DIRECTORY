<template>
  <ComponentRender :componentName="'Select'"
                   :componentProperties="componentProperties"
                   :validator="$v"
                   :model="vm.model" @onModelChange="onModelChange($event)"
                   v-if="componentProperties">
  </ComponentRender>
</template>

<script setup lang="ts">
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required } from '@vuelidate/validators'
import { isObject } from '~/service/utils';
import useBaseSelectableControl from '~/composables/schema-forms/useBaseSelectableControl';
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();


const {vm, im, sharedFunctions} = useBaseSelectableControl(props, emits);

let componentProperties = ref();

const initFieldBase = sharedFunctions.initField;


const validateRules = computed(() => {
  const result: any = {
  };

  if (props.description.required) {
    result['model'] = {
      required
    }
  }

  return result;
});


const $v = useVuelidate(validateRules, vm, {$autoDirty: true});


onMounted(() => {
  const instance = getCurrentInstance();
  sharedFunctions.doOnMounted(instance, $v);
});


function onModelChange(value: any) {
  vm.model = value;
  $v.value.$validate();
  emits('modelChange', vm.model);
}


function initField() {
  initFieldBase();

  if (vm.model && vm.model.id) {
    vm.model = im.cachedPossibleValues.find((item: any) => item.id === vm.model.id);
  }

  componentProperties.value = {
    ...props.description,
    component: undefined,
    showClear: !props.description.required,
    options: vm.filteredSelectValues,
    optionLabel: props.description.optionLabel || (vm.filteredSelectValues?.[0]?.title ? 'title' : undefined),
    placeholder: vm.placeholderValue,
  };
}


function getSelectTitle(): string {
  if (isObject(vm.model)) {
    return '';
  }

  return vm.model;
}


// function resetSelectField() {
//   if (props.description.default !== undefined) {
//     vm.model = props.description.default;
//   } else {
//     vm.model = undefined;
//   }
// }


sharedFunctions.initField = initField;

</script>

<style>
</style>
