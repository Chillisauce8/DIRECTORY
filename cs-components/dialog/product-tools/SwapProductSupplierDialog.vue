<template>
  <tool-dialog title="Swap Supplier">
    <form name="swap-supplier" @submit.prevent="submit">
      <CSFormField>
        <SelectSupplier v-model="selectedSupplier"
                        :exclude-head-of-office="true">
        </SelectSupplier>
      </CSFormField>

      <button-main type="submit" >OK</button-main>
    </form>
  </tool-dialog>
</template>

<script setup lang="ts">
import SelectSupplier from '~/components/supplier/SelectSupplier.vue';
import type {SupplierItemValue} from '~/components/supplier/SelectSupplier.vue';
import {DialogInstance} from '~/services/dialog/core/dialog-instance';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface SwapProductSupplierDialogData {
  supplier: SupplierItemValue;
}


export interface SwapProductSupplierDialogResult {
  supplier: SupplierItemValue;
}


const dialogData = useDialogData<SwapProductSupplierDialogData>();
const dialogInstance = useDialogInstance<DialogInstance<SwapProductSupplierDialogResult>>();

const selectedSupplier = ref(dialogData.supplier);


function submit(): void {
  if (!selectedSupplier) {
    return;
  }

  dialogInstance.close({supplier: toRaw(selectedSupplier)});
}
</script>

<style lang="scss">

</style>
