<template>
  <FloatLabel>
    <InputText type="email" v-model="vm.model"
               @update:modelValue="onModelChange($event)"
               :name="props.description.name" :class="{'p-invalid': $v.$error}"
               :invalid="$v.$error"/>
    <label :for="props.description.name">{{vm.placeholderValue}}</label>
  </FloatLabel>
  <FieldError class="form-text-error" :vuelidate-field="$v['model']"></FieldError>
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


const selfRef = ref(null);


const {vm, sharedFunctions} = useBaseControl(props, emits);


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

  sharedFunctions.doOnMounted();
});

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
