<template>
  <card-wrapper class="customer-card">
    <LazySvgIcon svg="person" />
    <h1>{{ dataState.customerName }}</h1>
    <ul class="information">
      <template v-for="(item, index) in dataState.listItems" :key="index" >
        <li class="Row Between">
          <span v-if="item.value !== undefined">
            {{ item.title }} </span> <span :class="{'pound': ['Price Total', 'Paid Total'].includes(item.title)}">{{ item.value }}</span>

        </li>
      </template>
    </ul>

    <div class="user-card-buttons">
      <button-main
          class="_2nd"
          @click.native="revertAttending()"
          v-if="getCustomerCouldChangeOwnAttending()">
        {{ dataState.customerAttendingButtonText }}
      </button-main>

      <button-main
          class="_2nd"
          @click.native="changeCard()"
          v-if="showChangeCard()">
        Change Card
      </button-main>
    </div>

  </card-wrapper>
</template>

<script>
import {useEventPermissionsService} from "~/service/helpers/event/event-permissions.service.factory";
import {useCurrentUser} from "~/service/helpers/user-common/current-user.factory";
import {useCurrentEvent} from "~/service/helpers/event/current-event.service.factory";
import {useCurrentCustomer} from "~/service/helpers/user-common/current-customer-service.factory";
import {useDateHelper} from "~/service/helpers/date-helper.factory";
import {useEventService} from "~/service/helpers/event/event.service.factory";
import {useEventPackageBuilder} from "~/service/helpers/package-builder/package-builder.service.factory";
import {useCsLodash} from "~/service/cs-lodash.factory";
import {
  usePackageBuilderAlertsService
} from "~/service/helpers/package-builder/package-builder-alerts.service.factory";
import { useCurrentUserStore } from "~/store/currentUser";
import {useChangeCardDialogShowService} from "~/service/dialog/payment/change-card-dialog-show.service";

export default {
  props: ['event', 'dataTemplate'],
  setup() {
    return {
      eventPermissionsService: useEventPermissionsService(),
      currentUser: useCurrentUser(),
      currentUserStore: useCurrentUserStore(),
      currentEvent: useCurrentEvent(),
      currentCustomer: useCurrentCustomer(),
      dateHelper: useDateHelper(),
      eventService: useEventService(),
      packageBuilder: useEventPackageBuilder(),
      csLodash: useCsLodash(),
      packageBuilderAlertsService: usePackageBuilderAlertsService(),
      changeCardDialog: useChangeCardDialogShowService(),
    }
  },
  data() {
    return {
      dataState: {
        customerName: '',
        listItems: [],
        customerAttendingButtonText: this.getCustomerAttendingButtonText(),
      },
      afterCurrentEventLoadedSubscription: null
    }
  },
  watch: {
    event: function (newVal, oldVal) {
      this.init();
    }
  },
  beforeMount() {
    this.init();
    this.subscribeCurrentUserChanged();
  },
  unmounted() {
    if (this.afterCurrentEventLoadedSubscription) {
      this.afterCurrentEventLoadedSubscription.unsubscribe();
    }
  },
  methods: {
    init() {
      this.dataState.customerName = this.currentCustomer.getName();
      this._parseListItems();
      this.subscribeAfterCurrentEventLoaded();
    },

    subscribeCurrentUserChanged() {
      this.currentUserStore.$onAction(({name, after}) => {
        if (!['set'].includes(name)) {
          return;
        }

        after(() => {
          if (this.currentUser.isCustomer()) {
            this.init();
          }
        });
      });
    },

    ensureChangeCardPossibleForCurrentCustomer() {
      if (!this.currentEvent.isOrganiser() && this.currentEvent.getPaymentMethod() === 'organiser') {
        return false;
      }

      return true;
    },

    showChangeCard() {
      const result = this.eventPermissionsService.hasPermission('packagePageFunctions.changeCard', {})
      return result && this.ensureChangeCardPossibleForCurrentCustomer();
    },

    changeCard() {
      this.changeCardDialog.show();
    },

    getCurrentCustomerSummaryItemForCurrentCustomer() {
      const customerId = this.currentCustomer.getId();
      return this.currentEvent.getCustomerSummaryItem(customerId);
    },

    isCustomerAttendedToEvent() {
      const customerSummaryItem = this.getCurrentCustomerSummaryItemForCurrentCustomer();

      if (!customerSummaryItem) {
        return false;
      }

      return customerSummaryItem.attending === 'Yes';
    },

    getCustomerAttendingButtonText() {
      return this.isCustomerAttendedToEvent() ? 'Cancel My Place' : 'Add to Event';
    },

    getCustomerCouldChangeOwnAttending() {
      const customerSummary = this.getCurrentCustomerSummaryItemForCurrentCustomer();

      if (!customerSummary) {
        return false;
      }

      return this.eventPermissionsService.hasPermission('manageGuestFunctions.editOwnAttending', {});
    },

    async revertAttending() {
      const customerSummary = this.getCurrentCustomerSummaryItemForCurrentCustomer();

      if (!customerSummary) {
        return;
      }

      const updateAttendingParams = {
        customerId: customerSummary.customer.id,
        customerIdWhoChanges: this.currentCustomer.getId(),
        attending: customerSummary.attending === 'Yes' ? 'No' : 'Yes'
      };

      const result = await this.packageBuilderAlertsService.showChangePlaceAlert({
        attended: customerSummary.attending === 'Yes',
        type: 'event',
      });

      if (result.cancelled) {
        return;
      }

      await this.eventService.updateAttending(this.event.getId(), updateAttendingParams);

      this.currentEvent.reload();
      this.packageBuilder.clearInitialData();

      await this.currentEvent.afterCurrentEventLoaded(() => {
        this.packageBuilder.loadCurrent();
      });
    },

    subscribeAfterCurrentEventLoaded() {
      this.afterCurrentEventLoadedSubscription = this.currentEvent.afterCurrentEventLoadedAsObservable()
        .subscribe(() => {
          this.dataState.customerAttendingButtonText = this.getCustomerAttendingButtonText();
        });
    },

    _parseListItems() {
      const customerItem = this.event.getCustomerSummary()
        .filter((item) => {
          return item.customer.id === this.currentUser.getId();
        })[0];

      if (!customerItem) {
        this.dataState.listItems = [];
      }

      const listItemsRaw = this.dataTemplate.getRaw('userCard.listItems', true);

      this.dataState.listItems = (listItemsRaw || [])
        .map((item) => {
          let value;

          if (item.value && item.value.indexOf('customerSummary') === 0) {
            value = this.csLodash.get(customerItem, item.value.replace('customerSummary.', ''));
          } else {
            value = this.csLodash.get(this.event.getRawData(), item.value);
          }

          const isDate = item.value && item.value.toLowerCase().endsWith('date');

          if (isDate && value) {
            const date = this.dateHelper.parseSaveDateFormat(value);

            if (date && this.dateHelper.isValidDate(date)) {
              value = this.dateHelper.shortViewDateFormat(date);
            }
          }

          return {
            title: item.text,
            class: value ? item.className : '',
            value: value,
          };
        });
    }
  }
}
</script>

<style lang="scss">
.customer-card{
  width: 300px;
  padding: 10px;
  .user-card-buttons {
    text-align: center;
  }
  .user-card-buttons .button-main {
    margin-bottom: 10px;
  }
}
</style>
