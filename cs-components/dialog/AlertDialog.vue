<template>
  <TheDialog class="dialog-with-form">
    <form name="alert-form">
      <p class="dialog-text">{{ dialogData.message }}</p>

      <FormButtonWrapper :class="dialogData.horizontalButtons ? '' : 'Flex Column Center'">
        <ButtonMain 
                    v-if="dialogData.button"
                    @click.native="dialogInstance.cancel()">{{ dialogData.button }}</ButtonMain>

        <ButtonMain v-if="dialogData.buttonYes"
                    :class="dialogData?.redYesButton ? 'C1' : 'C2'"
                    @click.native="buttonYesClick">{{ dialogData.buttonYes }}</ButtonMain>

        <ButtonMain 
                    v-if="dialogData.buttonNo"
                    @click.native="buttonNoClick">{{ dialogData.buttonNo }}</ButtonMain>
      </FormButtonWrapper>
    </form>
  </TheDialog>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';

export interface AlertDialogData {
  message: string;
  button?: string;
  buttonYes?: string;
  buttonNo?: string;
  redYesButton?: boolean;
  horizontalButtons?: boolean;
}

export interface AlertDialogResult {

}


const dialogData = useDialogData<AlertDialogData>();
const dialogInstance = useDialogInstance<AlertDialogResult>();


const dataState = reactive<AlertDialogData>({
  horizontalButtons: true,
  ...dialogData,
});


function buttonYesClick() {
  dialogInstance.close(true);
}

function buttonNoClick() {
  dialogInstance.close(false);
}
</script>

<style>

</style>
