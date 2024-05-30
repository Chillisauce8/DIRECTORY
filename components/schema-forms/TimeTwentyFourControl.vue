<template>
  <FloatLabel>
    <Calendar id="calendar-timeonly" v-model="vm.model"
              @update:modelValue="onModelChange($event)"
              timeOnly hourFormat="24"/>
    <label :for="props.description.name">{{vm.placeholderValue}}</label>
  </FloatLabel>
  <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
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


const dateHelper = new DateHelper();

const baseFieldExport = useBaseControl(props, emits);

let {
  vm,
  sharedFunctions,
} = baseFieldExport;


vm = extend(vm, {
  originalModel: undefined,
});


const correctExistingValueBase = sharedFunctions.correctExistingValue;



const validateRules = computed(() => {
  const result: any = {
    [props.description.name]: {
      minLength: minLength(props.description.minLength || 0),
      maxLength: maxLength(props.description.maxLength || 100),
      pattern: patternValidator(new RegExp(props.description.pattern, 'gi')),
    },
  };

  if (props.description.required) {
    result[props.description.name]['required'] = required;
  }

  return result;
});



const $v = useVuelidate(validateRules, { [props.description.name]: vm.originalModel });



function onModelChange(value: any) {
  vm.originalModel = value;

  $v.value.$validate();
}


onMounted(() => {
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

  sharedFunctions.setRefs(refs);

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

<style scoped>

</style>
