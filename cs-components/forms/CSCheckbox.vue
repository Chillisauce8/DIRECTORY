<script setup lang="ts">

interface CSCheckboxProps {
  modelValue: boolean;
}


interface CSCheckboxEmits {
  (e: 'update:modelValue', value: boolean): void;
}


interface CSCheckboxVM {
  modelValue: boolean;
}


const props = defineProps<CSCheckboxProps>();
const emits = defineEmits<CSCheckboxEmits>();


const vm = reactive<CSCheckboxVM>({
  modelValue: props?.modelValue,
});


function onChange(): void {
  emits('update:modelValue', vm.modelValue);
}
</script>

<template>
  <input type="checkbox"
         class="cs-checkbox"
         v-bind="$attrs"
         v-model="vm.modelValue"
         @change="onChange"
         @click.stop=""/>
</template>

<style lang="scss">
</style>