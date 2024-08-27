<template>
  <SchemaControl :vm=vm :vuelidateField="$v.model">
    <InputText type="url"
               v-model="vm.model" @update:modelValue="onModelChange($event)"
               :name="props.description.name"
               :invalid="$v.$error"
               :class="[...sharedFunctions.getClasses(), $v.$error ? 'p-invalid' : '']"/>
  </SchemaControl>
</template>

<script setup lang="ts">
import { isString } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, maxLength, url } from '@vuelidate/validators'
import FieldError from '~/components/schema-forms/FieldError.vue';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const {vm, sharedFunctions} = useBaseControl(props, emits);

if (!vm.componentName) {
  vm.componentName = 'InputText';
}

const correctExistingValueBase = sharedFunctions.correctExistingValue;


const validateRules = computed(() => {
  const result: any = {
    model: {
      maxLength: maxLength(props.description.maxLength || 100),
      url
    },
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
  vm.model = value;
  $v.value.$validate();
  emits('modelChange', vm.model);
}

function correctExistingValue() {
  if (!isString(vm.model)) {
    vm.model = null;
  } else {
    correctExistingValueBase();
  }
}


sharedFunctions.correctExistingValue = correctExistingValue;


</script>

<style scoped>

</style>
