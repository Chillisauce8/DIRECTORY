<script setup lang="ts">
import {useCurrentEvent} from '~/service/helpers/event/current-event.service.factory';
import {useDateHelper} from '~/service/helpers/date-helper.factory';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';


export interface EditPaymentDatesDialogData {
  depositDueDate: Date;
  balanceDueDate: Date;
  adjustmentDueDate: Date;
  permissions: string[];
}

export interface EditPaymentDatesDialogResult {}


interface EditPaymentDatesDialogVM {
  depositDueDate: Date;
  balanceDueDate: Date;
  adjustmentDueDate: Date;
}


const dialogInstance = useDialogInstance<EditPaymentDatesDialogResult>();
const dialogData = useDialogData<EditPaymentDatesDialogData>();
const currentEvent = useCurrentEvent();
const dateHelper = useDateHelper();


const vm = reactive<EditPaymentDatesDialogVM>({
  depositDueDate: dialogData.depositDueDate,
  balanceDueDate: dialogData.balanceDueDate,
  adjustmentDueDate: dialogData.adjustmentDueDate,
});

const DAY_BETWEEN_BALANCE_AND_ADJUSTMENT = 7;
const DAY_BETWEEN_DEPOSIT_AND_BALANCE = 0;

const depositMaxDate = computed(() => {
  return dateHelper.getDateInNDays(vm.balanceDueDate, -DAY_BETWEEN_DEPOSIT_AND_BALANCE);
});

const balanceMinDate = computed(() => {
  return dateHelper.getDateInNDays(vm.depositDueDate, DAY_BETWEEN_DEPOSIT_AND_BALANCE);
});

const balanceMaxDate = computed(() => {
  return dateHelper.getDateInNDays(vm.adjustmentDueDate, -DAY_BETWEEN_BALANCE_AND_ADJUSTMENT);
});

const adjustmentMinDate = computed(() => {
  return dateHelper.getDateInNDays(vm.balanceDueDate, DAY_BETWEEN_BALANCE_AND_ADJUSTMENT);
});


function dateEditPossible(dateName: string): boolean {
  return !!dialogData?.permissions;
}

function save() {
  if (!currentEvent.has()) {
    dialogInstance.cancel('Event is not saved yet');
    return;
  }

  dialogInstance.close({
    depositDueDate: vm.depositDueDate,
    balanceDueDate: vm.balanceDueDate,
    adjustmentDueDate: vm.adjustmentDueDate,
  });
}
</script>

<template>
<tool-dialog title="Edit Payment Dates">
  <form name="edit-payment-dates" @submit.prevent="save">
    <CSFormField>
      <LazyCSDatepicker v-model="vm.depositDueDate"
                    :disabled="!dateEditPossible('Deposit')"
                    :maxDate="depositMaxDate"
                    placeholder="Deposit due date">
      </LazyCSDatepicker>
    </CSFormField>

    <CSFormField>
      <LazyCSDatepicker v-model="vm.balanceDueDate"
                    :disabled="!dateEditPossible('Balance')"
                    :minDate="balanceMinDate"
                    :maxDate="balanceMaxDate"
                    placeholder="Balance due date">
      </LazyCSDatepicker>
    </CSFormField>

    <CSFormField>
      <LazyCSDatepicker v-model="vm.adjustmentDueDate"
                    :disabled="!dateEditPossible('Adjustment')"
                    :minDate="adjustmentMinDate"
                    placeholder="Adjustment due date">
      </LazyCSDatepicker>
    </CSFormField>

    <ButtonMain type="submit">Save</ButtonMain>
  </form>
</tool-dialog>
</template>

<style lang="scss">

</style>
