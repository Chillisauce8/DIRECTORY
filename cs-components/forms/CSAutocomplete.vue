<template>
  <Multiselect v-model="vm.modelValue"
               @update:modelValue="onSelect"
               :object="true"
               :filter-results="false"
               :min-chars="props?.minChars ?? 3"
               :resolve-on-load="true"
               :delay="props?.delay ?? 300"
               :searchable="true"
               :options="getOptionsList"
               :disabled="props?.disabled ?? false"
               :can-clear="false"
               :placeholder="placeholder"
               :clear-on-search="true"
               @open="onFocus(true)"
               @close="onFocus(false)"
               @focus="onFocus(true)">
  </Multiselect>
</template>

<script setup lang="ts">
// import Multiselect from '@vueform/multiselect/src/Multiselect.vue';
import {csFormControlComposable} from '~/utils/cs-form-field-contol';


interface AutocompleteItem<Value extends unknown = any> {
  value: Value;
  label: string;
}


interface AutocompleteVM<Value extends unknown = any> {
  modelValue: AutocompleteItem<Value>;
}


interface AutocompleteProps<Value extends unknown = any> {
  modelValue: Value;
  placeholder?: string;
  disabled?: boolean;
  delay?: number;
  minChars?: number;
  labelGetter?: (v: Value) => string;
  modelMatchOption?: (model: Value, optionValue: Value) => boolean;
  optionsList?: Value[];
  optionsListGetter?: (searchString: string) => Value[] | Promise<Value[]>;
}


interface AutocompleteEmits<Value extends unknown = any> {
  (e: 'update:modelValue', value: Value): void;
}


const props = defineProps<AutocompleteProps>();
const emits = defineEmits<AutocompleteEmits>();

const vm = reactive<AutocompleteVM>({
  modelValue: null,
});

const {stopWatch, onFocusChange, placeholderGetter} = csFormControlComposable(props as any);

const placeholder = computed(() => placeholderGetter());


let modelValueBackup = null;


function onFocus(isFocused: boolean) {
  if (isFocused && modelValueBackup === null) {
    modelValueBackup = vm.modelValue;
    vm.modelValue = null;
  } else if (!isFocused && modelValueBackup !== null) {
    vm.modelValue = modelValueBackup;
    modelValueBackup = null;
  }

  onFocusChange(isFocused);
}


async function getOptionsList(searchString: string) {
  let optionsList = [];

  if (props.optionsList) {
    optionsList = props.optionsList;
  } else if (searchString && props.optionsListGetter) {
    optionsList = await Promise.resolve(props.optionsListGetter(searchString));
  }

  if (!optionsList?.length && props.modelValue) {
    optionsList = [toRaw(props.modelValue)];
  }

  const preparedOptionsList = optionsList.map(value => ({value, label: props.labelGetter ? props.labelGetter(value) : value}));


  vm.modelValue = preparedOptionsList
    .find(({value}) => {
      if (!props.modelValue) {
        return false;
      }

      let result = null;

      try {
        result = props?.modelMatchOption(props.modelValue, value);
      } catch (e) {}

      if (typeof result === 'boolean') {
        return result;
      }

      return props.modelValue === value;
    });

  return preparedOptionsList;
}


function onSelect(item: AutocompleteItem): void {
  vm.modelValue = item;

  const value = item?.value ?? null;

  emits('update:modelValue', value);
}


watch(() => props.modelValue, v => {
  if (v === vm.modelValue?.value) {
    return;
  }

  vm.modelValue = v;
}, {deep: true});

onUnmounted(() => stopWatch());
</script>


<style lang="scss">

</style>
