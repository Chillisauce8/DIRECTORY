<template>
  <SchemaControl :vm=vm :vuelidateField="$v.model">
    <Calendar v-model="vm.model" @update:modelValue="onModelChange($event)"
              timeOnly hourFormat="24"
              :class="[...sharedFunctions.getClasses(), $v.$error ? 'p-invalid' : '']"/>
  </SchemaControl>
</template>

<script setup lang="ts">
import { isString } from '~/service/utils';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, minLength, maxLength } from '@vuelidate/validators'
import { patternValidator } from '~/service/forms-validators';
import FieldError from '~/components/schema-forms/FieldError.vue';
import { debounce } from '~/service/utils';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import { DateHelper } from '~/service/date-helper';
import { getCurrentInstance } from 'vue';



const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const dateHelper = new DateHelper();

const baseFieldExport = useBaseControl(props, emits);

let {
  vm,
  sharedFunctions,
} = baseFieldExport;


vm = extend(vm, {
  originalModel: undefined,
});


if (!vm.componentName) {
  vm.componentName = 'Calendar';
}


const validateRules = computed(() => {
  const result: any = {
    model: {
      minLength: minLength(props.description.minLength || 0),
      maxLength: maxLength(props.description.maxLength || 100),
      pattern: patternValidator(new RegExp(props.description.pattern, 'gi')),
    },
  };

  if (props.description.required) {
    result['model']['required'] = required;
  }

  return result;
});



const $v = useVuelidate(validateRules, vm, {$autoDirty: true});



function onModelChange(value: any) {
  vm.model = value;

  $v.value.$validate();
  emits('modelChange', vm.model);
}


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

function correctExistingValue() {
  if (!isString(vm.model)) {
    vm.model = null;
  } else {
    const timeValue = dateHelper.parseTime(vm.model);
    if (timeValue) {
      vm.model = dateHelper.inputTimeFormat(timeValue);
    }
  }
}


sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style>

</style>
