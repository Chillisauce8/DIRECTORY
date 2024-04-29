<script setup lang="ts">
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';

export type AcceptProductDialogData = never;
export type AcceptProductDialogResult = string | never;


const dialogInstance = useDialogInstance<AcceptProductDialogResult>();

const vm = reactive({
  acceptProductNote: ''
});

function confirm(): void {
  dialogInstance.close(vm.acceptProductNote);
}
</script>

<template>
<tool-dialog title="Confirm Accept">
  <form name="confirm-accept" @submit.prevent="confirm">
    <CSFormField>
      <CSInput type="text"
               name="acceptProductNote"
               placeholder="Add Product Note (Optional)"
               v-model="vm.acceptProductNote">
      </CSInput>
    </CSFormField>

    <ButtonMain type="submit">Confirm Accept</ButtonMain>
  </form>
</tool-dialog>
</template>

<style scoped lang="scss">

</style>
