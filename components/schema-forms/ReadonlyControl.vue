<template>
  <FloatLabel>
    <Checkbox v-if="props.description.formType === 'checkbox'" v-model="vm.model"
              :name="props.description.name" :readonly="true"/>
    <InputNumber v-else-if="props.description.formType === 'number'" v-model="vm.model"
                 :name="props.description.name" :readonly="true"/>
    <InputText v-else type="text" v-model="valueForReadonlyInput"
               :name="props.description.name" :readonly="true"/>
    <label :for="props.description.name">{{vm.placeholderValue}}</label>
  </FloatLabel>

</template>

<script setup lang="ts">
import { isObject } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const selfRef = ref(null);


const {vm, sharedFunctions} = useBaseControl(props, emits);


const valueForReadonlyInput = computed(() => {
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
})


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

  sharedFunctions.doOnMounted();
});

</script>

<style scoped>

</style>
