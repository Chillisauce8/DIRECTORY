<template>
  <div class="flex align-items-center">
    <Checkbox v-if="props.description.formType === 'checkbox'" v-model="vm.model" :binary="true"
              :name="props.description.name" :readonly="true"/>
    <InputNumber v-else-if="props.description.formType === 'number'" v-model="vm.model"
                 :name="props.description.name" :readonly="true"/>
    <InputText v-else type="text" v-model="getValueForReadonlyInput()"
               :name="props.description.name" :readonly="true"/>
    <label :for="props.description.name" class="ml-2"> {{ getPlaceholder() }} </label>
  </div>

</template>

<script setup lang="ts">
import { isObject } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';


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


const baseFieldExport = useBaseControl(props, emits);

let {
  vm,
  sharedFunctions,
} = baseFieldExport;


function getValueForReadonlyInput() {
  if (Array.isArray(vm.model)) {
    return vm.model.map((item: any) => {
      if (isObject(item)) {
        return item.title;
      }

      return item;
    }).join(', ');
  }

  if (isObject(vm.model)) {
    return vm.model.title;
  }

  return vm.model || '';
}

</script>

<style scoped>

</style>
