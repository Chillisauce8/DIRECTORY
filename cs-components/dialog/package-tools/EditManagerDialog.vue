<script setup lang="ts">
import type {EventManager} from '~/services/helpers/event/event.service';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface EditManagerDialogData {
  selectedManager: EventManager;
  eventId: string;
  title: string;
}


export interface EditManagerDialogResult {
  selectedManager: EventManager;
}


interface EditManagerDialogVM {
  selectedManager: EventManager;
  eventId: string;
  title: string;
}


const dialogData = useDialogData<EditManagerDialogData>();
const dialogInstance = useDialogInstance<EditManagerDialogResult>();


const vm = reactive<EditManagerDialogVM>({
  selectedManager: dialogData.selectedManager,
  eventId: dialogData.eventId,
  title: dialogData.title,
});


function save(): void {
  if (!vm.selectedManager) {
    dialogInstance.cancel();
    return;
  }

  if (vm.selectedManager.id === dialogData?.selectedManager?.id && !vm.title.toLowerCase().includes('booking')) {
    dialogInstance.cancel();
    return;
  }

  dialogInstance.close({selectedManager: vm.selectedManager});
}
</script>

<template>
  <tool-dialog :title="vm.title">
    <form name="edit-manager" @submit.prevent="save">
      <CSFormField>
        <EventManagerSelect v-model="vm.selectedManager"
                            :event-id="vm.eventId">
        </EventManagerSelect>
      </CSFormField>

      <ButtonMain type="submit" >Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>
