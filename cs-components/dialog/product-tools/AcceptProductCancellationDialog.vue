<script setup lang="ts">
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';

export interface AcceptProductCancellationDialogData {
  costCurrency: number;
  currencySymbol: string;
}


export type AcceptProductCancellationDialogResult = never;


interface AcceptProductCancellationDialogVM {
  costCurrency: number;
  currencySymbol: string;
}


const dialogData = useDialogData<AcceptProductCancellationDialogData>();
const dialogInstance = useDialogInstance<AcceptProductCancellationDialogResult>();


const vm = reactive<AcceptProductCancellationDialogVM>({
  costCurrency: dialogData.costCurrency,
  currencySymbol: dialogData.currencySymbol,
});

function submit() {
  dialogInstance.close();
}
</script>

<template>
<tool-dialog title="Accept product cancellation">
  <form name="accept-product-cancellation" @submit.prevent="submit">
    <CSFormField>
      <CSInput class="padding_0_1"
               type="number"
               :disabled="true"
               :placeholder="`Cost ${vm.currencySymbol}`"
               :model-value="vm.costCurrency">
      </CSInput>
    </CSFormField>

    <ButtonMain type="submit">OK</ButtonMain>
  </form>
</tool-dialog>
</template>

<style lang="scss">
.padding_0_1 {
  padding: 0 10px;
}
</style>