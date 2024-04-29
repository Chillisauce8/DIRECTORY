<script setup lang="ts">
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';


export interface EditProductStageDialogData {
  productStage: string;
  savedProductStage: string;
  wasConfirmed: boolean;
}


export interface EditProductStageDialogResult {
  productStage: string;
}


interface EditProductStageDialogVM {
  possibleProductStages: string[];
  selectedProductStage: string;
}


const dialogData = useDialogData<EditProductStageDialogData>();
const dialogInstance = useDialogInstance<EditProductStageDialogResult>();


const vm = reactive<EditProductStageDialogVM>({
  possibleProductStages: null,
  selectedProductStage: null,
});


function preparePossibleProductStages(): string[] {
  let result = ['Pending Booking'];

  if (mayAddAlterationStatuses()) {
    result = [...result, 'Pending Alteration'];
  } else if (['Pending Alteration'].includes(dialogData.productStage)) {
    result.push(dialogData.productStage);
  }

  return [...result, 'Pending Cancellation'];
}

function mayAddAlterationStatuses(): boolean {
  if (dialogData.wasConfirmed === true) {
    return true;
  }

  if (dialogData.savedProductStage === 'Booked') {
    return true;
  }

  if (dialogData.savedProductStage === 'Pending Alteration') {
    return true;
  }

  return false;
}


function submit(): void {
  dialogInstance.close({productStage: vm.selectedProductStage});
}


onMounted(() => {
  vm.possibleProductStages = preparePossibleProductStages();
  vm.selectedProductStage = vm.possibleProductStages.find(productStage => productStage === dialogData.productStage);
});
</script>

<template>
  <tool-dialog title="Edit Product Stage">
    <form name="edit-product-stage" @submit.prevent="submit">
      <CSFormField>
        <LazyCSSelect :option-list="vm.possibleProductStages"
                  placeholder="Product Stage"
                  v-model="vm.selectedProductStage">
        </LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit" >OK</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>
