<template>
  <div class="flex align-items-center">
    <Checkbox v-model="vm.model" @update:modelValue="onModelChange($event)"
              :binary="true" :name="props.description.name"/>
    <label :for="props.description.name" class="ml-2"> {{ getPlaceholder() }} </label>
  </div>
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

const correctExistingValueBase = sharedFunctions.correctExistingValue;

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

function isValid(): boolean {
  return true;
}

function onModelChange(value: any) {
  vm.model = value;
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
