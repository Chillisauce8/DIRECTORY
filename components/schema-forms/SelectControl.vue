<template>
  <div :class="{ 'undefined-select': vm.model == null }" class="row flex">
    <div class="flex column">
        <Dropdown v-if="vm.filteredSelectValues"
                  :name="props.description.name"
                  :showClear="!props.description.required"
                  v-model="vm.model"
                  @update:modelValue="onModelChange($event)"
                  :options="vm.filteredSelectValues"
                  :optionLabel="vm.filteredSelectValues?.[0].title ? 'title' : undefined"
                  :placeholder="vm.placeholderValue"
                  class="w-full md:w-14rem">

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


const {vm, im, sharedFunctions} = useBaseSelectableControl(props, emits);


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


onMounted(() => {
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

  sharedFunctions.setRefs(refs);

  sharedFunctions.doOnMounted();
});

function onModelChange(value: any) {
  vm.model = value;
  $v.value.$validate();
}


function getOptionLabel(data: any) {
  return data?.title ? 'title' : undefined;
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
