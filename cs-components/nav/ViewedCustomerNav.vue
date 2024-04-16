<template>
  <section v-if="vm.showBar" class="viewed-customer-nav">
    <template v-if="vm.eventDetails">
      <div v-if="vm.eventDetails?.customerSummary?.customer?.name" class="nav-item" >
        <span class="key">Customer</span>
        <span class="value">{{ vm.eventDetails?.customerSummary?.customer?.name}}</span>
      </div>
      <div v-if="vm.eventDetails?.eventSummary?.manager?.name " key="" class="nav-item">
        <span class="key">Manager</span>
        <span class="value">{{ vm.eventDetails?.eventSummary?.manager?.name }}</span>
      </div>
      <div v-if="vm.eventDetails?.eventSummary?.statusStage" class="nav-item">
        <span class="key">Stage</span>
        <span class="value">{{ vm.eventDetails?.eventSummary?.statusStage }}</span>
      </div>
      <div v-if="prepareDateViewFormat(vm.eventDetails?.eventSummary?.depositDueDate)" class="nav-item">
        <span class="key">Deposit Due</span>
        <span class="value">{{ prepareDateViewFormat(vm.eventDetails?.eventSummary?.depositDueDate)}}</span>
      </div>
      <div  v-if="prepareDateViewFormat(vm.eventDetails?.eventSummary?.balanceDueDate) " class="nav-item">
        <span class="key">Balance Due</span>
        <span class="value">{{ prepareDateViewFormat(vm.eventDetails?.eventSummary?.balanceDueDate)}}</span>
      </div>
      <div v-if="vm.eventDetails?.customerSummary?.role" class="nav-item">
        <span class="key">Role</span>
        <span class="value">{{ vm.eventDetails?.customerSummary?.role}}</span>
      </div>
    </template>

    <template v-if="vm.customerDetails">
      <div v-if="vm.customerDetails?.asOrganiser" class="nav-item">
        <span class="key">Events as Organiser</span>
        <span class="value">{{ vm.customerDetails?.asOrganiser}}</span>
      </div>
      <div v-if="vm.customerDetails?.asGuest" class="nav-item">
        <span class="key">Events as Guest</span>
        <span class="value">{{ vm.customerDetails?.asGuest}}</span>
      </div>

      <div v-if="vm.customerDetails?.asOrganiserBooked " class="nav-item">
        <span class="key">Bookings as Organiser</span>
        <span class="value">{{ vm.customerDetails?.asOrganiserBooked }}</span>
      </div>
      <div v-if="vm.customerDetails?.asOrganiserBooked" class="nav-item">
        <span class="key">Bookings as Guest</span>
        <span class="value">{{ vm.customerDetails?.asGuestBooked}}</span>
      </div>
    </template>
  </section>
</template>

<script lang="ts">
import {useCurrentEvent} from '~/services/helpers/event/current-event.service.factory';
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useCurrentUserStore} from '~/store/currentUser';
import {useCurrentCustomer} from '~/services/helpers/user-common/current-customer-service.factory';
import {useDateHelper} from '~/services/helpers/date-helper.factory';


interface ViewedCustomerNavEventDetails {
  customerSummary: any;
  eventSummary: any;
}


interface ViewedCustomerNavCustomerDetails {
  asOrganiser: number;
  asGuest: number;
  asOrganiserBooked: number;
  asGuestBooked: number;
}


interface ViewedCustomerNavVM {
  showBar: boolean;
  eventDetails: ViewedCustomerNavEventDetails;
  customerDetails: ViewedCustomerNavCustomerDetails;
}


export default {
  setup() {
    const currentEvent = useCurrentEvent();
    const currentUser = useCurrentUser();
    const currentUserStore = useCurrentUserStore();
    const currentCustomer = useCurrentCustomer();
    const dateHelper = useDateHelper();

    currentUserStore.$onAction(({name, after}) => {
      after(() => {
        vm.showBar = currentUser.isStaffOrHiddenStaff();

        if (currentUser.isCustomer()) {
          vm.customerDetails = getCustomerDetails();
        } else {
          vm.customerDetails = null;
        }

        vm.eventDetails = getEventDetails();
      });
    });

    currentEvent.afterCurrentEventLoadedAsObservable()
      .subscribe(() => {
        vm.eventDetails = getEventDetails();
      });

    const customerDetails = getCustomerDetails();
    const eventDetails = getEventDetails();

    const vm = reactive<ViewedCustomerNavVM>({
      showBar: currentUser.isStaffOrHiddenStaff(),
      customerDetails,
      eventDetails,
    });


    function getCustomerDetails(): ViewedCustomerNavCustomerDetails {
      const customerNode = currentCustomer.getRawData();

      if (!customerNode) {
        return null;
      }

      return {
        asOrganiser: customerNode?.events?.asOrganiser,
        asGuest: customerNode?.events?.asGuest,
        asOrganiserBooked: customerNode?.events?.asOrganiserBooked,
        asGuestBooked: customerNode?.events?.asGuestBooked,
      };
    }


    function getEventDetails(): ViewedCustomerNavEventDetails {
      const customerId = currentUser.isCustomer() ? currentCustomer.getId() : null;

      if (!customerId) {
        return null;
      }

      const customerSummary = currentEvent.getCustomerSummaryItem(customerId);
      const eventSummary = currentEvent?.getEvent()?.getRawData()?.eventSummary;

      if (!customerSummary && !eventSummary) {
        return null;
      }

      return {
        customerSummary,
        eventSummary,
      };
    }

    function prepareDateViewFormat(dateStr: string): string {
      const date = dateHelper.parseSaveDateFormat(dateStr);

      if (!date) {
        return null;
      }

      return dateHelper.viewDateFormat(date);
    }

    return {vm, prepareDateViewFormat: d => prepareDateViewFormat(d)};
  }
}
</script>

<style lang="scss">
.viewed-customer-nav {
  display:flex;
  flex-direction:row;
  font-size: 14px;
color: white;

  background: black;
  span{
    white-space: nowrap; 
    padding: 5px;
    &.key{
       // font-weight: 700;
        text-transform: uppercase;
        &::after{
          content: ":";
        }
    }

  }
  @include mobile{
    display: none;
  }
}
</style>
