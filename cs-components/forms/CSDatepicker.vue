<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
// import type { DatePickerInstance } from "@vuepic/vue-datepicker";
import {csFormControlComposable} from "~/utils/cs-form-field-contol";

import VueDatePicker from "@vuepic/vue-datepicker";

export interface CSDatepickerProps {
  modelValue?: Date;
  preparedValue?: string;
  placeholder?: string;
  enableTimePicker?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  format?: ((date: Date) => string) | string;
  required?: boolean;
  display?: string;
}


interface CSDatepickerEmits {
  (e: 'update:modelValue', value: Date): void;
  (e: 'update:datepickerInstance', value: Ref<any>): void;
}


interface CSDatepickerVM {
  modelValue: Date;
  minDate: Date;
  maxDate: Date;
  disabled: boolean;
  required: boolean;
}


const props = defineProps<CSDatepickerProps>();
const emits = defineEmits<CSDatepickerEmits>();
const instance = getCurrentInstance();

const datepicker = ref<any>(null);

const vm = reactive<CSDatepickerVM>({
  modelValue: props.modelValue,
  minDate: props.minDate,
  maxDate: props.maxDate,
  disabled: props.disabled,
  required: props.required,
});

const {stopWatch, onFocusChange, placeholderGetter} = csFormControlComposable(props as any);

const placeholder = computed(() => placeholderGetter());

const showInput = computed(() => {
  if (!props?.display) {
    return true;
  }

  return props.display === 'input';
});

const showButton = computed(() => {
  if (!props?.display) {
    return false;
  }

  return props.display === 'button';
});


function onModelValueChange(value: Date) {
  vm.modelValue = value;

  emits('update:modelValue', value);
}

function onInputEnter(event: KeyboardEvent) {

}

function onInputDelete(event: KeyboardEvent) {
    if (event.key === "Backspace" || event.key === "Delete") {
      onModelValueChange(undefined);
    }
}

function restoreFocus() {
  const el = instance?.proxy?.$el;

  if (!el) {
    return;
  }

  el?.querySelector('input')?.focus();
}

function initVMF() {
  vm.modelValue = props.modelValue;
  vm.minDate = props.minDate;
  vm.maxDate = props.maxDate;
  vm.disabled = props.disabled;
  vm.required = props.required;
}


watch(() => props.modelValue, () => initVMF());
watch(() => props.minDate, () => initVMF());
watch(() => props.maxDate, () => initVMF());
watch(() => props.disabled, () => initVMF());
watch(() => props.required, () => initVMF());


onMounted(() => {
  if (datepicker?.value) {
    emits('update:datepickerInstance', datepicker);
  }
});

onUnmounted(() => stopWatch());
</script>

<template>
<div class="cs-datepicker-container" :class="showButton ? 'button' : 'Row Flex Grow'">
  <VueDatePicker :class="{'disabled': vm.disabled}"
                 v-model="vm.modelValue"
                 @update:modelValue="onModelValueChange"
                 ref="datepicker"
                 :placeholder="placeholder"
                 :clearable="false"
                 :teleport="true"
                 position="left"
                 :auto-apply="true"
                 :format="props?.format ?? 'EEE dd MMM yyyy'"
                 :enable-time-picker="props?.enableTimePicker ?? false"
                 :start-date="vm.modelValue || vm.minDate || new Date()"
                 :min-date="vm.minDate"
                 :max-date="vm.maxDate"
                 :disabled="vm.disabled"
                 :required="vm.required"
                 :hide-input-icon="true"
                 @focus="onFocusChange(true)"
                 @blur="onFocusChange(false); restoreFocus()"
                 @closed="onFocusChange(false); restoreFocus()">
    <template v-if="showInput" #dp-input="{value}">
      <input class="cs-input no-caret" type="text" :value="value" @keypress.enter="onInputEnter"
             @keyup.delete="onInputDelete($event)" />
    </template>
    <template v-if="showButton" #dp-input="{value}" #main>
      <ButtonContent icon="calendar" :disabled="vm.disabled">
        {{ value || preparedValue }}
      </ButtonContent>
    </template>
  </VueDatePicker>
</div>
</template>

<style lang="scss">
.cs-datepicker-container:not(.button) {
  position: relative;
  width: 100%;

  .no-caret {
    caret-color: transparent;
    caret-shape: unset;
  }

  .dp__main {
    font-size: $fc-font-size;

    &.disabled {
      color: $fc-font-color-disabled;
    }
  }

  .dp-placeholder:not(.fp-float) {
    left: 20px;
  }
}
</style>
