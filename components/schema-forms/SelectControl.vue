<template>
  <div :class="{ 'undefined-select': vm.model == null }" class="row flex">
    <div class="flex column">
        <Dropdown v-if="vm.filteredSelectValues"
                  :name="props.description.name"
                  :showClear="!props.description.required"
                  v-model="vm.model"
                  @update:modelValue="onModelChange($event)"
                  :options="vm.filteredSelectValues"
                  :optionLabel="(data) => data?.title || data"
                  :placeholder="vm.placeholderValue" class="w-full md:w-14rem">
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex align-items-center">
              <div>{{ getValueForItem(slotProps.value).title ? getValueForItem(slotProps.value).title : getValueForItem(slotProps.value) }}</div>
            </div>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>
          <template #option="slotProps">
            <div class="flex align-items-center">
              <div>{{ slotProps.option.name }}</div>
            </div>
          </template>
        </Dropdown>

        <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
    </div>

<!--    <div class="flex-10 column center-center" v-if="props.description.isRelator">-->
<!--      <schema-form-relator-context-menu [description]="description" [(model)]="model" [context]="context">-->
<!--      </schema-form-relator-context-menu>-->
<!--    </div>-->

  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, maxLength, email } from '@vuelidate/validators'
import FieldError from '~/components/schema-forms/FieldError.vue';
import { isObject } from '~/service/utils';
import useBaseSelectableControl from '~/composables/schema-forms/useBaseSelectableControl';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';


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


const correctExistingValueBase = sharedFunctions.correctExistingValue;
const initFieldBase = sharedFunctions.initField;


const validateRules = computed(() => {
  const result: any = {
  };

  if (props.description.required) {
    result[props.description.name]['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, { [props.description.name]: vm.model });


function onModelChange(value: any) {
  vm.model = value;
  $v.value.$validate();
}


function initField() {
  initFieldBase();

  if (vm.model && vm.model.id) {
    vm.model = im.cachedPossibleValues.find((item: any) => item.id === vm.model.id);
  }
}

function getValueForItem(item: any): any {
  if (!item) {
    return item;
  }

  if (item.value) {
    return item.value;
  }

  return item;
}

function getSelectTitle(): string {
  if (isObject(vm.model)) {
    return '';
  }

  return vm.model;
}


// function resetSelectField() {
//   if (props.description.default !== undefined) {
//     vm.model = props.description.default;
//   } else {
//     vm.model = undefined;
//   }
// }


sharedFunctions.initField = initField;

</script>

<style scoped>

</style>
