<template>
  <FloatLabel>
    <InputNumber v-model="vm.model" @update:modelValue="onModelChange($event)"
                 :min="props.description.minimum" :max="props.description.maximum"
                 :name="props.description.name"
                 :mode="vm.allowDecimals ? null : 'decimal'" showButtons
                 :step="props.description.xStep || 1"
                 :class="{'p-invalid': $v.$error}"/>
    <label :for="props.description.name">{{props.placeholderValue}}</label>
  </FloatLabel>
  <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
</template>

<script setup lang="ts">
import { isNumber } from '~/service/utils';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, minValue, maxValue} from '@vuelidate/validators'
import { patternValidator } from '~/service/forms-validators';
import FieldError from '~/components/schema-forms/FieldError.vue';
import { isUndefined } from '~/service/utils';
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


vm = extend(vm, {
  allowDecimals: undefined,
});

const initFieldBase = sharedFunctions.initField;
const getDefaultValueBase = sharedFunctions.getDefaultValue;
const correctExistingValueBase = sharedFunctions.correctExistingValue;
const fillDescriptionPatternBase = sharedFunctions.fillDescriptionPattern;


const validateRules = computed(() => {
  const result: any = {
    minValue: minValue(props.description.minimum),
    maxValue: maxValue(props.description.maximum),
    pattern: patternValidator(new RegExp(props.description.pattern, 'gi')),
  };

  if (props.description.required) {
    result[props.description.name]['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, { [props.description.name]: vm.originalModel });


function initField() {
  initFieldBase();

  vm.allowDecimals = props.description.pattern?.indexOf('\.') !== -1;

  if (isFinite(vm.model)) {
    sharedFunctions.touch();
  }
}

function getDefaultValue(): any {
  let defaultValue = getDefaultValueBase();
  if (!isUndefined(defaultValue)) {
    return parseInt(defaultValue, 10);
  }
}

function onModelChange(value: any) {
  vm.model = value;
  $v.value.$validate();
}


function correctExistingValue() {
  if (!isNumber(vm.model)) {
    vm.model = null;
  } else {
    correctExistingValueBase();
  }
}


function fillDescriptionPattern() {
  fillDescriptionPatternBase();
  _fillDescriptionPatternForNumber();
}

function _fillDescriptionPatternForNumber() {
  if (props.description.xStep) {
    let splitStep = props.description.xStep.toString().split('.');
    if (splitStep.length === 2) {
      let decimalsCount = splitStep[1].length;
      if (decimalsCount > 0) {
        props.description.pattern = '^-?[0-9]*(\.[0-9]{1,' + decimalsCount + '})?$';
        return;
      }
    }
  }

  props.description.pattern = '^-?[0-9]*(\.[0-9]+)?$';
}


sharedFunctions.initField = initField;
sharedFunctions.getDefaultValue = getDefaultValue;
sharedFunctions.correctExistingValue = correctExistingValue;
sharedFunctions.fillDescriptionPattern = fillDescriptionPattern;

</script>

<style scoped>

</style>
