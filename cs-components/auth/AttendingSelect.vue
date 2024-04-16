<script setup lang="ts">
import type {YesNoValue} from '~/utils/common.types';


interface AttendingSelectProps {
  modelValue: YesNoValue;
  placeholder: string;
  defaultValue?: YesNoValue;
  disabled?: boolean;
}


interface AttendingSelectEmits {
  (e: 'update:modelValue', value: YesNoValue): void;
}


interface AttendingSelectVM {
  possibleValues: YesNoValue[];
}


const props = defineProps<AttendingSelectProps>();
const emits = defineEmits<AttendingSelectEmits>();

const vm = reactive<AttendingSelectVM>({
  possibleValues: ['Yes', 'No'],
});


function setDefaultValue(): void {
  if (!props?.defaultValue) {
    return;
  }

  emits('update:modelValue', props.defaultValue);
}

onMounted(() => {
  setDefaultValue();
});
</script>

<template>
  <CSFormField>
    <LazyCSSelect :model-value="props.modelValue"
              :option-list="vm.possibleValues"
              :placeholder="props.placeholder"
              :disabled="props?.disabled"
              @update:model-value="emits('update:modelValue', $event)">
    </LazyCSSelect>
  </CSFormField>
</template>

<style lang="scss">
</style>