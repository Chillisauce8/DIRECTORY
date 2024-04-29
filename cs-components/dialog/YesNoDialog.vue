<script setup lang="ts">
import type {YesNoValue} from '~/utils/common.types';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';

export interface YesNoDialogData {
  title: string;
  text: string;
  noButtonText?: string;
  yesButtonText?: string;
}


export type YesNoDialogResult = Lowercase<YesNoValue>;


interface YesNoDialogVM extends Required<YesNoDialogData> {}


const dialogData = useDialogData<YesNoDialogData>();
const dialogInstance = useDialogInstance<YesNoDialogResult>();


const vm = reactive<YesNoDialogVM>({
  title: dialogData.title,
  text: dialogData.text,
  noButtonText: dialogData.noButtonText ?? 'No',
  yesButtonText: dialogData?.yesButtonText ?? 'Yes',
});
</script>

<template>
<TheDialog class="dialog-with-form" :title="vm.title">
  <form name="yes-no-dialog">
    <p class="dialog-text full-width" v-html="vm.text"></p>
    <FormButtonWrapper>
      <ButtonMain class="_2nd"
                  v-if="vm.noButtonText"
                  @click.native="dialogInstance.cancel('no')">{{ vm.noButtonText }}</ButtonMain>
      <ButtonMain v-if="vm.yesButtonText"
                  @click.native="dialogInstance.close('yes')">{{ vm.yesButtonText }}</ButtonMain>
    </FormButtonWrapper>
  </form>
</TheDialog>
</template>

<style lang="scss">
</style>
