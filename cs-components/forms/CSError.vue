<template>
  <p class="cs-error" v-if="inputValidationHasError()">{{ getInputValidationErrorMessage() }}</p>
</template>


<script lang="ts" setup>
import type {BaseValidation, Validation} from '@vuelidate/core';


import {
  getTopValidationError,
  getValidationErrorMessage
} from '~/utils/cs-form-validation-helpers';


interface CSErrorProps {
  vuelidateField?: BaseValidation | Validation;
  customValidationMessageMap?: {[errorType: string]: string};
}


const props = defineProps<CSErrorProps>();


function inputValidationHasError(): boolean {
  if (!props?.vuelidateField) {
    return false;
  }

  if (!props?.vuelidateField?.$dirty) {
    return false;
  }

  return !!getTopValidationError(props?.vuelidateField) ?? false;
}


function getInputValidationErrorMessage(): string {
  if (!props?.vuelidateField) {
    return;
  }

  return getValidationErrorMessage(props.vuelidateField, props.customValidationMessageMap);
}
</script>


<style lang="scss">
</style>
