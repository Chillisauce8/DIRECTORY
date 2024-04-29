<template>
  <div class="main-top-nav Row Evenly">
      <div class="Row Y-Center" :class="[isSupplierMode() ? 'None' : '']">
        <NavIcon
          title="Locations"
          svg="map-pin"
          @click.native="showLocationsDialog"
        />
        <NavIcon
          class="activities-nav-button"
          title="Activities"
          svg="activity"
          :link="{path: `/${getCurrentSection()}/activities`, query: getCleanQueryParams()}"
        />
      </div>

      <div class="Column Center">
        <div class="Y-Center">
          <nuxt-link aria-label="home" to="/">
            <TheLogo :width="260" class="show-600" />
            <TheMark :width="45" class="hide-600" />
          </nuxt-link>
        </div>
      </div>

      <div class="Row Y-Center">
        <NavIcon
          v-show="!dataState?.user?.isSignedIn"
          title="Login"
          svg="person"
          @click.native="showLoginDialog"
        />
        <client-only>
          <template v-if="dataState.user?.isStaff">
            <NavIcon
              :title="dataState.user.name"
              svg="headphone-user"
              @click.native="showUserDialog"
            />
          </template>
          <template v-if="dataState.user?.isSignedIn && !dataState.user?.isStaff">
            <NavIcon
              :title="dataState.user.name"
              svg="person"
              @click.native="showUserDialog"
            />
          </template>
          <template v-if="dataState.currentCustomerEventsCount && !dataState.user?.isStaff">
            <NavIcon
              title="My Events"
              :alert="dataState.currentCustomerEventsCount"
              :svg="currentSection.getIcon()"
              @click.native="showEventListDialog"
            />
          </template>
        </client-only>
        <NavIcon
          v-show="!dataState.currentCustomerEventsCount && !dataState.user?.isStaff"
          title="Contact"
          svg="phone"
          @click.native="showContactDialog"
        />
      </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, onUnmounted, reactive } from "vue";
import { useLocationsDialogShowService } from "~/service/dialog/locations-dialog-show.service";
import { useSignInDialogShowService } from "~/service/dialog/auth/sign-in-dialog-show.service";
import { useCurrentUser } from "~/service/helpers/user-common/current-user.factory";
import { useCurrentCustomer } from "~/service/helpers/user-common/current-customer-service.factory";
import { useCurrentUserStore } from "~/store/currentUser";
import { useCurrentCustomerIdStore } from "~/store/currentCustomerId";
import { useIsStaffToggledStore } from "~/store/isStaffToggled";
import { useSectionStore } from "~/store/section";
import { useCurrentSupplier } from "~/service/helpers/supplier-common/current-supplier.factory";
import { useUserAccountDialogShowService } from "~/service/dialog/user-account-dialog-show.service";
import { useContactDialogShowService } from "~/service/dialog/contact-dialog-show.service";
import { useCurrentSection } from "~/service/helpers/current-section.factory";
import { useCustomerEventsStore } from "~/store/customerEvents";
import { useEventListDialogShowService } from "~/service/dialog/event-list-dialog-show.service";
import { usePackageSaver } from "~/service/helpers/package-builder/package-saver.service.factory";
import { useSavePackageChangesHelperService } from "~/service/helpers/package-builder/save-package-changes-helper.service.factory";
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { useRoutingHelper } from '~/service/helpers/routing-helper.fabric';

interface NavBarUserData {
  isSignedIn: boolean;
  isStaff?: boolean;
  name?: string;
}

interface NavBarDataState {
  user: NavBarUserData;
  currentCustomerEventsCount?: number;
}


const locationDialogService = useLocationsDialogShowService();
const signInDialogShowService = useSignInDialogShowService();
const userAccountDialogShowService = useUserAccountDialogShowService();
const currentUser = useCurrentUser();
const currentCustomer = useCurrentCustomer();
const currentUserStore = useCurrentUserStore();
const currentCustomerIdStore = useCurrentCustomerIdStore();
const isStaffToggledStore = useIsStaffToggledStore();
const sectionStore = useSectionStore();
const currentSupplier = useCurrentSupplier();
const contactDialogShowService = useContactDialogShowService();
const currentSection = useCurrentSection();
const customerEventsStore = useCustomerEventsStore();
const eventListDialogShowService = useEventListDialogShowService();
const packageSaver = usePackageSaver();
const savePackageChangesHelperService = useSavePackageChangesHelperService();
const currentEvent = useCurrentEvent();
const router = useRouter();
const routingHelper = useRoutingHelper();

const dataState = reactive<NavBarDataState>({
  user: getUserData(),
  currentCustomerEventsCount: getCustomerEventCount(),
});

const storeSubscriptionList = [];

const currentUserStoreActionSubscription = currentUserStore.$onAction(
  ({ name, after }) => {
    if (!["set", "reset"].includes(name)) {
      return;
    }

    after(() => {
      dataState.user = getUserData();
      dataState.currentCustomerEventsCount = getCustomerEventCount();
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
storeSubscriptionList.push(currentCustomerIdStoreActionSubscription);
storeSubscriptionList.push(customerEventsStoreSubscription);


onUnmounted(() => {
  storeSubscriptionList.forEach((s) => s());
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

function getCurrentSection(): string {
  let section = sectionStore?.section;

  if (!section || section === "any") {
    section = "stag";
  }

  return section;
}

async function showLoginDialog(): Promise<void> {
  await signInDialogShowService.show({ closeOnNavigation: false });
}

async function showUserDialog(): Promise<void> {
  await userAccountDialogShowService.show({
    data: {
      forStaff: currentUser.isHiddenStaff(),
    },
  });
}

async function showContactDialog(): Promise<void> {
  await contactDialogShowService.show({});
}

async function showLocationsDialog(): Promise<void> {
  await locationDialogService.show({
    data: {
      section: getCurrentSection(),
    }
  });
}

async function showEventListDialog(): Promise<void> {
  await eventListDialogShowService.show({});
}

function isSupplierMode(): boolean {
  return unref(router.currentRoute).path.startsWith('/supplier/') || !!currentSupplier.has();
}

function getCustomerEventCount(): number {
  if (!currentCustomer?.has()) {
    return 0;
  }

  return customerEventsStore.events.length;
}

function getCleanQueryParams() {
  const query = unref(router.currentRoute).query;

  if (query['eventId']) {
    return {};
  }

  return routingHelper.getCurrentCleanedQueryParams(true, false);
}

</script>

<style lang="scss">
.main-top-nav{
  width: 100%;

}
/*
@import "@vueform/toggle/themes/default.css";

.toggle {
  --toggle-width: 2rem;
  --toggle-height: 0.75rem;

  &-container {
    &:focus {
      box-shadow: none !important;
    }
  }
}

.the-nav-bar {
  width: 100%;
  top: 0;
  z-index: 1;
  position: fixed;
  height: 64px;
  @include frosted-glass();
  @include shadow-soft();
}

*/

// Global this style so it can be used in bottom nav
</style>
