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
