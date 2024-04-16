<template>
  <div class="staff-nav-bar" v-if="dataState.user?.isSignedIn" >
    <NavIcon
        v-if="!isSupplierMode() && dataState.currentCustomer.isSelected && dataState.currentCustomer.needShowSelectButton"
        :title="currentCustomer.getName()"
        svg="person"
        @click.native="showCustomerDialog"
    />
    <NavIcon
        v-if="dataState.currentCustomerEventsCount && dataState.currentCustomer.needShowSelectButton"
        title="Events"
        :alert="dataState.currentCustomerEventsCount"
        :svg="currentSection.getIcon()"
        @click.native="showEventListDialog"
    />
    <NavIcon
        v-if="!isSupplierMode() && dataState.currentCustomer.needShowSelectButton && dataState.currentCustomer.isSelected && currentCustomer.getPhone()"
        :phone="currentCustomer.getPhone()"
        svg="phone"
    />
    <NavIcon v-if="dataState.currentCustomer.needShowSelectButton && !isSupplierMode()"
             :title="'Swap Customer'"
             svg="reload"
             @click.native="showSelectCustomerDialog"
    />
    <div class="toggle-wrapper" v-if="dataState.staffToggle.needToShow && !isSupplierMode()">
      <Toggle class="customer-view-toggle" 
              v-model="dataState.staffToggle.value"
              @update:modelValue="handleStaffToggleValueChange">
      </Toggle>
      <div>Customer View</div>
    </div>
    <div class="toggle-wrapper" v-if="isSupplierMode() && dataState.staffToSupplierToggle.needToShow">
      <Toggle class="supplier-view-toggle"
              v-model="dataState.staffToSupplierToggle.value"
              @update:modelValue="handleStaffToSupplierToggleValueChange">
      </Toggle>
      <div>Supplier View</div>
    </div>

    <EventHistoryModeSelector v-if="!isSupplierMode()"></EventHistoryModeSelector>
  </div>
</template>

<script setup lang="ts">

import { onUnmounted, reactive } from "vue";
import { useCurrentSupplier } from "~/services/helpers/supplier-common/current-supplier.factory";
import { useToggleStaffService } from "~/services/helpers/user-common/toggle-staff.factory";
import { useToggleStaffToSupplierService } from "~/services/helpers/user-common/toggle-staff-to-supplier.factory";
import { useSelectCustomerDialogShowService } from "~/services/dialog/select-customer-dialog-show.service";
import { useIsStaffToggledStore } from "~/store/isStaffToggled";
import { useCurrentUserStore } from "~/store/currentUser";
import { useCurrentUser } from "~/services/helpers/user-common/current-user.factory";
import { useCurrentCustomer } from "~/services/helpers/user-common/current-customer-service.factory";
import Toggle from "@vueform/toggle";
import { useCustomerEventsStore } from "~/store/customerEvents";
import { useCurrentCustomerIdStore } from "~/store/currentCustomerId";
import { useEventListDialogShowService } from "~/services/dialog/event-list-dialog-show.service";
import { useCurrentSection } from "~/services/helpers/current-section.factory";
import { useUserAccountDialogShowService } from "~/services/dialog/user-account-dialog-show.service";


interface NavBarUserData {
  isSignedIn: boolean;
  isStaff?: boolean;
  name?: string;
}

interface NavBarStaffToggleData {
  needToShow: boolean;
  value: boolean;
}

interface StaffNavBarDataState {
  user: NavBarUserData;
  currentCustomer: NavBarCurrentCustomerData;
  staffToggle: NavBarStaffToggleData;
  staffToSupplierToggle: NavBarStaffToggleData;
  currentCustomerEventsCount?: number;
}

interface NavBarCurrentCustomerData {
  needShowSelectButton: boolean;
  isSelected: boolean;
  selectButtonTitle?: string;
}


const router = useRouter();
const currentSupplier = useCurrentSupplier();
const toggleStaffService = useToggleStaffService();
const toggleStaffToSupplierService = useToggleStaffToSupplierService();
const selectCustomerDialogShowService = useSelectCustomerDialogShowService();
const isStaffToggledStore = useIsStaffToggledStore();
const currentUserStore = useCurrentUserStore();
const currentUser = useCurrentUser();
const currentCustomer = useCurrentCustomer();
const currentSection = useCurrentSection();
const customerEventsStore = useCustomerEventsStore();
const eventListDialogShowService = useEventListDialogShowService();
const currentCustomerIdStore = useCurrentCustomerIdStore();
const userAccountDialogShowService = useUserAccountDialogShowService();


const dataState = reactive<StaffNavBarDataState>({
  user: getUserData(),
  currentCustomer: getCurrentCustomerData(),
  staffToggle: getStaffToggleData(),
  staffToSupplierToggle: {needToShow: false, value: isStaffToggledStore.isToggled},
  currentCustomerEventsCount: getCustomerEventCount(),
});


function getUserData(): NavBarUserData {
  const isSignedIn = !!currentUser.getId();

  if (!isSignedIn) {
    return { isSignedIn };
  }

  return {
    isSignedIn,
    name: currentUser.isHiddenStaff()
        ? currentUser.getHiddenStaffFullName()
        : currentUser.getFullName(),
    isStaff: currentUser.isStaffOrHiddenStaff(),
  };
}


function getCurrentCustomerData(): NavBarCurrentCustomerData {
  const isStaffUser = currentUser.isStaffOrHiddenStaff();
  const isSelected = currentCustomer.has();

  const needShowSelectButton = isStaffUser;

  return {
    needShowSelectButton,
    isSelected,
    selectButtonTitle: currentCustomer.getName() || "New customer",
  };
}

function isSupplierMode(): boolean {
  return unref(router.currentRoute).path.startsWith('/supplier/') || !!currentSupplier.has();
}

function handleStaffToggleValueChange(value: boolean): void {
  toggleStaffService.toggleStaff(value);
}

async function handleStaffToSupplierToggleValueChange(value: boolean): Promise<void> {
  await toggleStaffToSupplierService.toggleStaff(value);
}

async function showSelectCustomerDialog(): Promise<void> {
  await selectCustomerDialogShowService.show({});
}


function getStaffToggleData(): NavBarStaffToggleData {
  const needToShow = toggleStaffService.canToggleStaff(unref(router.currentRoute).meta);
  const value = isStaffToggledStore.isToggled;

  return { needToShow, value };
}

async function getStaffToSupplierToggleData(): Promise<NavBarStaffToggleData> {
  const needToShow = await toggleStaffToSupplierService.canToggleStaff(unref(router.currentRoute).meta);
  const value = isStaffToggledStore.isToggled;

  return { needToShow, value };
}

function getCustomerEventCount(): number {
  if (!currentCustomer?.has()) {
    return 0;
  }

  return customerEventsStore.events.length;
}

async function showEventListDialog(): Promise<void> {
  await eventListDialogShowService.show({closeOnNavigation: false});
}

async function showCustomerDialog(): Promise<void> {
  await userAccountDialogShowService.show({
    data: {
      forStaff: false
    },
  });
}


dataState.staffToSupplierToggle = await getStaffToSupplierToggleData();

const storeSubscriptionList = [];

const currentUserStoreActionSubscription = currentUserStore.$onAction(
    ({ name, after }) => {
      if (!["set", "reset"].includes(name)) {
        return;
      }

      after(async () => {
        dataState.user = getUserData();
        dataState.currentCustomer = getCurrentCustomerData();
        dataState.staffToggle = getStaffToggleData();
        dataState.staffToSupplierToggle = await getStaffToSupplierToggleData();
        dataState.currentCustomerEventsCount = getCustomerEventCount();
      });
    }
);

const isStaffToggledStoreStoreActionSubscription =
    isStaffToggledStore.$onAction(({ name, after }) => {
      if (!["toggleFromStaff", "toggleToStaff"].includes(name)) {
        return;
      }

      after(async () => {
        dataState.staffToggle = getStaffToggleData();
        dataState.staffToSupplierToggle = await getStaffToSupplierToggleData();
      });
    }
);


const currentCustomerIdStoreActionSubscription =
    currentCustomerIdStore.$onAction(({ name, after }) => {
          if (!["set", "reset"].includes(name)) {
            return;
          }

          after(() => {
            dataState.currentCustomerEventsCount = getCustomerEventCount();
          });
        }
    );

const customerEventsStoreSubscription = customerEventsStore.$onAction(({ after }) => {
  after(() => (dataState.currentCustomerEventsCount = getCustomerEventCount()));
});



storeSubscriptionList.push(currentUserStoreActionSubscription);
storeSubscriptionList.push(isStaffToggledStoreStoreActionSubscription);
storeSubscriptionList.push(currentCustomerIdStoreActionSubscription);
storeSubscriptionList.push(customerEventsStoreSubscription);

onUnmounted(() => {
  storeSubscriptionList.forEach((s) => s());
});

</script>

<style lang="scss">
.staff-nav-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  font-size: 10px;
  text-transform: uppercase;
  @include mobile {
    display: none;
  }
  .toggle-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .customer-view-toggle, .supplier-view-toggle {
      padding: 3px;
    }
  }
  

  //display:none;
}
</style>
