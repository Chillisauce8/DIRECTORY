<template>
  <SchemaComponent :componentName="componentName"
                   :componentProperties="componentProperties"
                   :model="valueForReadonlyInput">
  </SchemaComponent>
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


const {vm, sharedFunctions} = useBaseControl(props, emits);

let componentName = vm.componentName;

if (!vm.componentName) {
  if (props.description.formType === 'checkbox') {
    componentName = "Checkbox";
  } else {
    componentName = 'InputText';
  }
}

const componentProperties = {
  ...props.description,
  readonly: true
};



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
  sharedFunctions.doOnMounted(instance);
});

</script>

<style scoped>

</style>
