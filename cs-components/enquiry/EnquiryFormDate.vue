<script setup lang="ts">
import {vZukoAttrsPreparer} from '~/utils/directives/zuko-attrs-preparer.directive';
import type {FormTrackingParams} from '~/services/helpers/forms-tracking/form-tracking-params';
import {useDateHelper} from '~/services/helpers/date-helper.factory';
import type {Validation} from '@vuelidate/core';


interface EnquiryFormDateProps {
  modelValue: Date;
  validation: Validation;
  placeholder?: string;
  minDate?: any;
  maxDate?: any;
  trackingParams?: FormTrackingParams;
}


interface EnquiryFormDateEmits {
  (e: 'update:modelValue', value: Date): void;
}


const dateHelper = useDateHelper();


const props = defineProps<EnquiryFormDateProps>();
const emits = defineEmits<EnquiryFormDateEmits>();


function patchModelValueIfNeeded() {
  let updatedModel = null;

  if (props.minDate && props.modelValue) {
    const minDate = dateHelper.saveDateFormat(props.minDate);
    const date = dateHelper.saveDateFormat(props.modelValue);

    if (date < minDate) {
      updatedModel = minDate;
    }
  }

  if (props.maxDate && props.modelValue) {
    const maxDate = dateHelper.saveDateFormat(props.maxDate);
    const date = dateHelper.saveDateFormat(props.modelValue);

    if (date > maxDate) {
      updatedModel = maxDate;
    }
  }

  if (updatedModel) {
    emits('update:modelValue', updatedModel);
  }
}


function init(): void {
  // patchModelValueIfNeeded()
}


onMounted(() => init());
onBeforeUpdate(() => init());
</script>

<template>
    <CSFormField>
      <LazyCSDatepicker v-zuko-attrs-preparer="props?.trackingParams?.zuko"
                    :placeholder="props.placeholder"
                    :min-date="props.minDate"
                    :max-date="props.maxDate"
                    :model-value="props.modelValue"
                    @update:modelValue="value => emits('update:modelValue', value)">
      </LazyCSDatepicker>

      <template #suffix>
        <CSError class="cs-form-text-error" :vuelidate-field="props.validation"></CSError>
      </template>
    </CSFormField>
</template>

<style lang="scss">
</style>