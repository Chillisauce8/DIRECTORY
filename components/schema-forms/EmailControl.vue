<template>
  <FloatLabel>
    <InputText type="email" v-model="vm.model"
               @update:modelValue="onModelChange($event)"
               :name="props.description.name" :class="{'p-invalid': $v.$error}"
               :invalid="$v.$error"/>
    <label :for="props.description.name">{{props.placeholderValue}}</label>
  </FloatLabel>
  <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
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


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const formRef = ref(null);
const selfRef = ref(null);
const parentObjectFieldRef = ref(null);
const parentGroupFieldRef = ref(null);
const parentDynamicControlRef = ref(null);


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


const baseFieldExport = useBaseControl(props, emits);

let {
  vm,
  sharedFunctions,
} = baseFieldExport;


const correctExistingValueBase = sharedFunctions.correctExistingValue;


const validateRules = computed(() => {
  const result: any = {
    maxLength: maxLength(props.description.maxLength || 100),
    email: email,
  };

  if (props.description.required) {
    result[props.description.name]['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, { [props.description.name]: vm.model });


function onModelChange(value: any) {
  vm.model = value;
  $v.value.$validate();
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
