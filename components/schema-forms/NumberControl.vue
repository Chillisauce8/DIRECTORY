<template>
  <FloatLabel>
    <InputNumber v-model="vm.model" @update:modelValue="onModelChange($event)"
                 :min="props.description.minimum" :max="props.description.maximum"
                 :name="props.description.name"
                 :mode="vm.allowDecimals ? null : 'decimal'" showButtons
                 :step="props.description.xStep || 1"
                 :class="{'p-invalid': $v.$error}"/>
    <label :for="props.description.name">{{vm.placeholderValue}}</label>
  </FloatLabel>
  <FieldError class="form-text-error" :vuelidate-field="$v['model']"></FieldError>
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
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const selfRef = ref(null);


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
    model: {
      minValue: minValue(props.description.minimum),
      maxValue: maxValue(props.description.maximum),
      pattern: patternValidator(new RegExp(props.description.pattern, 'gi')),
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
  emits('modelChange', vm.model);
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
