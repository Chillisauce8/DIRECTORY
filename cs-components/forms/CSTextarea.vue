<script setup lang="ts">
import {csFormControlComposable} from '~/utils/cs-form-field-contol';


interface CSTextareaProps {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  name?: string;
  maxLength?: number;
}


interface CSTextareaEmits {
  (e: 'update:modelValue', value: string): void;
}


interface CSTextareaVM {
  modelValue: string;
}


const props = defineProps<CSTextareaProps>();
const emits = defineEmits<CSTextareaEmits>();


const vm = reactive<CSTextareaVM>({
  modelValue: props?.modelValue,
});

const {stopWatch, onFocusChange, placeholderGetter} = csFormControlComposable(props as any);

const placeholder = computed(() => placeholderGetter());


function onModelUpdate(event: InputEvent): void {
  emits('update:modelValue', (event.target as any).value);
}


watch(() => props?.modelValue, v => vm.modelValue = v);

onUnmounted(() => stopWatch());
</script>

<template>
  <textarea v-model="vm.modelValue"
            class="cs-textarea"
            :class="{'cs-textarea-disabled': props?.disabled}"
            :name="props?.name ?? null"
            :rows="props?.rows ?? 1"
            :disabled="props?.disabled"
            :placeholder="placeholder"
            :maxlength="props?.maxLength"
            @focus="onFocusChange(true)"
            @blur="onFocusChange(false)"
            @input="onModelUpdate">
  </textarea>
</template>

<style lang="scss">
.cs-textarea {
  display: flex;
  flex-direction: row;
  flex: 1;
  resize: none;

  @include fc-input;

  &-disabled {
    @include fc-input-disabled;
  }
}
</style>