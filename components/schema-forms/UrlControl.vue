<template>
  <FloatLabel>
    <InputText type="url" v-model="vm.originalModel"
               @update:modelValue="onModelChange($event)"
               :name="props.description.name" :class="{'p-invalid': $v.$error}"
               :invalid="$v.$error"/>
    <label :for="props.description.name">{{vm.placeholderValue}}</label>
  </FloatLabel>
  <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
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
import { minLength } from '@vuelidate/validators/dist';
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
    [props.description.name]: {
      maxLength: maxLength(props.description.maxLength || 100),
      url
    },
  };

  if (props.description.required) {
    result[props.description.name]['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, { [props.description.name]: vm.model });


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
    correctExistingValueBase();
  }
}


sharedFunctions.correctExistingValue = correctExistingValue;


</script>

<style scoped>

</style>
