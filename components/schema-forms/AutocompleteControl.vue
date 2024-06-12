<template>
  <AutoComplete v-model="vm.model"
                @update:modelValue="onModelChange($event)"
                dropdown
                :suggestions="suggestions"
                :optionLabel="suggestions?.[0]?.title ? 'title' : undefined"
                @complete="onSearchStringChange" />

  <FieldError class="form-text-error" :vuelidate-field="$v['model']"></FieldError>
</template>


<script setup lang="ts">
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required } from '@vuelidate/validators'
import FieldError from '~/components/schema-forms/FieldError.vue';
import useBaseSelectableControl from '~/composables/schema-forms/useBaseSelectableControl';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
// @ts-ignore
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const selfRef = ref(null);


const {vm, im, sharedFunctions} = useBaseSelectableControl(props, emits);


let autocompleteInitValue: any;
const suggestions = ref([]);
let minLength = 0;


const initFieldBase = sharedFunctions.initField;
const doOnMountedBase = sharedFunctions.doOnMounted;
const getPlaceholderBase = sharedFunctions.getPlaceholder;


const validateRules = computed(() => {
  const result: any = {
  };

  if (props.description.required) {
    result['model']['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, vm, {$autoDirty: true});


function doOnMounted() {
  doOnMountedBase();

  autocompleteInitValue = autocompleteItemTextGetter(vm.model);

  if (im.cachedPossibleValues && im.cachedPossibleValues.length > 100) {
    if (props.description.xLimitTo === 'null') {
      minLength = 0;
    } else {
      minLength = 2;
    }
  }

  if (!autocompleteInitValue) {
    suggestions.value = suggestions.value = sharedFunctions.querySearch('', im.cachedPossibleValues);
  } else {
    onSearchStringChange(autocompleteInitValue);
  }
}


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
  sharedFunctions.setValidation($v);

  sharedFunctions.doOnMounted();
});

// function ngOnChanges(changes: SimpleChanges) {
//   if (this.formControl && changes.model) {
//     const currentValue = getOptionForValueIfNeed(changes.model.currentValue);
//     const searchValue = autocompleteItemTextGetter(currentValue);
//
//     // if (!searchValue) {
//     //   this.dataObservable = observableOf(this.querySearch(''));
//     // }
//   } else {
//     // const str = this.autocompleteItemTextGetter(this.formControl?.value || this.model);
//     // this.dataObservable = observableOf(this.querySearch(str || ''));
//   }
// }

function initField() {
  initFieldBase();
}


function onModelChange(value: any) {
  // vm.model = value;

  $v.value.$validate();

  emits('modelChange', vm.model);
}

function getPlaceholder(): string {
  let result = getPlaceholderBase();

  if (minLength) {
    if (result && result !== ' ') {
      result += ', ';
    }

    result += `please enter ${minLength} chars to search`;
  }

  return result;
}

function autocompleteItemTextGetter(item: any): string {
  return item && (item.title || item.name) ? (item.title || item.name) :
    (typeof item === 'string' ? item : '');
}

function onSearchStringChange(request: any) {
  suggestions.value = sharedFunctions.querySearch(request.query);

  if (!request.query) {
    vm.model = undefined;
  }
}

function isValid(): boolean {
  return !$v.$error;
}

function touch() {
  //
}


sharedFunctions.initField = initField;
sharedFunctions.doOnMounted = doOnMounted;
sharedFunctions.getPlaceholder = getPlaceholder;

</script>

<style scoped>

</style>
