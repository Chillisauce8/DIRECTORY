<script setup lang="ts">

interface PackageSelectNeedPeopleProps {
  modelValue: number;
  possibleValues: number[];
}


interface PackageSelectNeedPeopleEmits {
  (e: 'update:modelValue', value: number): void;
}


interface PackageSelectNeedPeopleVM {
  modelValue: number;
  possibleValues: number[];
}


const props = defineProps<PackageSelectNeedPeopleProps>();
const emits = defineEmits<PackageSelectNeedPeopleEmits>();


const vm = reactive<PackageSelectNeedPeopleVM>({
  modelValue: props.modelValue,
  possibleValues: props.possibleValues,
});


function initVMFromProps(): void {
  vm.modelValue = props.modelValue;
  vm.possibleValues = props.possibleValues;
}


watch(() => props.modelValue, () => initVMFromProps());
watch(() => props.possibleValues, () => initVMFromProps());
</script>

<template>
  <LazyCSSelect v-model="vm.modelValue"
            :option-list="vm.possibleValues"
            :label-getter="v => `${v} People`"
            @update:modelValue="emits('update:modelValue', $event)">
  </LazyCSSelect>
</template>

<style lang="scss">

</style>