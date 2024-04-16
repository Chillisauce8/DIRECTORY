<script setup lang="ts">
import {useCurrentEvent} from '~/services/helpers/event/current-event.service.factory';
import {helpers, maxValue, minValue, required} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';
import {useCsLodash} from '~/services/cs-lodash.factory';
import {useDateHelper} from '~/services/helpers/date-helper.factory';
import {SECURE_TRADING_PAYMENT_SYSTEM_NAME} from '~/services/helpers/payment/payment.service';
import {useDialogInstance} from '~/services/dialog/core/dialog.composables';


export type CustomerRefundDialogData = void;


export interface CustomerRefundDialogResult {
  customerId: string;
  amount: number;
  amountDetails: any;
  transactionId: string;
  refundType: string;
  paymentWay: string;
}


export interface CustomerRefundDialogVM {
  possibleCustomerRefunds: any[];
  possibleRefundTypes: string[];
  possiblePaymentWays: string[];
  possibleTransactions: any[];

  isSelectedTransactionNotReleased: boolean;
  isSelectedTransactionSagePay: boolean;
  transactionLoaded: boolean

  customer: any;
  refundType: any
  paymentWay: any;
  transaction: any;
  refundForCustomers: Record<string, any>;
}


const dialogInstance = useDialogInstance<CustomerRefundDialogResult>();


const currentEvent = useCurrentEvent();
const csLodash = useCsLodash();
const dateHelper = useDateHelper();


const BANK_PAYMENT_WAY = 'Bank';
const CARD_PAYMENT_WAY = 'Card';


const vm = reactive<CustomerRefundDialogVM>({
  possibleCustomerRefunds: [],
  possibleRefundTypes: ['issue', 'overpayment'],
  possiblePaymentWays: [CARD_PAYMENT_WAY, BANK_PAYMENT_WAY],
  possibleTransactions: [],

  isSelectedTransactionNotReleased: false,
  isSelectedTransactionSagePay: false,
  transactionLoaded: false,

  customer: null,
  refundType: null,
  paymentWay: null,
  transaction: null,
  refundForCustomers: null,
});


const validationRules = computed(() => {
  let refundForCustomers = Object.keys(vm?.refundForCustomers ?? {})
    .reduce((validation, id) => {
      const maxRefundAmountValue = vm?.paymentWay === 'Card' ? vm.refundForCustomers?.[id]?.balance : null;

      const refundAmountValidations: any[] = [required, minValue(0)];

      if (maxRefundAmountValue !== null) {
        refundAmountValidations.push(maxValue(maxRefundAmountValue));
      }

      validation[id] = {
        refundAmount: refundAmountValidations,
      };

      return validation;
    }, {}) ?? null;

  nextTick(() => v$.value.refundForCustomers.$reset());

  return {
    customer: [required],
    refundType: [required],
    paymentWay: [required],
    transaction: [required],
    refundForCustomers,
  }
});


const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


onMounted(() => {
  vm.possibleCustomerRefunds = currentEvent.has() ? _getPossibleCustomerRefunds() : [];
});


function save() {
  if (!vm.transaction) {
    return;
  }

  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  const amountsToRefund = Object.entries(vm.refundForCustomers)
    .reduce((res, [key, value]) => {
      res[key] = value.refundAmount;

      return res;
    }, {});

  let amountToRefund = csLodash.sum(Object.values(amountsToRefund));

  if (csLodash.isUndefined(amountToRefund)) {
    amountToRefund = vm.transaction.balance;
  }

  if (amountToRefund === 0) {
    return;
  }

  dialogInstance.close({
    customerId: vm.customer.id,
    amount: amountToRefund,
    amountDetails: amountsToRefund,
    transactionId: vm.transaction.transactionId,
    refundType: vm.refundType,
    paymentWay: vm.paymentWay
  });

}

function updateTransactions() {
  if (!vm?.customer?.id) {
    return;
  }

  vm.possibleTransactions = _getTransactions(vm.customer.id);

  vm.transaction = vm?.possibleTransactions?.length > 0 ? vm.possibleTransactions?.[0] : null

  onTransactionChange();
}

function onTransactionChange() {
  vm.transactionLoaded = false;


  if (!vm.transaction) {
    return;
  }

  vm.isSelectedTransactionNotReleased = _isSelectedTransactionNotReleased();

  vm.refundForCustomers = {};

  vm.transaction.paidForCustomers
    .filter(item => item.balance > 0)
    .forEach(item => vm.refundForCustomers[item.id] = {refundAmount: null, balance: item.balance, name: item.name});

  vm.isSelectedTransactionSagePay = vm?.transaction?.paymentSystem !== SECURE_TRADING_PAYMENT_SYSTEM_NAME;

  vm.transactionLoaded = true;
}

function getMainButtonText(): string {
  if (!vm.transaction) {
    return;
  }

  if (_isSelectedTransactionNotReleased()) {
    return 'Cancel Payment';
  }

  return 'Save';
}

function showTransactionSelection(): boolean {
  return vm?.possibleTransactions?.length > 0;
}

function prepareDateStringForTransaction(): string {
  const dateTimeString = vm.transaction.doneBy.dateTime;
  const date = dateHelper.parseSaveDateFormat(dateTimeString);

  return dateHelper.viewDateFormat(date) + ' ' + dateHelper.viewTimeFormat(date);
}

function refundEnabled(): boolean {
  if (vm.isSelectedTransactionSagePay && vm?.paymentWay === 'Card') {
    return false;
  }

  return true;
}

function _isSelectedTransactionNotReleased(): boolean {
  return vm?.transaction?.transactionStatus === 'NotReleasedYet';
}

function _getTransactions(customerId: string): Array<any> {
  return currentEvent.getEvent().getTransactions()
    .filter(transaction => {
      return ['Deferred', 'Payment', 'Repeat'].includes(transaction?.transactionType) &&
          ['NotReleasedYet', 'Successful'].includes(transaction?.transactionStatus);
    })
    .filter(transaction => transaction?.customer?.id === customerId)
    .map((transaction: any) => {
      const refundTransactions =
          currentEvent.getEvent().getRefundTransactionsTransactions(transaction?.transactionId);

      const refundedAmount = csLodash.sumBy(refundTransactions, 'amount');

      const _transaction = csLodash.clone(transaction);
      _transaction.balance = transaction.amount - refundedAmount;

      const refundedForCustomerFlatten = refundTransactions.map(item => item.paidForCustomers).flat();

      if (_transaction.paidForCustomers) {
        _transaction.paidForCustomers.forEach(item => {
          const _refundedAmount = csLodash
            .sumBy(refundedForCustomerFlatten
              .filter(refundedCustomerItem => refundedCustomerItem.id === item.id),
              'amount');

          item.balance = item.amount - _refundedAmount;
        });
      }

      return _transaction;
    })
    .filter(transaction => transaction.balance > 0);
}

function _getPossibleCustomerRefunds(): any[] {
  return currentEvent.getCustomerSummary()
    .filter(i => _getTransactions(i.customer.id).length)
    .map(i => i?.customer)
    .sort((i1, i2) => {
      const name1 = i1.name.toLowerCase();
      const name2 = i2.name.toLowerCase();

      if (name1 < name2) { return -1; }
      if (name1 > name2) { return 1; }

      return 0;
    });
}
</script>

<template>
  <tool-dialog title="Customer refund">
    <form name="customer-refund" @submit.prevent="save">
      <CSFormField>
        <LazyCSSelect v-model="vm.customer"
                  @update:modelValue="updateTransactions"
                  :label-getter="v => v?.name"
                  :option-list="vm.possibleCustomerRefunds"
                  placeholder="Customer">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.customer"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="vm.refundType"
                  @update:modelValue="updateTransactions"
                  :option-list="vm.possibleRefundTypes"
                  placeholder="Refund Type">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.refundType"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="vm.paymentWay"
                  @update:modelValue="updateTransactions"
                  :option-list="vm.possiblePaymentWays"
                  placeholder="Payment Method">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.paymentWay"></CSError>
        </template>
      </CSFormField>


      <template v-if="showTransactionSelection()">
        <CSFormField>
          <LazyCSSelect v-model="vm.transaction"
                    @update:modelValue="onTransactionChange"
                    :option-list="vm.possibleTransactions"
                    :label-getter="v => `£${v.amount} (£${v.balance } Available for Refund)`"
                    placeholder="Payments">
          </LazyCSSelect>

          <template #suffix>
            <CSError class="cs-form-text-error" :vuelidate-field="v$.transaction"></CSError>
          </template>
        </CSFormField>
      </template>

      <template v-if="vm.refundForCustomers && !vm.isSelectedTransactionNotReleased">
        <template v-for="(paidFor, id) in vm.refundForCustomers">
          <CSFormField>
            <CSInput type="number"
                     v-model="paidFor.refundAmount"
                     :min="0"
                     :max="vm.paymentWay === 'Bank' ? undefined : paidFor.balance"
                     :placeholder="(paidFor.name ? paidFor.name : 'amount') + (vm.paymentWay === 'Card' ? (' : max £' + paidFor.balance) : '')">
            </CSInput>

            <template #suffix>
              <CSError class="cs-form-text-error" :vuelidate-field="v$.refundForCustomers[id]?.refundAmount"></CSError>
            </template>
          </CSFormField>
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


      <div class="Column Center" v-if="vm.transaction && refundEnabled()">
        <ButtonMain type="submit" @click.native="save">{{ getMainButtonText() }}></ButtonMain>
      </div>

      <span v-if="!refundEnabled()" class="text-color_red">
        Not possible to refund for transactions!
      </span>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>