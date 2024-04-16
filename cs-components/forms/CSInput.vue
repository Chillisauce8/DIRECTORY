<template>
  <input :type="props.type"
         :name="props.name"
         class="cs-input"
         :class="{'cs-input-disabled': props.disabled}"
         :disabled="props.disabled"
         :min="props?.min ?? null"
         :max="props?.max ?? null"
         :step="props?.step ?? null"
         :placeholder="placeholder"
         :autocapitalize="props.autocapitalize ?? null"
         :autocorrect="props.autocorrect ?? null"
         v-model="dataState.modelValue"
         @input="onInputChange($event); emits('focus', $event)"
         @focus="onFocusChange(true); emits('focus', $event)"
         @blur="onFocusChange(false); emits('blur', $event)"
         v-restrict-pattern="props?.restrictPattern"/>
</template>

<script lang="ts" setup>
import {reactive, watch} from 'vue';
import {vRestrictPattern} from '~/utils/directives/restrict-pattern.directive';
import {csFormControlComposable} from '~/utils/cs-form-field-contol';


interface CSInputProps {
  type?: string;
  name?: string;
  modelValue?: string | number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  restrictPattern?: RegExp | string;
  autocapitalize?: string;
  autocorrect?: string
}


interface CSInputEmits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'input', event: Event): void;
  (e: 'focus', event: Event): void;
  (e: 'blur', event: Event): void;
}


const props = defineProps<CSInputProps>();
const emits = defineEmits<CSInputEmits>();

const dataState = reactive({
  modelValue: props?.modelValue ?? '',
});

const {stopWatch, onFocusChange, placeholderGetter} = csFormControlComposable(props as any);

const placeholder = computed(() => placeholderGetter());

function init(): void {
  dataState.modelValue = props?.modelValue;
}


function emitInputValue(value: string): void {
  let preparedValue: any = value;

  if (props?.type === 'number' && preparedValue) {
    preparedValue = parseInt(preparedValue, 10);
  }

  emits('update:modelValue', preparedValue);
}


function onInputChange($event: Event): void {
  emitInputValue(($event?.target as HTMLInputElement)?.value);
}


watch(() => props.modelValue, () => init(), {deep: true});


onUnmounted(() => stopWatch());
</script>

<style lang="scss">
.cs-input {
  font-size: $fc-font-size;

  @include fc-input;

  &-disabled {
    @include fc-input-disabled;
  }

  &:read-only {
    @include fc-input-disabled;
    cursor: default;
  }

  &-no-number-arrows {
    -moz-appearance: textfield;
  }
  &-no-number-arrows::-webkit-outer-spin-button,
  &-no-number-arrows::-webkit-inner-spin-button{
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>
