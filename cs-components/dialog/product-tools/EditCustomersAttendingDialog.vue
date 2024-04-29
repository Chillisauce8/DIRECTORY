<script setup lang="ts">
import type {IPackageProductViewModel} from '~/service/helpers/package-builder/package-view-day.interface';
import type {EditCustomersDialogResult} from '~/components/dialog/product-tools/EditCustomersDialog.vue';
import {useCurrentEvent} from '~/service/helpers/event/current-event.service.factory';
import {useCurrentEventStore} from '~/store/currentEvent';
import {useCurrentUser} from '~/service/helpers/user-common/current-user.factory';
import {useUnitsCountHelper} from '~/service/helpers/package-builder/units-count-helper.servise.factory';
import {useCsLodash} from '~/service/cs-lodash.factory';
import type {ICustomerAttending} from '~/service/helpers/package-builder/package-builder-params.interface';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';


export interface EditCustomersAttendingDialogData {
  packageProductDescription: IPackageProductViewModel;
}


export interface EditCustomersAttendingDialogResult {
  customersAttending: any[];
  needPeople: number;
  needUnits: number;
}


interface EditCustomersAttendingDialogVM {
  eventCustomerSummary: any[];
  possibleUnitsCounts: number[];
  previousNeedPeople: number;
  customersAttending: any[];
  needPeople: number;
  needUnits: number;
}


const dialogData = useDialogData<EditCustomersAttendingDialogData>();
const dialogInstance = useDialogInstance<EditCustomersAttendingDialogResult>();
const currentEvent = useCurrentEvent();
const currentEventStore = useCurrentEventStore();
const currentUser = useCurrentUser();
const unitsCountHelper = useUnitsCountHelper();
const csLodash = useCsLodash();


let currentEventUnsubscribe: () => void;

const vm = reactive<EditCustomersAttendingDialogVM>({
  previousNeedPeople: null,
  possiblePeopleCounts: null,
  possibleUnitsCounts: null,
  customersAttending: null,
  needPeople: null,
  needUnits: null,
  eventCustomerSummary: null,
});


function onNeedUnitsChange(newValue: number): void {
  vm.needUnits = newValue;
}

function revertCustomerAttending(customerSummary: any) {
  let customerId = customerSummary.customer.id;

  const customerFromResult = vm.customersAttending.find(item => item.customerId === customerId);

  if (customerFromResult) {
    const isAttended = customerFromResult?.attending === 'Yes';

    customerFromResult.attending = isAttended ? 'No' : 'Yes';
    updateCounts();
    actualizeUnitsCount();
  }
}

function save(): void {
  dialogInstance.close({
    customersAttending: vm.customersAttending,
    needPeople: vm.needPeople,
    needUnits: vm.needUnits,
  });
}

function shouldShowUnitsCount(): boolean {
  const product = dialogData.packageProductDescription.packageProduct.product;

  if (!product) {
    return false;
  }

  return product?.getConfig()?.maxPeoplePerUnit > 1;
}

function getUnitType(): string {
  return dialogData.packageProductDescription.packageProduct.product.getConfig().unitType;
}

function getMaxUnitsFromProductConfig(): number {
  return unitsCountHelper.getMaxUnitsFromConfig(dialogData.packageProductDescription.packageProduct);
}

function getSessionCountsForCurrentUnitsValue(): number {
  let needUnits = vm.needUnits;

  if (dialogData.packageProductDescription.packageProduct.product.getConfig().unitType === 'Person') {
    needUnits = vm.needPeople;
  }

  return unitsCountHelper
    .calculateSessionsCount(dialogData.packageProductDescription.packageProduct, needUnits);
}

function initParamsForNewEvent() {
  vm.customersAttending = [{
    customerId: currentUser.getId(),
    attending: dialogData.packageProductDescription.isCurrentUserAttended ? 'Yes' : 'No'
  }];

  vm.eventCustomerSummary = [{
    customer: {
      id: currentUser.getId(),
      name: currentUser.getFullName()
    }
  }];
}

function initParamsForSavedEvent(): void {
  setCustomersAttending();
  vm.eventCustomerSummary = currentEvent.getCustomerSummary();
}

function setCustomersAttending(): void {
  vm.customersAttending = currentEvent.getCustomerSummary()
      .map((item: any) => {
        return {
          customerId: item.customer.id,
          attending: 'Yes'
        };
      });

  if (dialogData.packageProductDescription.packageProduct.customerSummary) {
    vm.customersAttending.forEach((item: ICustomerAttending) => {
      for (let customer of dialogData.packageProductDescription.packageProduct.customerSummary) {
        if (customer.customerId.indexOf(item.customerId) !== -1) {
          item.attending = customer.attending;
          break;
        }
      }
    });
  }
}

function updateCounts(): void {
  calculateNeedPeople();
  calculatePossibleUnitsCounts();
}

function calculateNeedPeople() {
  vm.needPeople = getAttendedPeopleCount();
}

function calculatePossibleMaxPeopleCount(): number {
  let maxPeopleForMaxUnits =
      unitsCountHelper.calculateMaxPeopleForMaxUnits(dialogData.packageProductDescription.packageProduct);

  return Math.min(vm.needPeople, maxPeopleForMaxUnits);
}

function calculateMinPossibleUnitsCount(): number {
  let needPeople = vm.needPeople;

  return unitsCountHelper
    .calculateMinNeedUnitsCount(dialogData.packageProductDescription.packageProduct, {needPeople});
}

function calculatePossibleUnitsCounts(): void {
  let minValue = calculateMinPossibleUnitsCount();
  let maxPossibleForPackageValue =
      unitsCountHelper.calculateMaxPossibleUnits(dialogData.packageProductDescription.packageProduct);
  let maxPossiblePeopleCount = calculatePossibleMaxPeopleCount();

  let maxValue = Math.min(maxPossibleForPackageValue, maxPossiblePeopleCount);
  maxValue = Math.max(vm.needUnits, maxValue);

  vm.possibleUnitsCounts = csLodash.range(minValue, maxValue + 1);
}

function actualizeUnitsCount(): void {
  if (!shouldShowUnitsCount()) {
    vm.needUnits = vm.needPeople;
    return;
  }

  let bestPossibleCount = unitsCountHelper
    .unitsHelper.calculateBestUnitsCountOnPeopleChanged(
      dialogData.packageProductDescription.packageProduct.product,
      vm.needUnits,
      vm.needPeople,
      vm.previousNeedPeople
  );

  vm.needUnits = bestPossibleCount;
}

function getAttendedPeopleCount(): number {
  return vm.customersAttending
    .filter((item: ICustomerAttending) => item.attending === 'Yes').length;
}


onMounted(() => {
  if (currentEvent.has()) {
    initParamsForSavedEvent();
  } else {
    initParamsForNewEvent();
  }

  vm.needPeople = dialogData.packageProductDescription.packageProduct.needPeople;
  vm.needUnits = dialogData.packageProductDescription.packageProduct.needUnits;

  vm.previousNeedPeople = vm.needPeople;

  updateCounts();
});

onUnmounted(() => {
  try {
    currentEventUnsubscribe()
  } catch (e) {

  }
});
</script>

<template>
  <tool-dialog title="Edit Guests">
    <form name="edit-guest" @submit.prevent="save">
      <CSFormField>
        <CSInput placeholder="People" type="text" :disabled="true"
                 :model-value="`${vm.needPeople} People`"/>
      </CSFormField>


      <template v-if="shouldShowUnitsCount()">
        <CSFormField>
          <PackageSelectNeedUnits :selectedValue="vm.needUnits"
                                  :possibleValues="vm.possibleUnitsCounts"
                                  :unitType="getUnitType()"
                                  @update:modelValue="onNeedUnitsChange($event)">
          </PackageSelectNeedUnits>
        </CSFormField>
      </template>

      <template v-if="getSessionCountsForCurrentUnitsValue() > 1">
        <p>
          Max units value for product ({{ getMaxUnitsFromProductConfig() }}) exceeded, but it may be done with {{ getSessionCountsForCurrentUnitsValue() }} sessions
        </p>
      </template>

      <PackageEditCustomesAttending :eventCustomerSummary="vm.eventCustomerSummary"
                                    :customersAttending="vm.customersAttending"
                                    @click:customer="revertCustomerAttending($event)">
      </PackageEditCustomesAttending>

      <ButtonMain type="submit">OK</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>
