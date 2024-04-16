<script setup lang="ts">
import {vTextareaAutosize} from '~/utils/directives/textarea-autosize.directive';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface EditStaffNotesDialogData {
  staffNote: string;
  eventStaffNote: string;
}


export interface EditStaffNotesDialogResult extends EditStaffNotesDialogData {}


interface EditStaffNotesDialogVM extends EditStaffNotesDialogData {}


const dialogData = useDialogData<EditStaffNotesDialogData>();
const dialogInstance = useDialogInstance<EditStaffNotesDialogResult>();


const vm = reactive<EditStaffNotesDialogVM>({
  staffNote: dialogData?.staffNote ?? '',
  eventStaffNote: dialogData?.eventStaffNote ?? '',
});


function save(): void {
  dialogInstance.close({
    staffNote: vm.staffNote,
    eventStaffNote: vm.eventStaffNote,
  });
}
</script>

<template>
  <tool-dialog title="Add Staff Note">
    <form name="staff-note" @submit.prevent="save">
      <CSFormField>
        <CSTextarea v-model="vm.eventStaffNote"
                    placeholder="Note on all packages"
                    v-textarea-autosize>
        </CSTextarea>
      </CSFormField>

      <CSFormField>
        <CSTextarea v-model="vm.staffNote"
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
