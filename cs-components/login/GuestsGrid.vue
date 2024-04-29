<template>
  <section-wrapper
    class="CB-2"
    title="Group Details"
    :id="id"
    subTitle="Click on a row to expand and see payment history"
  >
    <div
      class="hide-not-attending-wrapper"
      v-if="permissions.hasEditHideNonAttendingPermission"
    >
      <div class="hide-not-attending-toggle">
        <Toggle
          v-model="hideNonAttending"
          :disabled="savePackageInProgress"
          @update:modelValue="onHideNonAttendingChange"
        >
        </Toggle>
        <span class="text">Hide Non-Attending</span>
      </div>
    </div>
    <list-wrapper class="guests-grid slider">
      <div class="grid-scroll">
        <div class="customers">
          <div class="header">Name</div>
          <div class="header">Attending</div>
          <div class="header">{{ getGuestOfHonourTitle() }}</div>
          <div class="header">Phone</div>
          <div class="header">Paid</div>
          <div class="header">Price</div>
          <!--       <div class="header">More</div> -->
          <template
            v-for="(customerSummary) in sortedGuestList"
            :key="customerSummary.customer.id"
          >
            <reveal-item displayContents="true" :icon="false">
              <template v-slot:summary>
                <div class="cell">
                  <GuestListCustomerName :key="customerSummary?.customer?.id"
                    :customerSummary="customerSummary"
                    :guestList="sortedGuestList"
                  >
                  </GuestListCustomerName>
                </div>

                <div class="cell">
                  <GuestAttendingCheckbox
                    :customerId="customerSummary.customer.id"
                    :savePackageInProgress="savePackageInProgress"
                    :hasEditOwnAttendingPermission="
                      permissions.hasEditOwnAttendingPermission
                    "
                    :hasEditGuestAttendingPermission="
                      permissions.hasEditGuestAttendingPermission
                    "
                    :attending="customerSummary.attending"
                    :isGuestOfHonour="customerSummary.guestOfHonour"
                    @change="revertAttending(customerSummary)"
                  >
                  </GuestAttendingCheckbox>
                </div>

                <div class="cell" v-if="getGuestOfHonourTitle()">
                  <input
                    type="checkbox"
                    name="guest-of-honour"
                    :disabled="isEditGuestOfHonourDisabled(customerSummary)"
                    :checked="customerSummary.guestOfHonour"
                    @change="revertGuestOfHonour(customerSummary)"
                    @click.stop=""
                  />
                </div>

                <div class="cell">
                  {{ getPhone(customerSummary) }}
                </div>

                <div class="cell" :class="[showPaid(customerSummary) ? 'Pound' : '']" >
                  {{
                    showPaid(customerSummary) ? getPaid(customerSummary) : ""
                  }}
                </div>
                <div
                  class="cell"
                  :class="[showPrice(customerSummary) ? 'Pound' : '']"
                >
                  {{
                    showPrice(customerSummary) ? getPrice(customerSummary) : ""
                  }}
                </div>
              </template>

              <div class="details">
                <div
                  class="payments"
                  v-if="getTransactions(customerSummary).length"
                >
                  <div class="header">Paid By</div>
                  <div class="header">Paid For</div>
                  <div class="header">Type</div>
                  <div class="header">Date</div>
                  <div class="header">Status</div>
                  <div class="header">Amount</div>

                  <template
                    v-for="(transaction, index) in getTransactions(
                      customerSummary
                    )"
                  >
                    <div class="cell">
                      {{ transaction.paidByCustomer.name }}
                    </div>

                    <div class="cell">
                      {{ transaction.paidForCustomer.name }}
                    </div>

                    <div class="cell">{{ transaction.type }}</div>

                    <div class="cell">{{ transaction.date }}</div>

                    <div class="cell">{{ transaction.status }}</div>
                    <div class="cell Pound">
                      {{ transaction.amount }}
                    </div>
                  </template>
                </div>

                <div class="products" v-if="itineraryListWithGuestAttending">
                  <div class="header">Product</div>
                  <div class="header">Date</div>
                  <div class="header">Attending</div>

                  <template
                    v-for="(itinerary, index) in getItinerariesInfo(
                      customerSummary.customer.id
                    )"
                  >
                    <div class="cell">{{ itinerary.name }}</div>

                    <div class="cell">{{ itinerary.date }}</div>

                    <div class="cell">
                      <GuestAttendingCheckbox
                        :customerId="itinerary.customerId"
                        :savePackageInProgress="savePackageInProgress"
                        :hasEditOwnAttendingPermission="
                          permissions.hasEditOwnAttendingPermission
                        "
                        :hasEditGuestAttendingPermission="
                          permissions.hasEditGuestAttendingPermission
                        "
                        :attending="itinerary.attending"
                        @change="
                          revertItineraryAttending(customerSummary, itinerary)
                        "
                      >
                      </GuestAttendingCheckbox>
                    </div>
                  </template>
                </div>
              </div>
            </reveal-item>
          </template>
        </div>
      </div>
    </list-wrapper>
  </section-wrapper>
</template>

<script>
import { useEventPermissionsService } from "~/service/helpers/event/event-permissions.service.factory";
import { useCurrentUser } from "~/service/helpers/user-common/current-user.factory";
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { useDataTemplateFabricService } from "~/service/helpers/data-templates/data-template-fabric.factory";
import { usePackageSaver } from "~/service/helpers/package-builder/package-saver.service.factory";
import { useEventService } from "~/service/helpers/event/event.service.factory";
import { useCsLodash } from "~/service/cs-lodash.factory";
import { useSelectCustomerDialogShowService } from "~/service/dialog/select-customer-dialog-show.service";
import { useGuestTransactionListService } from "~/service/helpers/event/guest-transaction-list.service.factory";
import { useItineraryWithGuestAttendingListPreparer } from "~/service/helpers/event/itinerary-with-guest-attending-list-preparer.service.factory";
import { useCurrentCustomer } from "~/service/helpers/user-common/current-customer-service.factory";
import { useEventPackageBuilder } from "~/service/helpers/package-builder/package-builder.service.factory";
import Toggle from "@vueform/toggle";

export default {
  props: ["id", "event"],
  components: {
    Toggle,
  },
  setup() {
    return {
      dataTemplateFabric: useDataTemplateFabricService(),
      eventPermissionsService: useEventPermissionsService(),
      currentUser: useCurrentUser(),
      currentCustomer: useCurrentCustomer(),
      currentEvent: useCurrentEvent(),
      eventService: useEventService(),
      packageSaver: usePackageSaver(),
      packageBuilder: useEventPackageBuilder(),
      csLodash: useCsLodash(),
      selectCustomerDialogShowService: useSelectCustomerDialogShowService(),
      guestTransactionListService: useGuestTransactionListService(),
      itineraryWithGuestAttendingListPreparer:
        useItineraryWithGuestAttendingListPreparer(),
    };
  },
  data() {
    return {
      inProgress: true,
      savePackageInProgress: false,
      sortedGuestList: [],
      hideNonAttending: false,
      guestPageTemplate: undefined,
      permissions: {
        hasEditGuestOfHonourPermission: undefined,
        hasEditOwnAttendingPermission: undefined,
        hasEditGuestAttendingPermission: undefined,
        hasEditHideNonAttendingPermission: undefined,
      },
      customersDetails: undefined,
      transactionMap: undefined,
      itineraryListWithGuestAttending: undefined,
      beforeCurrentPackageSavedSubscription: undefined,
      afterCurrentPackageSavedSubscription: undefined,
    };
  },
  watch: {
    event: function (newVal, oldVal) {
      this.initOnNewEvent();
    },
  },
  beforeMount() {
    this.initCurrentPackageSavedListeners();

    this.guestPageTemplate = this.dataTemplateFabric.get({
      name: "guestPage",
      notUpdateDefaultHeaderTemplate: true,
    });

    this.initOnNewEvent();
  },
  unmounted() {
    if (this.beforeCurrentPackageSavedSubscription) {
      this.beforeCurrentPackageSavedSubscription.unsubscribe();
    }

    if (this.afterCurrentPackageSavedSubscription) {
      this.afterCurrentPackageSavedSubscription.unsubscribe();
    }
  },
  methods: {
    initOnNewEvent() {
      this.initPermissions();

      this.prepareSortedGuests();

      this._getCustomersDetails();
      this.initTransactionMap();
      this.initItineraryListWithAttending();
    },

    initCurrentPackageSavedListeners() {
      this.beforeCurrentPackageSavedSubscription =
        this.packageSaver.beforeCurrentPackageSaved((data) => {
          this.savePackageInProgress = true;
        });

      this.afterCurrentPackageSavedSubscription =
        this.packageSaver.afterCurrentPackageSaved(
          (data) => (this.savePackageInProgress = false)
        );
    },

    initPermissions() {
      this.permissions.hasEditGuestOfHonourPermission =
        this.eventPermissionsService.hasPermission(
          "manageGuestFunctions.editGuestOfHonour",
          {}
        );
      this.permissions.hasEditOwnAttendingPermission =
        this.eventPermissionsService.hasPermission(
          "manageGuestFunctions.editOwnAttending",
          {}
        );
      this.permissions.hasEditGuestAttendingPermission =
        this.eventPermissionsService.hasPermission(
          "manageGuestFunctions.editGuestAttending",
          {}
        );
      this.permissions.hasEditHideNonAttendingPermission =
        this.currentUser.isStaffOrHiddenStaff();
    },

    prepareSortedGuests() {
      this.hideNonAttending = this.event.getHideNonAttending();

      const guestList = this.event.getCustomerSummary();

      if (!guestList) {
        this.sortedGuestList = [];
      } else {
        const organiser = this.event.getOrganiser();

        this.sortedGuestList = guestList
          .filter((customerSummary) =>
            this.hideNonAttending ? customerSummary.attending === "Yes" : true
          )
          .sort((customerSummary1, customerSummary2) => {
            const customer1 = customerSummary1.customer;
            const customer2 = customerSummary2.customer;

            if (organiser.id === customer1.id) {
              return -1;
            }

            if (organiser.id === customer2.id) {
              return 1;
            }

            if (
                this.isGuestOfHonour(customerSummary1) &&
                this.isGuestOfHonour(customerSummary2)
            ) {
              return this.compareCustomersByName(
                  customerSummary1,
                  customerSummary2
              );
            }

            if (this.isGuestOfHonour(customerSummary1)) {
              return -1;
            }

            if (this.isGuestOfHonour(customerSummary2)) {
              return 1;
            }

            return this.compareCustomersByName(
              customerSummary1,
              customerSummary2
            );
          });
      }
    },

    compareCustomersByName(customerSummary1, customerSummary2) {
      const name1 = customerSummary1.customer.name.toLowerCase();
      const name2 = customerSummary2.customer.name.toLowerCase();

      if (name1 < name2) {
        return -1;
      }
      if (name1 > name2) {
        return 1;
      }

      return 0;
    },

    getGuestOfHonourTitle() {
      return (
        this.guestPageTemplate.getText("guestOfHonour") || "Guest of Honor"
      );
    },

    isEditGuestOfHonourDisabled(customerSummary) {
      return (
        !this.permissions.hasEditGuestOfHonourPermission ||
        this.savePackageInProgress ||
        customerSummary.attending !== "Yes"
      );
    },

    isGuestOfHonour(customerSummary) {
      return !!customerSummary.guestOfHonour;
    },

    showPaid(customerSummary) {
      if (!customerSummary.money) {
        return false;
      }

      let paidGBP;

      if (this.event.getPaymentMethod() === "organiser") {
        paidGBP = customerSummary.money.totalPaidGBP;
      } else {
        paidGBP = customerSummary.money.paidGBP;
      }

      if (paidGBP === 0) {
        return true;
      }

      return !!paidGBP && this.csLodash.isFinite(paidGBP);
    },

    getPaid(customerSummary) {
      if (this.event.getPaymentMethod() === "organiser") {
        return customerSummary.money.totalPaidGBP;
      }

      return customerSummary.money.paidGBP;
    },

    showPrice(customerSummary) {
      if (!customerSummary.money) {
        return false;
      }

      let priceGBP;

      if (this.event.getPaymentMethod() === "organiser") {
        priceGBP = customerSummary.money.totalPriceGBP;
      } else {
        priceGBP = customerSummary.money.priceGBP;
      }

      if (priceGBP === 0) {
        return true;
      }

      return !!priceGBP && this.csLodash.isFinite(priceGBP);
    },

    getPrice(customerSummary) {
      if (this.event.getPaymentMethod() === "organiser") {
        return customerSummary.money.totalPriceGBP;
      }

      return customerSummary.money.priceGBP;
    },

    getPhone(customerSummary) {
      if (customerSummary.customer.id.indexOf("v_") === 0) {
        return "";
      }

      if (!this.customersDetails) {
        return "";
      }

      const customers = this.customersDetails.filter((item) => {
        return item._doc === customerSummary.customer.id;
      });

      if (!customers.length) {
        return "";
      }

      return customers[0].phone;
    },

    async revertGuestOfHonour(customerSummary) {
      const params = {
        customerId: customerSummary.customer.id,
        guestOfHonour: !customerSummary.guestOfHonour,
      };

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      await this.eventService.updateGuestOfHonour(this.event.getId(), params);

      this.currentEvent.reload();

      const subscription = this.currentEvent.afterCurrentEventLoaded(() => {
        this.savePackageInProgress = false;
        this.packageBuilder.loadCurrent();
        this.packageSaver.notifyAfterCurrentPackageSaved();
        subscription.unsubscribe();
      });
    },

    async revertAttending(customerSummary) {
      if (
        this.isGuestOfHonour(customerSummary) &&
        customerSummary.attending === "Yes"
      ) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      if (!this.currentCustomer.getId()) {
        const dialogResult = await this.selectCustomerDialogShowService.show({
          data: {
            reloadEvents: false,
            goToCustomerHome: false,
          },
        });

        if (dialogResult.cancelled) {
          return;
        }
      }

      if (!this.currentCustomer.getId()) {
        this.savePackageInProgress = false;
        throw Error("Current customer should be selected");
      }

      const params = {
        customerId: customerSummary.customer.id,
        customerIdWhoChanges: this.currentCustomer.getId(),
        attending: customerSummary.attending === "Yes" ? "No" : "Yes",
      };

      await this.eventService.updateAttending(this.event.getId(), params);

      this.currentEvent.reload();

      this.packageBuilder.clearInitialData();

      const subscription = this.currentEvent.afterCurrentEventLoaded(() => {
        this.savePackageInProgress = false;
        this.packageBuilder.loadCurrent();
        this.packageSaver.notifyAfterCurrentPackageSaved();
        subscription.unsubscribe();
      });
    },

    async revertItineraryAttending(customerSummary, itinerary) {
      const params = {
        packageId: this.currentEvent.getBookedPackage().getId(),
        productListItemId: itinerary.productListItemId,
        itineraryId: itinerary.id,
        customerId: customerSummary.customer.id,
        customerIdWhoChanges: this.currentCustomer.getId(),
        attending: itinerary.attending === "Yes" ? "No" : "Yes",
      };

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      await this.eventService.updateItineraryAttending(
        this.event.getId(),
        params
      );

      this.currentEvent.reload();

      this.packageBuilder.clearInitialData();

      const subscription = this.currentEvent.afterCurrentEventLoaded(() => {
        this.savePackageInProgress = false;
        this.packageBuilder.loadCurrent();
        this.packageSaver.notifyAfterCurrentPackageSaved();
        subscription.unsubscribe();
      });
    },

    async onHideNonAttendingChange(value) {
      const eventId = this.event.getId();

      const params = {
        hideNonAttending: this.hideNonAttending,
      };

      this.savePackageInProgress = true;

      await this.eventService.updateHideNonAttending(eventId, params);

      await this.currentEvent.reload();

      this.savePackageInProgress = false;
    },

    async _getCustomersDetails() {
      this.inProgress = true;

      this.customersDetails = await this.eventService.getCustomersDetails(
        this.event.getId()
      );
      this.inProgress = false;
    },

    initTransactionMap() {
      this.transactionMap = this.guestTransactionListService.createMap(
        this.event
      );
    },

    getTransactions(customerSummary) {
      const customerId = customerSummary?.customer?.id;

      if (!customerId || !this.transactionMap) {
        return [];
      }

      return this.transactionMap.get(customerId) || [];
    },

    initItineraryListWithAttending() {
      if (!this.currentEvent.isBooked()) {
        return;
      }

      const rawPackageProductList = this.currentEvent.getRawProductsList();

      if (!rawPackageProductList || !rawPackageProductList.length) {
        return;
      }

      this.itineraryListWithGuestAttending =
        this.itineraryWithGuestAttendingListPreparer.prepare(
          rawPackageProductList
        );
    },

    getItinerariesInfo(customerId) {
      return this.itineraryListWithGuestAttending.map((i) => ({
        customerId: customerId,
        productListItemId: i.productListItemId,
        ...i.itinerary,
        attending: i.attendingMap.get(customerId),
      }));
    },
  },
};
</script>

<style lang="scss">
.hide-not-attending-wrapper {
  margin: 10px;
  display: flex;
  justify-content: center;
  & .hide-not-attending-toggle {
    & .text {
      color: $CB-2;
      margin-left: 10px;
      font-size: 14px;
      text-transform: uppercase;
    }
  }
}
.guests-grid {
  @include mobile() {
    overflow: scroll;
  }
  font-size: 16px;
  margin: 0 auto;
  & .grid-scroll {
    width: fit-content;
    background-color: $CB;
  }
  & .cell {
    padding: 5px;
  }
  /* Doesn't work - works on .grid-scroll ???
  .summary {
    background-color: red;
    &:hover {
      background-color: red;
    }
  }
  */
  & .header {
    background-color: $CB-1;
    font-weight: bold;
    text-transform: uppercase;
    padding: 5px;
  }
  & .customers {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    margin: 0 auto;
    width: max-content;

    & .name {
      color: $C2;
      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
    & .role {
      font-size: 12px;
    }
    & .reveal {
      grid-column: 1 / span 6;
      & .payments {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
      }
      & .products {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}
</style>
