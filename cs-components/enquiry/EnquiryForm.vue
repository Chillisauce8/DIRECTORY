<script setup lang="ts">
import {vZukoAttrsPreparer} from '~/utils/directives/zuko-attrs-preparer.directive';
import {vTextareaAutosize} from '~/utils/directives/textarea-autosize.directive';
import EnquiryFormDate from '~/components/enquiry/EnquiryFormDate.vue';
import type {Validation} from '@vuelidate/core';


interface EnquiryFormProps {
  enquiryConfig?: any;
  formDescription?: any;
  modelValue?: any;
  formTrackingParams?: any;
  validation?: Validation;
}


const props = defineProps<EnquiryFormProps>();
</script>

<template>
  <template v-if="props.enquiryConfig">
    <template v-if="props.formDescription?.locationField">
      <CSFormField>
        <LazyCSSelect v-model="props.modelValue.locationField"
                  :placeholder="props.formDescription.locationField.title"
                  :option-list="props.enquiryConfig?.locationList"
                  :id="props.formTrackingParams?.locationField?.nativeElementId"
                  v-zuko-attrs-preparer="props.formTrackingParams?.locationField?.zuko">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="props.validation.locationField"></CSError>
        </template>
      </CSFormField>
    </template>

    <template v-if="props.formDescription?.peopleField?.display">
      <CSFormField>
        <LazyCSSelect v-model="props.modelValue.peopleField"
                  :placeholder="props.formDescription.peopleField.title"
                  :option-list="props.enquiryConfig.settingsPeople.possibleCounts"
                  :label-getter="v => `${v} ${props.enquiryConfig.settingsPeople.suffix}`"
                  :id="props.formTrackingParams?.peopleField?.nativeElementId"
                  v-zuko-attrs-preparer="props.formTrackingParams?.peopleField?.zuko">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="props.validation.peopleField"></CSError>
        </template>
      </CSFormField>
    </template>

    <template v-if="props.formDescription?.dateField?.display">
      <EnquiryFormDate v-model="props.modelValue.dateField"
                       :min-date="props.enquiryConfig.settingsStartDate.minDate"
                       :max-date="props.enquiryConfig.settingsStartDate.maxDate"
                       :tracking-params="props.formTrackingParams?.settingsStartDate"
                       :placeholder="props.formDescription.dateField.title"
                       :validation="props.validation.dateField">
      </EnquiryFormDate>
    </template>

    <template v-if="props.formDescription?.nightsField?.display">
      <CSFormField>
        <LazyCSSelect v-model="props.modelValue.nightsField"
                  v-zuko-attrs-preparer="props.formTrackingParams?.nightsField?.zuko"
                  :placeholder="props.formDescription.nightsField.title"
                  :option-list="props.enquiryConfig.settingsNights.possibleCounts"
                  :label-getter="v => `${v} ${props.enquiryConfig.settingsNights.suffix}`">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="props.validation.nightsField"></CSError>
        </template>
      </CSFormField>
    </template>

    <template v-if="props.formDescription.notesField.display">
      <CSFormField>
        <CSTextarea v-model="props.modelValue.notesField"
                    :placeholder="props.formDescription.notesField.title"
                    :max-length="2000"
                    v-textarea-autosize="{minRows: 1, maxRows: 5}"
                    v-zuko-attrs-preparer="props.formTrackingParams?.notesField.zuko">
        </CSTextarea>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="props.validation.notesField"></CSError>
        </template>
      </CSFormField>
    </template>
  </template>
</template>

<style lang="scss">
</style>