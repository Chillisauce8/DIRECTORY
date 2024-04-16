<script setup lang="ts">
import type {
  IMoveMoney, IMoveMoneyCustomer, MoveMoneyData,
} from '~/services/helpers/package-builder/moveMoney/move-money.interface';
import {MoveMoneyDirection} from '~/services/helpers/package-builder/moveMoney/move-money.interface';
import {useMoveMoneyFactory} from '~/services/helpers/package-builder/moveMoney/move-money-factory.factory';
import {useDialogInstance} from '~/services/dialog/core/dialog.composables';
import {useCsLodash} from '~/services/cs-lodash.factory';


export type MoveMoneyDialogData = void;


export type MoveMoneyDialogResult = MoveMoneyData;


interface MoveMoneyDialogVM {
  moveMoney: IMoveMoney;

  direction: {name: string, value: MoveMoneyDirection};
  directionList: {name: string, value: MoveMoneyDirection}[];

  selectPlaceholder: string;
  selectList: IMoveMoneyCustomer[];
  selectedCustomer: IMoveMoneyCustomer;
  needToShowCustomerAttendingWarning: boolean;

  tableHeader: string;
  tableList: IMoveMoneyCustomer[];
  amountField: string;
  totalAmount: number;
  maxTotalAmount: number;
  isTotalAmountInvalid: boolean;
}


const dialogInstance = useDialogInstance<MoveMoneyDialogResult>();
const csLodash = useCsLodash();
const moveMoneyFactory = useMoveMoneyFactory();


const vm = reactive<MoveMoneyDialogVM>({
  moveMoney: null,

  direction: null,
  directionList: [],

  selectPlaceholder: null,
  selectList: null,
  selectedCustomer: null,
  needToShowCustomerAttendingWarning: null,

  tableHeader: null,
  tableList: null,
  amountField: null,
  totalAmount: 0,
  maxTotalAmount: 0,
  isTotalAmountInvalid: false
});


const isAmountEdited = ref<boolean>(false);


function init() {
  initDirectionList();

  isAmountEdited.value = false;

  vm.selectList = [];
  vm.tableList = [];
}

function onDirectionChange() {
  vm.selectedCustomer = undefined;

  vm.moveMoney = moveMoneyFactory.getInstance(vm.direction.value);

  if (!vm.moveMoney) {
    vm.selectPlaceholder = '';
    vm.selectList = [];
    vm.tableHeader = '';
    return;
  }

  const {selectPlaceholder, selectList, tableHeader} = vm.moveMoney.onDirectionChange();

  vm.selectPlaceholder = selectPlaceholder;
  vm.selectList = selectList;
  vm.tableHeader = tableHeader;
}

function getSelectOptionTitle(customer: IMoveMoneyCustomer): string {
  if (vm.moveMoney) {
    return vm.moveMoney.getSelectOptionTitle(customer);
  }

  return '';
}

function onSelectedCustomerChange() {
  isAmountEdited.value = false;

  if (!vm.moveMoney) {
    vm.needToShowCustomerAttendingWarning = false;
    vm.tableHeader = '';
    vm.tableList = [];
    vm.amountField = '';
  }

  const {needToShowCustomerAttendingWarning, tableHeader, tableList, amountField, maxTotalAmount} =
      vm.moveMoney.onSelectedCustomerChange(vm.selectedCustomer);

  vm.needToShowCustomerAttendingWarning = needToShowCustomerAttendingWarning;
  vm.tableHeader = tableHeader;
  vm.tableList = tableList;
  vm.amountField = amountField;
  vm.maxTotalAmount = maxTotalAmount;

  calcTotalAmount();
}

function isAmountInvalid(customer: IMoveMoneyCustomer): boolean {
  const amount = customer[vm.amountField];
  const maxAmount = customer.maxAmount;

  return isFinite(amount) && (amount < 0 || amount > maxAmount);
}

function getAmountFieldName(customer: IMoveMoneyCustomer, i: number): string {
  return `${csLodash.camelCase(customer.name)}Amount${i}`;
}

function onAmountChange(customer: IMoveMoneyCustomer) {
  isAmountEdited.value = true;
  customer.isAmountInvalid = isAmountInvalid(customer);
  calcTotalAmount();
}

function calcTotalAmount() {
  vm.totalAmount = vm.tableList?.length > 0 ?
      csLodash.sumBy(vm.tableList, (customer: IMoveMoneyCustomer) => customer[vm.amountField] || 0) : 0;

  vm.isTotalAmountInvalid = csLodash.some(vm.tableList, (customer: IMoveMoneyCustomer) => customer.isAmountInvalid);

  if (!vm.isTotalAmountInvalid) {
    vm.isTotalAmountInvalid = isAmountEdited.value ?
        !isFinite(vm.totalAmount) || vm.totalAmount < 1 || vm.totalAmount > vm.maxTotalAmount : false;
  }
}

function isSaveButtonDisabled(): boolean {
  return !vm.direction || !vm.selectedCustomer || vm.isTotalAmountInvalid ||
      vm.totalAmount < 1 || vm.totalAmount > vm.maxTotalAmount;
}

function save() {
  if (isSaveButtonDisabled()) {
    return;
  }

  const data: MoveMoneyData = [];

  vm.tableList.forEach((customer: IMoveMoneyCustomer) => {
    const dataItem = vm.moveMoney.prepareMoveMoneyDataItem(customer);

    if (dataItem) {
      data.push(dataItem);
    }
  });

  dialogInstance.close(data);
}

function initDirectionList() {
  vm.directionList = [
    {name: 'Move From', value: MoveMoneyDirection.from},
    {name: 'Move To', value: MoveMoneyDirection.to},
  ];
}


onMounted(() => init());
</script>

<template>
  <tool-dialog title="Move Money" class="dialog-with-table">
    <form name="move-money" @submit.prevent="save">
      <CSFormField>
        <LazyCSSelect placeholder="Money Direction"
                  :option-list="vm.directionList"
                  :label-getter="v => v?.name"
                  v-model="vm.direction"
                  @update:modelValue="onDirectionChange">
        </LazyCSSelect>
      </CSFormField>

      <template v-if="vm.direction">
        <CSFormField>
          <LazyCSSelect :placeholder="vm.selectPlaceholder"
                    :option-list="vm.selectList"
                    :label-getter="v => getSelectOptionTitle(v)"
                    v-model="vm.selectedCustomer"
                    @update:modelValue="onSelectedCustomerChange">
          </LazyCSSelect>
        </CSFormField>
      </template>

      <p v-if="vm.selectedCustomer && vm.needToShowCustomerAttendingWarning">
        The {{ vm.selectedCustomer.name }} is still attending -
        if not altered they will still be subject to auto payments
      </p>

      <div class="move-money-table" v-if="vm.direction && vm.selectedCustomer">
        <table>
          <thead class="table-header">
          <tr>
            <th>{{ vm.tableHeader }}</th>
            <th class="column-amount">Amount</th>
          </tr>
          </thead>

          <tbody>
          <template v-for="customer in vm.tableList">
            <tr>
              <td>{{ customer.name }}</td>
              <td class="column-amount">
                <CSInput type="number"
                         class="prefix_pound"
                         :min="0"
                         :max="customer.maxAmount"
                         v-model="customer[vm.amountField]"
                         @update:modelValue="onAmountChange(customer)">
                </CSInput>
              </td>
            </tr>
          </template>

          <tr class="table-header">
            <td>Total</td>
            <td class="column-amount prefix_pound">{{ vm.totalAmount || 0 }}</td>
          </tr>
          </tbody>
        </table>
      </div>


      <ButtonMain type="submit">Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">
.move-money-table {
  width: 100%;
}
.column-amount {
  width: 30%;
}
</style>