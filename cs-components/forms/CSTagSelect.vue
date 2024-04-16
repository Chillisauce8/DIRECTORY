<script setup lang="ts">
// import Multiselect from '@vueform/multiselect/src/Multiselect.vue';
import {csFormControlComposable} from '~/utils/cs-form-field-contol';


interface TagSelectItem<Value extends unknown = any> {
  value: Value;
  label: string;
}


interface CSTagSelectProps<Value extends unknown = any> {
  modelValue: Value[];
  placeholder?: string;
  optionsList?: Value[];
  disabled?: boolean;
  modelMatchOption?: (model: Value, optionValue: Value) => boolean;
  labelGetter?: (v: Value) => string;
  label?: string;
}


interface CSTagSelectEmits<Value extends unknown = any> {
  (e: 'update:modelValue', value: Value[]): void;
}


interface CSTagSelectVM<Value extends unknown = any> {
  modelValue: TagSelectItem<Value>[];
  optionList: TagSelectItem<Value>[];
}


const props = defineProps<CSTagSelectProps>();
const emits = defineEmits<CSTagSelectEmits>();

const vm = reactive<CSTagSelectVM>({
  modelValue: null,
  optionsList: [],
});

const {stopWatch, onFocusChange, placeholderGetter, control} = csFormControlComposable(props as any);

const placeholder = computed(() => placeholderGetter());


function getItemLabel<Value extends unknown = any>(item: Value): string {
  if (typeof props.labelGetter === 'function') {
    return props?.labelGetter(item);
  }

  return item as string;
}

function initOptionList(): TagSelectItem[] {
  if (props.label) {
    return props.optionsList;
  }

  return toRaw((props?.optionsList ?? (props?.modelValue ? [props.modelValue] : [])))
    .map(value => ({value, label: getItemLabel(value)}));
}

function initModelList(optionList: TagSelectItem[]): TagSelectItem[] {
  return optionList
    .filter(i => {
      if (props?.modelValue === undefined) {
        return false;
      }

      if (typeof props?.modelMatchOption === 'function') {
        return props?.modelValue?.some(modelItem => props.modelMatchOption(modelItem, i));
      }

      return props?.modelValue?.some(modelItem => modelItem === i?.value);
    })
    .map(i => ({...i}));
}

function initVM(): void {
  vm.optionList = initOptionList();

  vm.modelValue = initModelList(vm.optionList);
}

function onSelect(model: TagSelectItem[]): void {
  control.setInputHasValue(!!model?.length);

  emits('update:modelValue', model.map(i => i.value));
}


watch(() => props.modelValue, () => initModelList(vm.optionList ?? []));
watch(() => props.optionsList, () => initVM());


onMounted(() => initVM());
onMounted(() => stopWatch());
</script>

<template>
  <Multiselect mode="tags"
               v-model="vm.modelValue"
               @update:modelValue="onSelect"
               :object="true"
               :disabled="props?.disabled ?? false"
               :can-clear="false"
               :options="vm.optionList"
               :label="props?.label ?? 'label'"
               :placeholder="placeholder"
               @open="onFocusChange(true)"
               @close="onFocusChange(false)">
  </Multiselect>
</template>

<style lang="scss">
</style>