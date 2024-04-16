
  <template v-if="packageData">
    <button-main class="book-button"
                 @click.native="bookPackage()"
                 v-if="needShowBookPackageButton"
                 :disabled="packageData.price === null"
                 v-show="!packageSaver.getSavePackageInProgress()">
      {{ bookPackageLabel }}
    </button-main>

    <button-main class="payment-button"
                 v-if="needShowMakePaymentButton"
                 :disabled="packageData.price === null"
                 v-show="!packageSaver.getSavePackageInProgress()"
                 @click.native="makePayment()">
      {{ makePaymentLabel }}
    </button-main>
  </template>


<script lang="ts">
import { useCurrentUser } from "~/services/helpers/user-common/current-user.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import { useEventPackageBuilder } from "~/services/helpers/package-builder/package-builder.service.factory";
import { useGlobalElementsTemplateService } from "~/services/helpers/data-templates/global-elements-template.factory";
import { useEventPermissionsService } from "~/services/helpers/event/event-permissions.service.factory";
import { getPriceMarkUpString } from "~/services/models/pricing";
import { EventPackage } from "~/services/models/package";
import { usePackageSaver } from "~/services/helpers/package-builder/package-saver.service.factory";
import { useCurrentCustomer } from "~/services/helpers/user-common/current-customer-service.factory";
import { usePackageBookingNotifyService } from "~/services/helpers/package/package-booking-notify.service.factory";
import { usePaymentDialogShowService } from "~/services/dialog/payment/payment-dialog-show.service";
import { useDataTemplateFabricService } from "~/services/helpers/data-templates/data-template-fabric.factory";
import { useEventBookedHistoryService } from '~/services/helpers/event/event-booked-history.service.factory';


export default {
  props: [],
  setup() {
    return {
      currentUser: useCurrentUser(),
      currentEvent: useCurrentEvent(),
      currentCustomer: useCurrentCustomer(),
      packageBuilder: useEventPackageBuilder(),
      globalElementsTemplateService: useGlobalElementsTemplateService(),
      dataTemplateFabric: useDataTemplateFabricService(),
      eventPermissionsService: useEventPermissionsService(),
      packageSaver: usePackageSaver(),
      packageBookingNotifyService: usePackageBookingNotifyService(),
      paymentDialog: usePaymentDialogShowService(),
      eventBookedHistoryService: useEventBookedHistoryService(),
    }
  },
  data() {
    return {
      _needToHidePrices: true,
      packageData: undefined,
      eventsSubscriptions: [],
      canBookPackage: false,
      canMakePayment: false,
      bookPackageLabel: null,
      makePaymentLabel: null,
      needShowBookPackageButton: this.showBookPackageButton(),
      needShowMakePaymentButton: this.showMakePaymentButton(),
    }
  },
  beforeMount() {
    this.init();
  },
  unmounted() {
    this.eventsSubscriptions.forEach(s => s.unsubscribe());
  },
  methods: {
    init() {
      this.updatePackageData();

      this._fetchPermissions();
      this._getDataFromTemplate();

      this.eventsSubscriptions.push(this.subscribeOnPackageLoaded());
      this.eventsSubscriptions.push(this.subscribeOnPackageUpdated());
      this.eventsSubscriptions.push(this.subscribeOnEventLoaded());
      this.eventsSubscriptions.push(this.subscribeOnPackageChangedUpdated());
    },

    showBookPackageButton() {
      return this.canBookPackage && this.areCurrentChangesSaved() &&
          !this.eventBookedHistoryService.isHistoryBookedMode();
    },

    showMakePaymentButton() {
      return this.makePaymentAllowed() && this.areCurrentChangesSaved() &&
          !this.eventBookedHistoryService.isHistoryBookedMode();
    },

    updatePackageData() {
      this.packageData = {...this.packageBuilder.getViewData()};
    },

    updateButtonsVisibility() {
      this.needShowBookPackageButton = this.showBookPackageButton();
      this.needShowMakePaymentButton = this.showMakePaymentButton();
    },

    subscribeOnPackageUpdated() {
      return this.packageBuilder.onChanged(changed => {
        if (changed) {
          this._fetchPermissions();
          this._getDataFromTemplate();
          this.updatePackageData();
        }

        this.updateButtonsVisibility();
      });
    },


    subscribeOnPackageChangedUpdated() {
      return this.packageSaver.currentPackageChangedUpdated((value) => {
        this.updateButtonsVisibility();
      });
    },

    subscribeOnEventLoaded() {
      return this.currentEvent.afterCurrentEventLoaded(() => {
        this._fetchPermissions();
        this._getDataFromTemplate();
        this.updatePackageData();
        this.updateButtonsVisibility();
      });
    },

    subscribeOnPackageLoaded() {
      return this.packageBuilder.onPackageLoaded(async (value) => {
        if (!value) {
          return;
        }

        this._fetchPermissions();
        this._getDataFromTemplate();
        this.updatePackageData();
        this.updateButtonsVisibility();
      });
    },

    showPriceViewSelector(): boolean {
      return !this._needToHidePrices;
    },

    getPackageMarkUp() {
      if (!this.currentUser.isStaffOrHiddenStaff()) {
        return '';
      }

      const markUp = this.packageData.markUp;

      if (!markUp) {
        return '';
      }

      return getPriceMarkUpString(markUp);
    },

    getPackagePrice(): string {
      if (this.packageData.price === null) {
        if (this._needToHidePrices) {
          return '';
        }

        return 'POA';
      }

      if (this._needToHidePrices) {
        return this.hidingPriceService.needToShowSymbolsWithABTest() ?
          this.hidingPriceService.getHiddenPrice(<number>this.packageData.price) : '';
      }

      return this.packageData.currency + Math.round(
      <number>this.packageData.price - this.packageData.discount);
    },

    getPackageDiscount() {
      if (!this.packageData.discount || this._needToHidePrices || this.packageData.discount < 0) {
      return;
    }

      return this.packageData.discount;
    },

    getWarningMessage(name: string) {
      return this.globalElementsTemplateService.getMessageFromDictionaryVariables(name);
    },

    _fetchPermissions() {
      this.canBookPackage = this.eventPermissionsService.hasPermission('packagePageFunctions.bookPackage', {});
      this.canMakePayment = this.eventPermissionsService.hasPermission('packagePageFunctions.makePayment', {});
    },

    _getDataFromTemplate() {
      const dataTemplate = this.dataTemplateFabric.get({name: 'event', notUpdateDefaultHeaderTemplate: true});
      this.bookPackageLabel = dataTemplate.getValue('packagePageFunctions.bookPackage.label');
      this.makePaymentLabel = dataTemplate.getValue('packagePageFunctions.makePayment.label');
    },

    getCurrentSiteArea() {
      return this.packageBuilder.getCurrentSiteArea();
    },

    getPackage(): EventPackage {
      return this.currentEvent.has() && this.packageBuilder.getPackage();
    },

    areCurrentChangesSaved(): boolean {
      const savePackageInProgress = this.packageSaver.getSavePackageInProgress();
      const isPackageChanged = this.packageSaver.isPackageChanged();
      return !savePackageInProgress && !isPackageChanged;
    },

    makePaymentAllowed(): boolean {
      if (!this.canMakePayment) {
        return false;
      }

      if (!this.areCurrentChangesSaved()) {
        return false;
      }

      if (!this.currentEvent.getCustomersToPay().length) {
        return false;
      }

      if (this.currentUser.isVirtual()) {
        return false;
      }

      if (this.currentCustomer.isVirtualCustomerId(this.currentCustomer.getId())) {
        return false;
      }

      return true;
    },

    bookPackage() {
      const event = this.packageBookingNotifyService.notifyBeforePackageBooking();

      if (event.defaultPrevented) {
        const subscription = this.packageBookingNotifyService.onNeedBookPackage()
          .subscribe((event) => {
            subscription.unsubscribe();
            this.packageData.price === null ? null : this.paymentDialog.show({});
          });

        return;
      }

      this.paymentDialog.show({});
    },

    makePayment() {
      this.paymentDialog.show({});
    }
  }
};
</script>

<style scoped>

</style>
