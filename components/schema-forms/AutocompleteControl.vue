<template>
  <AutoComplete v-model="vm.model"
                dropdown
                :suggestions="suggestions"
                @complete="onSearchStringChange" />

  <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
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
import { maxLength } from '@vuelidate/validators/dist';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const formRef = ref(null);
const selfRef = ref(null);
const parentObjectFieldRef = ref(null);
const parentGroupFieldRef = ref(null);
const parentDynamicControlRef = ref(null);


const refs = {
  self: selfRef,
  form: {
    formName: formRef.value?.name,
    needCorrectExistingValues: true,
  },
  parentObjectField: parentObjectFieldRef,
  parentGroupField: parentGroupFieldRef,
  parentDynamicControl: parentDynamicControlRef,
};


const baseFieldExport = useBaseSelectableControl(props, emits, refs);

let {
  vm,
  im,
  sharedFunctions,
} = baseFieldExport;


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
    result[props.description.name]['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, { [props.description.name]: vm.model });


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

function onSearchStringChange(str: string) {
  suggestions.value = sharedFunctions.querySearch(str);

  if (!str) {
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
