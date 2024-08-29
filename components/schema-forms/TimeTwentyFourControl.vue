<template>
  <SchemaComponent :componentName="componentName"
                   :componentProperties="componentProperties"
                   :vuelidator="$v"
                   :model="vm.model" @onModelChange="onModelChange($event)">
  </SchemaComponent>
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


const componentName = vm.componentName || 'Calendar';

const componentProperties = {
  ...props.description,
  timeOnly: true,
  hourFormat: "24"
};


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
  sharedFunctions.doOnMounted(instance, $v);
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
