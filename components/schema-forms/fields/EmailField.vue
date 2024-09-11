<template>
  <DynamicComponent :componentName="vm.componentName"
                   :componentProperties="componentProperties"
                   :validator="$v"
                   :model="vm.model" @onModelChange="onModelChange($event)">
  </DynamicComponent>
</template>


<script setup lang="ts">

import { isString } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, maxLength, email } from '@vuelidate/validators'
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();


const {vm, sharedFunctions} = useBaseControl(props, emits);

vm.componentName = vm.componentName || 'InputText';

const componentProperties = {
  ...props.description,
  type: "email"
};

const correctExistingValueBase = sharedFunctions.correctExistingValue;


const validateRules = computed(() => {
  const result: any = {
    model: {
      maxLength: maxLength(props.description.maxLength || 100),
      email: email,
    }
  };

  if (props.description.required) {
    result['model']['required'] = required;
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

function correctExistingValue() {
  if (!isString(vm.model)) {
    vm.model = null;
  } else {
    vm.model = vm.model ? vm.model.toLowerCase() : '';
    correctExistingValueBase();
  }
}

function correctModelBeforeSet(value: any) {
  return value ? value.toLowerCase() : '';
}


sharedFunctions.correctExistingValue = correctExistingValue;
sharedFunctions.correctModelBeforeSet = correctModelBeforeSet;

</script>

<style scoped>

</style>
