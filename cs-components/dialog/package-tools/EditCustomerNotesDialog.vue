<script setup lang="ts">
import {vTextareaAutosize} from '~/utils/directives/textarea-autosize.directive';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';


export interface EditCustomerNotesDialogData {
  customerNote: string;
  eventCustomerNote: string;
}


export interface EditCustomerNotesDialogResult extends EditCustomerNotesDialogData {}


interface EditCustomerNotesDialogVM {}


const dialogData = useDialogData<EditCustomerNotesDialogData>();
const dialogInstance = useDialogInstance<EditCustomerNotesDialogResult>();


const vm = reactive<EditCustomerNotesDialogVM>({
  customerNote: dialogData?.customerNote ?? '',
  eventCustomerNote: dialogData?.eventCustomerNote ?? '',
});


function save(): void {
  dialogInstance.close({
    customerNote: vm.customerNote,
    eventCustomerNote: vm.eventCustomerNote,
  });
}
</script>

<template>
  <tool-dialog title="Add Customer Note">
    <form name="add-customer-node" @submit.prevent="save">
      <CSFormField>
        <CSTextarea v-model="vm.eventCustomerNote"
                    placeholder="Note on all packages"
                    v-textarea-autosize>
        </CSTextarea>
      </CSFormField>

      <CSFormField>
        <CSTextarea v-model="vm.customerNote"
                    placeholder="Note just for this package"
                    v-textarea-autosize>
        </CSTextarea>
      </CSFormField>

      <ButtonMain type="submit" >Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>
