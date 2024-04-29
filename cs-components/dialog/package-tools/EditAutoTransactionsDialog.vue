<script setup lang="ts">
import type {YesNoValue} from '~/utils/common.types';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';

export interface EditAutoTransactionsDialogData {
  automaticTransactionsAllowed: boolean;
}


export interface EditAutoTransactionsDialogResult {
  allowed: boolean;
}


interface EditAutoTransactionsDialogVM {
  selected: YesNoValue;
  possibleAutomaticTransactions: YesNoValue[];
}


const dialogData = useDialogData<EditAutoTransactionsDialogData>();
const dialogInstance = useDialogInstance<EditAutoTransactionsDialogResult>();


const vm = reactive<EditAutoTransactionsDialogVM>({
  selected: dialogData.automaticTransactionsAllowed === true ? 'Yes' : 'No' as YesNoValue,
  possibleAutomaticTransactions: ['Yes', 'No'] as YesNoValue[],
});


function save() {
  dialogInstance.close({allowed: vm.selected === 'Yes'});
}
</script>

<template>
  <tool-dialog title="Automatic Transactions">
    <form name="automatic-transactions" @submit.prevent="save">
      <p class="full-width text-align_center">Adjust to allow or not Automatic Transactions</p>

      <CSFormField>
        <LazyCSSelect v-model="vm.selected" :option-list="vm.possibleAutomaticTransactions"></LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit" >Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">
</style>
