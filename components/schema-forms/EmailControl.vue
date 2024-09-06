<template>
  <SchemaComponent :componentName="componentName"
                   :componentProperties="componentProperties"
                   :validator="$v"
                   :model="vm.model" @onModelChange="onModelChange($event)">
  </SchemaComponent>
</template>


<script setup lang="ts">

import { isString } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, maxLength, email } from '@vuelidate/validators'
import FieldError from '~/components/schema-forms/FieldError.vue';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const {vm, sharedFunctions} = useBaseControl(props, emits);


const componentName = vm.componentName || 'InputText';

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
