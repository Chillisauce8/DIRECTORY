<script setup lang="ts">
import {PackageProduct} from '~/service/models/packageProduct';
import {useCurrentEventStore} from '~/store/currentEvent';
import {useCurrentEvent} from '~/service/helpers/event/current-event.service.factory';
import type {YesNoValue} from '~/utils/common.types';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';


export interface EditParticipationDialogData {
  customerId: string;
  packageProduct: PackageProduct;
}


export interface EditParticipationDialogResult {
  customerId: string;
  attending: YesNoValue;
  changed: boolean;
}


interface EditParticipationDialogVM {
  possibleValues: YesNoValue[];
  selectedValue: YesNoValue;
}


const dialogData = useDialogData<EditParticipationDialogData>();
const dialogInstance = useDialogInstance<EditParticipationDialogResult>();
const currentEventStore = useCurrentEventStore();
const currentEvent = useCurrentEvent();


const vm = reactive<EditParticipationDialogVM>({
  possibleValues: ['Yes', 'No'],
  selectedValue: null,
});


const customerId = dialogData.customerId;
const packageProduct = dialogData.packageProduct;
let initialValue: string;


function submit() {
  dialogInstance.close({
    customerId: customerId,
    attending: vm.selectedValue,
    changed: vm.selectedValue !== initialValue
  });
}

function _isCustomerAttended(): boolean {
  if (!packageProduct.customerSummary || !packageProduct.customerSummary.length) {
    return false;
  }

  for (let customerSummaryItem of packageProduct.customerSummary) {
    if (customerSummaryItem.customerId.indexOf(customerId) !== -1) {
      return customerSummaryItem.attending === 'Yes';
    }
  }

  return false;
}

onMounted(() => {
  if (!currentEventStore.eventModel) {
    return;
  }

  const attended = _isCustomerAttended()
  vm.selectedValue = attended ? 'Yes' : 'No';
  initialValue = vm.selectedValue;
});
</script>

<template>
<tool-dialog title="Edit Participation">
  <form name="edit-participation" @submit.prevent="submit">
    <CSFormField>
      <LazyCSSelect v-model="vm.selectedValue"
                :option-list="vm.possibleValues">
      </LazyCSSelect>
    </CSFormField>

    <ButtonMain type="submit">OK</ButtonMain>
  </form>
</tool-dialog>
</template>

<style lang="scss">

</style>
