<template>
  <SchemaControl :vm=vm :vuelidateField="$v.model">
    <component :is="vm.componentName"
               v-if="vm.filteredSelectValues"
               :showClear="!props.description.required"
               v-model="vm.model" @update:modelValue="onModelChange($event)"
               :options="vm.filteredSelectValues"
               :optionLabel="props.description.optionLabel || (vm.filteredSelectValues?.[0]?.title ? 'title' : undefined)"
               :placeholder="vm.placeholderValue"
               v-bind="props.description"
               :class="[...sharedFunctions.getClasses(), $v.$error ? 'p-invalid' : '']">
    </component>
  </SchemaControl>

<!--    <div class="flex-10 column center-center" v-if="props.description.isRelator">-->
<!--      <schema-form-relator-context-menu [description]="description" [(model)]="model" [context]="context">-->
<!--      </schema-form-relator-context-menu>-->
<!--    </div>-->
</template>

<script setup lang="ts">
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, maxLength, email } from '@vuelidate/validators'
import FieldError from '~/components/schema-forms/FieldError.vue';
import { isObject } from '~/service/utils';
import useBaseSelectableControl from '~/composables/schema-forms/useBaseSelectableControl';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const {vm, im, sharedFunctions} = useBaseSelectableControl(props, emits);

if (!vm.componentName) {
  vm.componentName = 'Dropdown';
}

const initFieldBase = sharedFunctions.initField;


const validateRules = computed(() => {
  const result: any = {
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


function initField() {
  initFieldBase();

  if (vm.model && vm.model.id) {
    vm.model = im.cachedPossibleValues.find((item: any) => item.id === vm.model.id);
  }
}


function getSelectTitle(): string {
  if (isObject(vm.model)) {
    return '';
  }

  return vm.model;
}


// function resetSelectField() {
//   if (props.description.default !== undefined) {
//     vm.model = props.description.default;
//   } else {
//     vm.model = undefined;
//   }
// }


sharedFunctions.initField = initField;

</script>

<style>
</style>
