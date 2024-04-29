<script setup lang="ts">
import {useCurrentEvent} from '~/service/helpers/event/current-event.service.factory';
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';

interface EditOrganiser {
  id: string;
  name: string;
}


export type EditOrganiserDialogData = never;


export interface EditOrganiserDialogResult {
  selectedOrganiser: EditOrganiser;
}


interface EditOrganiserDialogVM {
  selectedOrganiser: EditOrganiser;
  possibleOrganisers: EditOrganiser[];
}


const dialogInstance = useDialogInstance<EditOrganiserDialogResult>();
const currentEvent = useCurrentEvent();


const possibleOrganisers = preparePossibleOrganiserList();
const selectedOrganiser = getSelectedOrganiser(possibleOrganisers);


const vm = reactive<EditOrganiserDialogVM>({selectedOrganiser, possibleOrganisers});


function preparePossibleOrganiserList(): EditOrganiser[] {
  return currentEvent.getCustomerSummary()
    .filter((item: any) => {
      return item.customer && item.customer.id && item.customer.id.indexOf('v_') === -1;
    })
    .map((item: any) => {
      return {
        id: item.customer.id,
        name: item.customer.name
      }
    })
    .sort((item1: any, item2: any) => {
      let name1 = item1.name.toLowerCase();
      let name2 = item2.name.toLowerCase();

      if (name1 < name2) { return -1; }
      if (name1 > name2) { return 1; }
      return 0;
    });
}

function getSelectedOrganiser(optionsList: EditOrganiser[]): EditOrganiser {
  const currentOrganiser = currentEvent.getOrganiser();

  if (!currentOrganiser) {
    return null;
  }

  return optionsList?.find(o => currentOrganiser.id === o.id);
}

function save(): void {
  dialogInstance.close({selectedOrganiser: toRaw(vm.selectedOrganiser)});
}
</script>

<template>
  <tool-dialog title="Edit Event Organiser">
    <form name="edit-organiser" @submit.prevent="save">
      <CSFormField>
        <LazyCSSelect v-model="vm.selectedOrganiser"
                  :option-list="vm.possibleOrganisers"
                  :label-getter="v => v.name"
                  :model-match-option="(m, o) => m.id === o.id"
                  placeholder="Organiser">
        </LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit" >Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>
