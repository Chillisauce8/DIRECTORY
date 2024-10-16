<template>
  <ComponentRender :componentName="vm.componentName"
                   :componentProperties="componentProperties"
                   :model="vm.model" @onModelChange="onModelChange($event)">
  </ComponentRender>
</template>

<script setup lang="ts">

// @ts-ignore
import { extend } from 'vue-extend-reactive';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import { getCurrentInstance } from 'vue';

// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();

const baseFieldExport = useBaseControl(props, emits);

let {
  vm,
  sharedFunctions,
} = baseFieldExport;


vm = extend(vm, {
  originalModel: undefined,
});


vm.componentName = vm.componentName || 'ToggleSwitch';

const componentProperties = {
  binary: true,
  ...props.description,
};

const correctExistingValueBase = sharedFunctions.correctExistingValue;

onMounted(() => {
  const instance = getCurrentInstance();
  sharedFunctions.doOnMounted(instance);
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
