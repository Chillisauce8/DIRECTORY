<template>
  <tool-dialog title="Edit Start Time"
               :fullscreen="false">
    <form name="edit-start-time" @submit.prevent="submit">
      <template v-if="dialogData.startTime">
        <p class="tool-dialog-text Center">Customers Preferred Start Time:</p>
        <p class="tool-dialog-text Center">
          {{ dateHelper.viewTimeFormat(dialogData.startTime) }}
          (+/- {{ dialogData.preferredStartTimeOffset }} hour{{ dialogData.preferredStartTimeOffset > 1 ? 's' : '' }})
        </p>
      </template>

      <CSFormField>
        <LazyCSSelect v-model="vm.selectedTime"
                  :options="vm.possibleTimeList"
                  label="label"
                  placeholder="Start Time">
        </LazyCSSelect>
      </CSFormField>

      <button-main type="submit" >OK</button-main>
    </form>
  </tool-dialog>
</template>

<script setup lang="ts">
import {useDateHelper} from '~/services/helpers/date-helper.factory';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


interface StartTimeSelectItem {
  value: Date;
  label: string;
}

interface StartTimeDialogVM {
  possibleTimeList: StartTimeSelectItem;
  selectedTime: StartTimeSelectItem;
}

export interface StartTimeDialogData {
  possibleTimeList: Date[];
  startTime: Date;
  preferredStartTimeOffset: number;
}


export interface StartTimeDialogResult {
  startTime: Date;
}


const dialogData = useDialogData<StartTimeDialogData>();
const dialogInstance = useDialogInstance<StartTimeDialogResult>();

const dateHelper = useDateHelper();

const preparedPossibleTimeList = dialogData.possibleTimeList
    .map(t => ({value: t, label: dateHelper.viewTimeFormat(t)}));

const vm = reactive<StartTimeDialogVM>({
  possibleTimeList: preparedPossibleTimeList,
  selectedTime: preparedPossibleTimeList.find(({label}) => label === dateHelper.viewTimeFormat(dialogData.startTime)),
});


function submit() {
  const startTime = vm?.selectedTime?.value;

  if (!startTime) {
    return;
  }

  dialogInstance.close({startTime})
}
</script>

<style lang="scss">

</style>