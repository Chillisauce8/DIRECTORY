<script setup lang="ts">
import {useDialogConfig, useDialogInstance} from '~/service/dialog/core/dialog.composables';


export interface ConfirmDialogData {
  typeWord: string;
  text?: string;
}


export type ConfirmDialogResult = void;


const dialogInstance = useDialogInstance<ConfirmDialogResult>();
const dialogConfig = useDialogConfig<ConfirmDialogData>();
const {data: dialogData} = dialogConfig;

const typedWord = ref('');


function submit() {
  if (dialogData?.typeWord && dialogData.typeWord !== typedWord.value) {
    return;
  }

  dialogInstance.close();
}
</script>

<template>
  <TheDialog class="dialog-with-form" :title="dialogConfig.title">
    <form name="confirm-dialog" @submit.prevent="submit">
      <p class="dialog-text" v-html="dialogData.text"></p>

      <template v-if="dialogData.typeWord">
        <CSFormField>
          <CSInput name="typedWord"
                   type="text"
                   v-model="typedWord"
                   :placeholder="'Type' + dialogData.typeWord"></CSInput>
        </CSFormField>
      </template>

      <ButtonMain type="submit"
                  :disabled="dialogData.typeWord && typedWord !== dialogData.typeWord">Ok</ButtonMain>
    </form>
  </TheDialog>
</template>

<style lang="scss">
</style>
