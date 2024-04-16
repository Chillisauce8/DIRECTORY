<script setup lang="ts">
import {useSettingsTemplateService} from '~/services/helpers/data-templates/settings-template.factory';
import {useDateHelper} from '~/services/helpers/date-helper.factory';
import {useDialogInstance} from '~/services/dialog/core/dialog.composables';


export type AddEventDateDialogData = void;


export interface AddEventDateDialogResult {
  date: Date;
}


const settingsTemplateService = useSettingsTemplateService();
const dateHelper = useDateHelper();
const dialogInstance = useDialogInstance<AddEventDateDialogResult>();


const settingsStartDate = settingsTemplateService.getSettingsStartDate();

const vm = reactive({
  value: null,
  minStartDate: settingsStartDate.minDate,
  maxStartDate: settingsStartDate.maxDate,
});


function dateFormat(date: Date): string {
  return dateHelper.viewDateFormat(date);
}


function onDateModelUpdated(date: Date): void {
  vm.value = date;

  dialogInstance.close({date});
}
</script>

<template>
  <TheDialog class="dialog-with-form" title="Event Date?" subTitle="Do you have an event date yet? If so, please select the START DATE of your event:">
 
    <form name="add-event-date">
      <CSFormField>
        <LazyCSDatepicker :model-value="vm.value"
                      @update:modelValue="onDateModelUpdated"
                      placeholder="Event Start Date"
                      :enable-time-picker="false"
                      :format="dateFormat"
                      :min-date="vm.minStartDate"
                      :max-date="vm.maxStartDate">
        </LazyCSDatepicker>
      </CSFormField>

      <ButtonMain @click="dialogInstance.close()">I don't have a date yet</ButtonMain>
    </form>
  </TheDialog>
</template>

<style scoped lang="scss">

</style>