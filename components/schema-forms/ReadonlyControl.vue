<template>
  <div class="flex align-items-center">
    <Checkbox v-if="props.description.formType === 'checkbox'" v-model="vm.model"
              :name="props.description.name" :readonly="true"/>
    <InputNumber v-else-if="props.description.formType === 'number'" v-model="vm.model"
                 :name="props.description.name" :readonly="true"/>
    <InputText v-else type="text" v-model="valueForReadonlyInput"
               :name="props.description.name" :readonly="true"/>
    <label :for="props.description.name" class="ml-2"> {{ sharedFunctions.getPlaceholder() }} </label>
  </div>

</template>

<script setup lang="ts">
import { isObject } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const formRef = ref(null);
const selfRef = ref(null);
const parentObjectFieldRef = ref(null);
const parentGroupFieldRef = ref(null);
const parentDynamicControlRef = ref(null);


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

</script>

<style scoped>

</style>
