<template>
  <FloatLabel>
    <InputText type="text" v-model="vm.originalModel"
               @update:modelValue="onModelChangeDebounced($event)"
               :name="props.description.name" :class="{'p-invalid': $v.$error}"
               :invalid="$v.$error"/>
    <label :for="props.description.name">{{props.placeholderValue}}</label>
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


vm = extend(vm, {
  originalModel: undefined,
});

const initFieldBase = sharedFunctions.initField;
const setModelBase = sharedFunctions.setModel;
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


function initField() {
  initFieldBase();
  vm.originalModel = vm.model;
}

function setModel(value: any, updated?: boolean) {
  setModelBase(value, updated);

  if (!vm.originalModel || (isString(vm.originalModel) && vm.originalModel.trim() !== vm.model)) {
    vm.originalModel = vm.model;
  }
}

function onModelChange(value: any) {
  vm.originalModel = value;

  if (value) {
    vm.model = value.trim();

    if (vm.model.length === 0) {
      vm.model = undefined;
    }
  } else {
    vm.model = undefined;
  }

  $v.value.$validate();
}


const onModelChangeDebounced = debounce(onModelChange, 1000);

function correctExistingValue() {
  if (!isString(vm.model)) {
    vm.model = undefined;
  } else {
    vm.model = vm.model.trim();

    if (vm.model.length === 0) {
      vm.model = undefined;
    } else {
      correctExistingValueBase();
    }
  }
}


sharedFunctions.initField = initField;
sharedFunctions.setModel = setModel;
sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style scoped>

</style>
