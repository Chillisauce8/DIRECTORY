<script setup lang="ts">
import {useCurrentEvent} from '~/services/helpers/event/current-event.service.factory';
import {useVuelidate} from '@vuelidate/core';
import {required} from '@vuelidate/validators';
import {useDateHelper} from '~/services/helpers/date-helper.factory';
import {useCsLodash} from '~/services/cs-lodash.factory';
import {getValidationErrorMessage} from '~/utils/cs-form-validation-helpers';
import {useDialogInstance} from '~/services/dialog/core/dialog.composables';


const POSSIBLE_TRANSACTION_STATUSES = ['Aborted', 'Chargeback'];


export type AbortTransactionDialogData = void;


export interface AbortTransactionDialogResult {
  customerId: string;
  transactionId: string;
  transactionStatus: string;
}


interface AbortTransactionDialogVM {
  possibleCustomers: any[];
  possibleTransactionStatuses: string[];
  possibleTransactions: any[];

  customer: any;
  transaction: any;
  transactionStatus: string;

  isSelectedTransactionNotReleased: boolean;
  transactionLoaded: boolean;
}

const dialogInstance = useDialogInstance<AbortTransactionDialogResult>();
const currentEvent = useCurrentEvent();
const dateHelper = useDateHelper();
const csLodash = useCsLodash();


const vm = reactive<AbortTransactionDialogVM>({
  possibleCustomers: null,
  possibleTransactionStatuses: [...POSSIBLE_TRANSACTION_STATUSES],
  possibleTransactions: [],

  customer: null,
  transaction: null,
  transactionStatus: null,

  isSelectedTransactionNotReleased: false,
  transactionLoaded: false,
});


const validationRules = computed(() => ({
  customer: [required],
  transactionStatus: [required],
  transaction: [required],
}));


const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});

onMounted(() => {
  if (!currentEvent.has()) {
    vm.possibleCustomers = [];
    return;
  }

  vm.possibleCustomers = getPossibleCustomers();
});

function save() {
  if (!vm.transaction) {
    return;
  }

  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  dialogInstance.close({
    customerId: vm.customer.id,
    transactionId: vm.transaction.transactionId,
    transactionStatus: vm.transactionStatus
  });
}

function updateTransactions() {
  vm.possibleTransactions = _getTransactions(vm.customer.id);

  vm.transaction = vm.possibleTransactions.length > 0 ? vm.possibleTransactions?.[0] : null;

  onTransactionChange(vm.transaction);
}

function onTransactionChange(value: any) {
  vm.transactionLoaded = false;

  vm.transaction = value;

  if (!vm.transaction) {
    return;
  }

  vm.isSelectedTransactionNotReleased = isSelectedTransactionNotReleased();

  vm.transactionLoaded = true;
}

function getMainButtonText(): string {
  if (!vm.transaction) {
    return;
  }

  return 'Save';
}

function showTransactionSelection(): boolean {
  return vm.possibleTransactions?.length > 0;
}

function prepareDateStringForTransaction(): string {
  const dateTimeString = vm.transaction.doneBy.dateTime;
  const date = dateHelper.parseSaveDateFormat(dateTimeString);

  return dateHelper.viewDateFormat(date) + ' ' + dateHelper.viewTimeFormat(date);
}

function isSelectedTransactionNotReleased(): boolean {
  return vm?.transaction?.transactionStatus === 'NotReleasedYet';
}

function _getTransactions(customerId: string): any[] {
  return currentEvent.getEvent().getTransactions()
    .filter(transaction => {
      return csLodash.includes(['NotReleasedYet', 'Successful'], transaction.transactionStatus);
    })
    .filter((transaction: any) => {
      return transaction.customer && transaction.customer.id && transaction.customer.id === customerId;
    })
    .map((transaction: any) => {
      const refundTransactions =
          currentEvent.getEvent().getRefundTransactionsTransactions(transaction.transactionId);

      const refundedAmount = csLodash.sumBy(refundTransactions, 'amount');

      const _transaction = csLodash.clone(transaction);
      _transaction.balance = transaction.amount - refundedAmount;

      const refundedForCustomerFlatten = refundTransactions.map(item => item.paidForCustomers).flat();

      if (_transaction.paidForCustomers) {
        _transaction.paidForCustomers.forEach(item => {
          const _refundedAmount = csLodash.sumBy(refundedForCustomerFlatten
              .filter(refundedCustomerItem => refundedCustomerItem.id === item.id),
              'amount');

          item.balance = item.amount - _refundedAmount;
        });
      }

      return _transaction;
    })
    .filter((transaction: any) => {
      return transaction.balance > 0;
    })
}

function getPossibleCustomers(): Array<any> {
  return currentEvent.getCustomerSummary()
    .filter((item: any) => {
      return _getTransactions(item.customer.id).length;
    })
    .map((item: any) => {
      return item.customer;
    })
    .sort((item1: any, item2: any) => {
      const name1 = item1.name.toLowerCase();
      const name2 = item2.name.toLowerCase();

      if (name1 < name2) { return -1; }
      if (name1 > name2) { return 1; }

      return 0;
    });
}
</script>

<template>
  <tool-dialog title="Abort/Chargeback">
    <form name="abort-transaction-form" @submit.prevent="save">
      <CSFormField>
        <LazyCSSelect v-model="vm.customer" v-if="vm.possibleCustomers"
                  @update:modelValue="updateTransactions"
                  placeholder="Customer"
                  :option-list="vm.possibleCustomers"
                  :label-getter="v => v?.name">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.customer"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="vm.transactionStatus"
                  placeholder="Transaction Status"
                  :option-list="vm.possibleTransactionStatuses">
          <p class="cs-form-text-error"
             v-if="v$.transactionStatus.$error">{{getValidationErrorMessage(v$.transactionStatus)}}</p>
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.transactionStatus"></CSError>
        </template>
      </CSFormField>

      <template v-if="showTransactionSelection()">
        <CSFormField>
          <LazyCSSelect v-model="vm.transaction"
                    @update:modelValue="onTransactionChange"
                    placeholder="Transactions"
                    :option-list="vm.possibleTransactions"
                    :label-getter="v => `£${ v.amount } (£${ v.balance } Available for Refund)`">
          </LazyCSSelect>

          <template #suffix>
            <CSError class="cs-form-text-error" :vuelidate-field="v$.transaction"></CSError>
          </template>
        </CSFormField>
      </template>

      <template v-if="vm.transactionLoaded && !vm.isSelectedTransactionNotReleased">
        <template v-for="paidFor in vm.transaction.paidForCustomers">
          <template v-if="paidFor.balance > 0">
            <CSFormField>
              <CSInput type="number"
                       :disabled="true"
                       :model-value="paidFor.balance"
                       :placeholder="paidFor.name">
              </CSInput>
            </CSFormField>
          </template>
        </template>
      </template>

      <div class="Column" v-if="vm.transaction">
        <template v-if="vm.transaction.transactionId">
          <p class="tool-dialog-text">Transaction Id: {{ vm.transaction.transactionId }}</p>
        </template>

        <template v-if="vm.transaction.transactionType">
          <p class="tool-dialog-text">Transaction type: {{ vm.transaction.transactionType }}</p>
        </template>

        <template v-if="vm.transaction.doneBy">
          <p class="tool-dialog-text">Done by {{ vm.transaction.doneBy.name }} at {{ prepareDateStringForTransaction() }}</p>
        </template>

        <template v-if="vm.transaction.amount">
          <p class="tool-dialog-text">Amount: £{{ vm.transaction.amount }}</p>
        </template>

        <template v-if="vm.transaction.type">
          <p class="tool-dialog-text">Type: {{ vm.transaction.type }}</p>
        </template>

        <template v-if="vm.transaction.method">
          <p class="tool-dialog-text">Method: {{ vm.transaction.method }}</p>
        </template>

        <template v-if="vm.transaction.transactionStatus">
          <p class="tool-dialog-text">Transaction status: {{ vm.transaction.transactionStatus }}</p>
        </template>
      </div>

      <div class="Column Center" v-if="vm.transaction">
        <ButtonMain type="submit" >{{ getMainButtonText() }}></ButtonMain>
      </div>
    </form>
  </tool-dialog>
</template>

<style lang="scss">
</style>
