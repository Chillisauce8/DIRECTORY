<template>
  <SchemaControl :vm=vm>
    <component :is="vm.componentName"
               v-model="vm.model" @update:modelValue="onModelChange($event)"
               :binary="true"
               v-bind="props.description"
              :class="[...sharedFunctions.getClasses()]">
    </component>
  </SchemaControl>
</template>

<script setup lang="ts">

// @ts-ignore
import { extend } from 'vue-extend-reactive';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance } from 'vue';

// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

const baseFieldExport = useBaseControl(props, emits);

let {
  vm,
  sharedFunctions,
} = baseFieldExport;


vm = extend(vm, {
  originalModel: undefined,
});

if (!vm.componentName) {
  vm.componentName = 'Checkbox';
}

const correctExistingValueBase = sharedFunctions.correctExistingValue;

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

  sharedFunctions.doOnMounted();
});

function isValid(): boolean {
  return true;
}

function onModelChange(value: any) {
  vm.model = value;
  emits('modelChange', vm.model);
}

function correctExistingValue() {
  if (!vm.model === true && !vm.model === false) {
    vm.model = null;
  } else {
    correctExistingValueBase();
  }
}

sharedFunctions.isValid = isValid;
sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style scoped>

</style>
