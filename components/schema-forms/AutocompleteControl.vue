<template>
  <div class="field-wrapper" :id="props.description.id">
    <label>{{ props.description.controlTitle }}</label>
    <div class="field">
      <div class="input-wrapper">
        <AutoComplete v-model="vm.model"
                      class="AutoComplete"
                      @update:modelValue="onModelChange($event)"
                      dropdown
                      :suggestions="suggestions"
                      :optionLabel="(suggestions?.[0]?.title || vm.model?.title) ? 'title' : undefined"
                      @complete="onSearchStringChange" />
      </div>
    </div>
  </div>
  <FieldError class="error-message"
              :vuelidate-field="$v.model">
  </FieldError>
</template>


<script setup lang="ts">
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required } from '@vuelidate/validators'
import useBaseSelectableControl from '~/composables/schema-forms/useBaseSelectableControl';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
// @ts-ignore
import { getCurrentInstance } from 'vue';
import FieldError from '~/components/schema-forms/FieldError.vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


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
    result['model'] = {
      required
    }
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
    suggestions.value = sharedFunctions.querySearch('', im.cachedPossibleValues);
  } else {
    onSearchStringChange({query: autocompleteInitValue});
  }
}


onMounted(() => {
  const instance = getCurrentInstance();
  sharedFunctions.doOnMounted(instance, $v);
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


sharedFunctions.initField = initField;
sharedFunctions.doOnMounted = doOnMounted;
sharedFunctions.getPlaceholder = getPlaceholder;

</script>

<style scoped>

</style>
