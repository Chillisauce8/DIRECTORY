<template>
  <div>
    <FloatLabel>
      <Chips id="chips" v-model="vm.model" @update:modelValue="onModelChange($event)"/>
      <label for="chips"></label>
    </FloatLabel>
    <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
  </div>
</template>

<script setup lang="ts">
import FieldError from "~/components/schema-forms/FieldError.vue";
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { required } from '@vuelidate/validators/dist/index';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core/dist/index';
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


const getDefaultValueBase = sharedFunctions.getDefaultValue;
const fillEmptyModelBase = sharedFunctions.fillEmptyModel;
const correctExistingValueBase = sharedFunctions.correctExistingValue;


const validateRules = computed(() => {
  const result: any = {
  };

  if (props.description.required) {
    result[props.description.name]['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, { [props.description.name]: vm.model });


function getDefaultValue(): any {
  const defaultValue = getDefaultValueBase();
  if (defaultValue && !(defaultValue instanceof Array)) {
    return [defaultValue];
  }

  return defaultValue;
}

function fillEmptyModel() {
  fillEmptyModelBase();

  if (vm.model === undefined) {
    const defaultValue = getDefaultValue();

    if (defaultValue === undefined) {
      vm.model = [];
    }
  }
}

function correctExistingValue() {
  if (!Array.isArray(vm.model)) {
    vm.model = [];
  } else {
    correctExistingValueBase();
  }
}

function onModelChange(value: any) {
  vm.model = value;

  $v.value.$validate();
}


sharedFunctions.getDefaultValue = getDefaultValue;
sharedFunctions.fillEmptyModel = fillEmptyModel;
sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style scoped>

</style>
