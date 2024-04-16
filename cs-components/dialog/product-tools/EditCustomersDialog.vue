<script setup lang="ts">
import type {ICustomerAttending} from '~/services/helpers/package-builder/package-builder-params.interface';
import type {IPackageProductViewModel} from '~/services/helpers/package-builder/package-view-day.interface';
import {useCurrentEventStore} from '~/store/currentEvent';
import {useCurrentEvent} from '~/services/helpers/event/current-event.service.factory';
import type {IProduct} from '~/services/models/product.interface';
import {useUnitsCountHelper} from '~/services/helpers/package-builder/units-count-helper.servise.factory';
import {useMessageService} from '~/services/helpers/message.factory';
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useCsLodash} from '~/services/cs-lodash.factory';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface EditCustomersDialogData {
  packageProductDescription: IPackageProductViewModel;
  packagePeopleCount: number;
}


export interface EditCustomersDialogResult {
  customersAttending: any[];
  needPeople: number;
  needUnits: number;
}


interface EditCustomersDialogVM {
  previousNeedPeople: number;
  possiblePeopleCounts: number[];
  possibleUnitsCounts: number[];
  customersAttending: any[];
  needPeople: number;
  needUnits: number;
  eventCustomerSummary: any[];
}


const dialogData = useDialogData<EditCustomersDialogData>();
const dialogInstance = useDialogInstance<EditCustomersDialogResult>();
const currentEvent = useCurrentEvent();
const currentEventStore = useCurrentEventStore();
const unitsCountHelper = useUnitsCountHelper();
const messageService = useMessageService();
const currentUser = useCurrentUser();
const csLodash = useCsLodash();


let currentEventStoreUnsubscribe: () => void;
const vm = reactive<EditCustomersDialogVM>({
  previousNeedPeople: null,
  possiblePeopleCounts: null,
  possibleUnitsCounts: null,
  customersAttending: null,
  needPeople: null,
  needUnits: null,
  eventCustomerSummary: null,
});


function onNeedPeopleChange(newValue: number) {
  vm.needPeople = newValue;
  updateCounts();
  actualizeUnitsCount();

  vm.previousNeedPeople = vm.needPeople;
}

function onNeedUnitsChange(newValue: number) {
  vm.needUnits = newValue;
}

function onEditCustomerAttendingClick(customerSummary: any): void {
  const peopleCount = vm.customersAttending
      .reduce((r, c) => r + (c.attending === 'Yes' ? 1 : 0), 0);

  const maxPeopleCount = calculatePossibleMaxPeopleCount();

  const customer = vm.customersAttending.find(c => c.customerId === customerSummary.customer.id);

  const isAttended = customer?.attending === 'Yes';

  if (peopleCount >= maxPeopleCount && !isAttended) {
    messageService.showErrorMessage(`You reached max people count - ${maxPeopleCount} people`);

    return;
  }

  revertCustomerAttending(customerSummary);
}

function revertCustomerAttending(customerSummary: any) {
  let customerId = customerSummary.customer.id;

  for (let item of vm.customersAttending) {
    if (item.customerId.indexOf(customerId) !== -1) {
      item.attending = item.attending === 'Yes' ? 'No' : 'Yes';
    }
  }

  updateCounts();
  actualizeUnitsCount();
}

function save() {
  dialogInstance.close({
    customersAttending: vm.customersAttending,
    needPeople: vm.needPeople,
    needUnits: vm.needUnits,
  })

}

function shouldShowUnitsCount(): boolean {
  const product: IProduct = dialogData.packageProductDescription.packageProduct.product;

  return product?.getConfig()?.maxPeoplePerUnit > 1;
}

function getUnitType(): string {
  const product: IProduct = dialogData.packageProductDescription.packageProduct.product;

  return product.getConfig().unitType ?? '';
}

function getMaxUnitsFromProductConfig(): number {
  return unitsCountHelper.getMaxUnitsFromConfig(dialogData.packageProductDescription.packageProduct);
}

function getSessionCountsForCurrentUnitsValue(): number {
  let needUnits = vm.needUnits;

  if (dialogData.packageProductDescription.packageProduct.product.getConfig()?.unitType === 'Person') {
    needUnits = vm.needPeople;
  }

  return unitsCountHelper.calculateSessionsCount(dialogData.packageProductDescription.packageProduct, needUnits);
}

function initParamsForNewEvent() {
  vm.customersAttending = [{
    customerId: currentUser.getId(),
    attending: dialogData.packageProductDescription.packageProduct.needPeople &&
    dialogData.packageProductDescription.isCurrentUserAttended ? 'Yes' : 'No'
  }];

  vm.eventCustomerSummary = [{
    customer: {
      id: currentUser.getId(),
      name: currentUser.getFullName(),
    }
  }];
}

function initParamsForSavedEvent() {
  setCustomersAttending();
  vm.eventCustomerSummary = currentEvent.getCustomerSummary();
}

function setCustomersAttending() {
  vm.customersAttending = currentEvent.getCustomerSummary()
      .map((item: any) => {
        return {
          customerId: item.customer.id,
          attending: 'Yes'
        };
      });

  if (dialogData.packageProductDescription.packageProduct.customerSummary) {
    vm.customersAttending.forEach((item: ICustomerAttending) => {
      let attendingFromProduct = 'No';
      for (let customer of dialogData.packageProductDescription.packageProduct.customerSummary) {
        if (customer.customerId.indexOf(item.customerId) !== -1) {
          attendingFromProduct = customer.attending;
          break;
        }
      }

      item.attending = attendingFromProduct;
    });
  }
}

function updateCounts() {
  calculatePossiblePeopleCounts();
  calculatePossibleUnitsCounts();
}

function calculatePossibleMaxPeopleCount() {
  let maxPeopleForMaxUnits = unitsCountHelper
    .calculateMaxPeopleForMaxUnits(dialogData.packageProductDescription.packageProduct);

  return Math.min(dialogData.packagePeopleCount, maxPeopleForMaxUnits);
}

function calculatePossiblePeopleCounts() {
  let minValue = isFinite(getAttendedPeopleCount()) ? getAttendedPeopleCount() : 1;
  let maxValue = calculatePossibleMaxPeopleCount();

  vm.possiblePeopleCounts = csLodash.range(minValue, maxValue + 1);

  if (vm.needPeople < minValue) {
    vm.needPeople = minValue;
  } else if (vm.needPeople > maxValue) {
    vm.needPeople = maxValue;
  }
}

function calculateMinPossibleUnitsCount(): number {
  let needPeople = vm.needPeople;

  return unitsCountHelper
      .calculateMinNeedUnitsCount(dialogData.packageProductDescription.packageProduct, {needPeople});
}

function calculatePossibleUnitsCounts() {
  let minValue = calculateMinPossibleUnitsCount();
  let maxPossibleForPackageValue =
      unitsCountHelper.calculateMaxPossibleUnits(dialogData.packageProductDescription.packageProduct);
  let maxPossiblePeopleCount = calculatePossibleMaxPeopleCount();

  let maxValue = Math.min(maxPossibleForPackageValue, maxPossiblePeopleCount);
  maxValue = Math.max(vm.needUnits, maxValue);

  vm.possibleUnitsCounts = csLodash.range(minValue, maxValue + 1);
}

function actualizeUnitsCount() {
  if (!shouldShowUnitsCount()) {
    vm.needUnits = vm.needPeople;

    return;
  }

  const bestPossibleCount = unitsCountHelper
      .unitsHelper.calculateBestUnitsCountOnPeopleChanged(dialogData.packageProductDescription.packageProduct.product,
          vm.needUnits, vm.needPeople, vm.previousNeedPeople);

  vm.needUnits = bestPossibleCount;
}

function getAttendedPeopleCount(): number {
  return vm.customersAttending
    .filter((item: ICustomerAttending) => item.attending === 'Yes')
    .length;
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
  actualizeUnitsCount();
});

onUnmounted(() => {
  try {
    currentEventStoreUnsubscribe();
  } catch (e) {

  }
});
</script>

<template>
  <tool-dialog title="Edit Guests">
    <template v-if="vm.eventCustomerSummary">
      <form name="edit-guests" @submit.prevent="save">
        <CSFormField>
          <PackageSelectNeedPeople v-model="vm.needPeople"
                                   :possibleValues="vm.possiblePeopleCounts"
                                   @update:modelValue="onNeedPeopleChange($event)">
          </PackageSelectNeedPeople>
        </CSFormField>

        <template v-if="shouldShowUnitsCount()">
          <CSFormField>
            <PackageSelectNeedUnits v-model="vm.needUnits"
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
                                      @click:customer="onEditCustomerAttendingClick($event)">
        </PackageEditCustomesAttending>


        <button-main type="submit">OK</button-main>
      </form>
    </template>
  </tool-dialog>

</template>

<style lang="scss">

</style>
