<template>
  <TheDialog class="dialog-with-form"
             title="Attendance">

    <form name="attending-form" @submit="onFormSubmit">
      <p class="full-width tool-dialog-text Row-Center">
        Are you going to the event?
      </p>

      <CSFormField>
        <LazyCSSelect v-model="vm.selectedValue"
                  :option-list="vm.possibleValues">
        </LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit">
        View Event Details
      </ButtonMain>
    </form>

  </TheDialog>
</template>

<script lang="ts">

import { reactive } from "vue";
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface AcceptInviteDialogData {
  defaultValue: string;
}


export interface AcceptInviteDialogResult {
  attending: string;
}

export default {
  name: "AcceptInviteDialog",

  setup() {
    const dialogInstance = useDialogInstance<AcceptInviteDialogResult>();
    const dialogData = useDialogData<AcceptInviteDialogData>();

    const possibleValues = ['Yes', 'No'];

    const vm = reactive({
      possibleValues,
      selectedValue: dialogData.defaultValue || possibleValues[0]
    });

    async function onFormSubmit() {
      dialogInstance.close({
        attending: vm.selectedValue
      });
    }

    return {
      vm,
      onFormSubmit: () => onFormSubmit(),
    };
  }
};
</script>

<style scoped>

</style>
