<script setup lang="ts">

interface PackageSelectNeedUnitsProps {
  modelValue: number;
  possibleValues: number[];
  unitType: string;
}


interface PackageSelectNeedUnitsEmits {
  (e: 'update:modelValue', value: number): void;
}


interface PackageSelectNeedUnitsVM {
  modelValue: number;
  possibleValues: number[];
  unitType: string;
}


const props = defineProps<PackageSelectNeedUnitsProps>();
const emits = defineEmits<PackageSelectNeedUnitsEmits>();


const vm = reactive<PackageSelectNeedUnitsVM>({
  modelValue: props.modelValue,
  possibleValues: props.possibleValues,
  unitType: props.unitType,
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
            :label-getter="v => `${v} ${vm.unitType}`"
            @update:modelValue="emits('update:modelValue', $event)">
  </LazyCSSelect>
</template>

<style lang="scss">

</style>