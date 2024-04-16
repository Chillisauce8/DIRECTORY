<script setup lang="ts">
import {
  getCollectionItemFieldErrorMessage,
  getTopCollectionItemValidationError,
} from '~/utils/cs-form-validation-helpers';
import type {VuelidateCollectionValidation} from '~/utils/cs-form-validation-helpers';


interface CSErrorEachItemProps {
  vuelidateCollectionField?: any; // BaseValidation | Validation;
  itemIndex?: number;
  itemFieldName?: string;
}


const props = defineProps<CSErrorEachItemProps>();


function getFieldValidationTopError(): string {
  const {vuelidateCollectionField, itemFieldName, itemIndex} = props;

  if (!vuelidateCollectionField) {
    return null;
  }

  return getCollectionItemFieldErrorMessage(vuelidateCollectionField as VuelidateCollectionValidation, {itemIndex, itemFieldName}) ?? '';
}


function fieldHasError(): boolean {
  const {vuelidateCollectionField, itemFieldName, itemIndex} = props;

  if (!vuelidateCollectionField) {
    return false;
  }

  return !!getTopCollectionItemValidationError(vuelidateCollectionField as VuelidateCollectionValidation, {itemIndex, itemFieldName}) ?? false;
}
</script>

<template>
  <p class="cs-error" v-if="fieldHasError()">{{ getFieldValidationTopError() }}</p>
</template>

<style lang="scss">
</style>
