<template>
  <Multiselect v-model="vm.modelValue"
               :mode="props?.mode ?? 'single'"
               :options="vm.optionList"
               :object="true"
               :can-clear="false"
               :can-deselect="true"
               :disabled="props?.disabled ?? false"
               :loading="props?.loading ?? false"
               :label="props?.label ?? 'label'"
               :placeholder="placeholder"
               @update:modelValue="onValueUpdate"
               @open="onFocusChange(true)"
               @close="onFocusChange(false)"
               @deselect="preventDeselectAndClose"
               no-options-text="The list is empty">
  </Multiselect>
</template>

<script setup lang="ts">
// import Multiselect from '@vueform/multiselect/src/Multiselect.vue';
import {csFormControlComposable} from '~/utils/cs-form-field-contol';


interface SelectItem<Value extends unknown = any> {
  value: Value;
  label: string;
}


interface SelectProps<Value extends unknown = any> {
  modelValue: Value;
  optionList?: Value[];
  labelGetter?: (v: Value) => string;
  label?: string;
  mode?: string;
  modelMatchOption?: (model: Value, optionValue: Value) => boolean;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
}


interface SelectEmits<Value extends unknown = any> {
  (e: 'update:modelValue', value: Value): void;
}


interface SelectVM<Value extends unknown = any> {
  modelValue: SelectItem;
  optionList: SelectItem[];
}


const props = defineProps<SelectProps>();
const emits = defineEmits<SelectEmits>();


const vm = reactive<SelectVM>({
  modelValue: null,
  optionList: null,
});

const {stopWatch, onFocusChange, placeholderGetter} = csFormControlComposable(props as any);

const placeholder = computed(() => placeholderGetter());


function getItemLabel(item: SelectItem): string {
  if (props.labelGetter) {
    return props.labelGetter(item);
  }

  return item as string;
}


function updateModelValue(): void {
  nextTick(() => vm.modelValue = props?.label ? props?.modelValue : findModelValueInOptionsList());
}

function findModelValueInOptionsList(): any {
  return vm.optionList
    .find(({value}) => {
      if (toRaw(props.modelValue) === undefined) {
        return false;
      }

      let result;

      try {
        result = props?.modelMatchOption(props.modelValue, value);
      } catch (e) {}

      if (typeof result === 'boolean') {
        return result;
      }

      return props.modelValue === value;
    });
}


function initVMFromProps(): void {
  if (props.label) {
    vm.optionList = props.optionList;
  } else {
    const optionList = props.optionList?.length ? toRaw(props.optionList) :
      props?.modelValue !== undefined ? [toRaw(props.modelValue)] : [];
    vm.optionList = optionList.map(value => ({ value, label: getItemLabel(value) }));
  }

  updateModelValue();
}


function onValueUpdate(item: SelectItem) {
  if (!item) {
    return;
  }

  if (item.value === props?.modelValue) {
    return;
  }

  if (props.label) {
    emits('update:modelValue', item);
  } else {
    emits('update:modelValue', item.value);
  }
}

function preventDeselectAndClose(value, option, select$) {
  select$.select(option);
  select$.close();
}


watch(() => props.modelValue, () => updateModelValue());
watch(() => props.optionList, () => initVMFromProps());


onMounted(() => initVMFromProps());
onUnmounted(() => stopWatch());
</script>

<style lang="scss">
</style>
