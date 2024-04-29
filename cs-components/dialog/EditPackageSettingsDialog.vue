<template>
  <TheDialog title="Edit Package Settings"
             class="dialog-with-form edit-package-settings-dialog">
    <form :name="dataState.formName" @submit.prevent="onFormSubmit">
      <CSFormField v-if="dialogData.eventName">
        <CSInput v-model="dataState.eventName"
                 :disabled="!dataState.canChangeEventName"
                 placeholder="Event name"></CSInput>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="dataState.peopleValue"
                  placeholder="People count"
                  :disabled="!dataState.canChangePeople"
                  :option-list="dataState.peopleOptionsList"
                  :label-getter="v => `${v} ${dataState.peopleSuffix}`">
        </LazyCSSelect>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="dataState.nightsValue"
                  placeholder="Nights count"
                  :disabled="!dataState.canChangeNights"
                  :option-list="dataState.nightsOptionsList"
                  :label-getter="v => `${v} ${dataState.nightsSuffix}`">
        </LazyCSSelect>
      </CSFormField>

      <CSFormField>
        <LazyCSDatepicker v-model="dataState.dateValue"
                      placeholder="Start date"
                      :enable-time-picker="false"
                      :format="dateFormat"
                      :min-date="dataState.minStartDate"
                      :max-date="dataState.maxStartDate"
                      :readonly="!dataState.canChangeDate"
                      :required="dataState.isDateRequired">
        </LazyCSDatepicker>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.dateValue"></CSError>
        </template>
      </CSFormField>

      <ButtonMain  type="submit" v-autofocus>Ok</ButtonMain>
    </form>
  </TheDialog>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type {Validation} from '@vuelidate/core';
import {useVuelidate} from '@vuelidate/core';
import { useDateHelper } from "~/service/helpers/date-helper.factory";
import {getValidationErrorMessage} from '~/utils/cs-form-validation-helpers';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {required} from '@vuelidate/validators';
import {vAutofocus} from '~/utils/directives/autofocus';


export interface EditPackageSettingsDialogData {
  people: number;
  peopleOptionsList: number[];
  peopleSuffix: string;
  nights: number;
  nightsSuffix: string;
  nightsOptionsList: number[];
  date: Date;
  minStartDate?: Date;
  maxStartDate?: Date;
  isDateRequired?: boolean;
  peopleCountIsReadOnly?: boolean;
  canChangeDate: boolean;
  canChangeNights: boolean;
  canChangePeople: boolean;
  canChangeEventName: boolean;
  eventName: string;
}


export interface EditPackageSettingsDialogResult {
  people: number;
  nights: number;
  date: Date;
  eventName: string;
}


const dialogInstance = useDialogInstance<EditPackageSettingsDialogResult>();
const dialogData = useDialogData<EditPackageSettingsDialogData>();

const dateHelper = useDateHelper();

function getValidationError(validation: Validation): string | null {
  return getValidationErrorMessage(validation);
}

async function onFormSubmit(): Promise<void> {
  if (v$.value.$invalid) {
    v$.value.$touch();

    return;
  }

  if (dataState.isDateRequired && !dataState.dateValue) {
    return;
  }

  dialogInstance.close({
    people: dataState.peopleValue,
    nights: dataState.nightsValue,
    date: dataState.dateValue,
    eventName: dataState.eventName,
  });
}

function dateFormat(date): string {
  return dateHelper.viewDateFormat(date);
}

const dataState = reactive({
  formName: 'EditPackageSettingsForm',
  error: null,
  peopleOptionsList: dialogData.peopleOptionsList,
  peopleValue: dialogData.peopleOptionsList.find(o => o === dialogData.people),
  peopleSuffix: dialogData?.peopleSuffix ?? 'Peoples',
  nightsOptionsList: dialogData.nightsOptionsList,
  nightsValue: dialogData.nightsOptionsList.find(o => o === dialogData.nights),
  nightsSuffix: dialogData?.nightsSuffix ?? 'Nights',
  dateValue: dialogData.date,
  minStartDate: dialogData.minStartDate,
  maxStartDate: dialogData.maxStartDate,
  isDateRequired: dialogData.isDateRequired === undefined ? true : dialogData.isDateRequired,
  canChangeDate: dialogData.canChangeDate,
  canChangeNights: dialogData.canChangeNights,
  canChangePeople: dialogData.canChangePeople,
  canChangeEventName: dialogData?.canChangeEventName ?? false,
  eventName: dialogData?.eventName,
});

const validationRules = computed(() => {
  return {
    dateValue: dataState.isDateRequired ? [required] : [],
  };
});

const v$ = useVuelidate(validationRules, dataState, {$autoDirty: true});
</script>

<style lang="scss">
</style>
