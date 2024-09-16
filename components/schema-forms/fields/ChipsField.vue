<template>
  <ComponentRender :componentName="vm.componentName"
                   :componentProperties="componentProperties"
                   :validator="$v"
                   :model="vm.model" @onModelChange="onModelChange($event)">
  </ComponentRender>
</template>

<script setup lang="ts">
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { required } from '@vuelidate/validators';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();


const componentProperties = {
  ...props.description,
};

const baseFieldExport = useBaseControl(props, emits);

let {
  vm,
  sharedFunctions,
} = baseFieldExport;


const getDefaultValueBase = sharedFunctions.getDefaultValue;
const fillEmptyModelBase = sharedFunctions.fillEmptyModel;
const correctExistingValueBase = sharedFunctions.correctExistingValue;


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


function getDefaultValue(): any {
  const defaultValue = getDefaultValueBase();
  if (defaultValue && !(defaultValue instanceof Array)) {
    return [defaultValue];
  }

  return defaultValue;
}

function fillEmptyModel() {
  fillEmptyModelBase();

  if (vm.model === undefined) {
    const defaultValue = getDefaultValue();

    if (defaultValue === undefined) {
      vm.model = [];
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

function onModelChange(value: any) {
  vm.model = value;

  $v.value.$validate();

  emits('modelChange', vm.model);
}


sharedFunctions.getDefaultValue = getDefaultValue;
sharedFunctions.fillEmptyModel = fillEmptyModel;
sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style scoped>

</style>
