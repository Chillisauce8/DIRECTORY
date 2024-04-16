<template>
  <div v-if="needToShowPrices()">
    <div v-if="getPackageDiscount()" class="discount h5 fw_semi-bold">Discount = £{{getPackageDiscount()}}</div>
    <div v-if="getPackageMarkUp()" class="mark-up">Markup = {{getPackageMarkUp()}}</div>
    <p class="price">{{ getPackagePrice() }}</p>

    <PriceViewSelector class="package-toggle"
                         :eventPackage="getPackage()"
                         :siteArea="getCurrentSiteArea()"
                         v-if="showPriceViewSelector()"
                         @priceViewValueChange="updatePackageData()">
    </PriceViewSelector>

    <div v-if="packageData.price === null && (canBookPackage || canMakePayment)">
      <p>
        {{ getWarningMessage('packageBuilderPOAPrice') }}
      </p>
    </div>

    <div v-if="showCustomerNotes()" class="package-notes">
      <Markdown :data="packageData.eventCustomerNote"></Markdown>
      <Markdown :data="packageData.customerNote"></Markdown>
    </div>

    <div v-if="showStaffNotes()" class="package-notes">
      <Markdown :data="packageData.eventStaffNote"></Markdown>
      <Markdown :data="packageData.staffNote"></Markdown>
    </div>
  </div>
</template>

<script lang="ts">
import { useHidingPriceService } from "~/services/helpers/pricing/hiding-price-service.factory";
import { useCurrentUser } from "~/services/helpers/user-common/current-user.factory";
import { getPriceMarkUpString } from "~/services/models/pricing";
import { useEventPackageBuilder } from "~/services/helpers/package-builder/package-builder.service.factory";
import { useGlobalElementsTemplateService } from "~/services/helpers/data-templates/global-elements-template.factory";
import { EventPackage } from "~/services/models/package";
import { useEventPermissionsService } from "~/services/helpers/event/event-permissions.service.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import {useProductPriceViewService} from '~/services/helpers/pricing/product-price-view-service.factory';

export default {
  props: [],
  setup() {
    return {
      hidingPriceService: useHidingPriceService(),
      currentUser: useCurrentUser(),
      currentEvent: useCurrentEvent(),
      packageBuilder: useEventPackageBuilder(),
      globalElementsTemplateService: useGlobalElementsTemplateService(),
      eventPermissionsService: useEventPermissionsService(),
      productPriceViewService: useProductPriceViewService(),
    }
  },
  data() {
    return {
      _needToHidePrices: true,
      packageData: undefined,
      eventsSubscriptions: [],
      canBookPackage: false,
      canMakePayment: false,
    }
  },
  async beforeMount() {
    await this.init();
  },
  unmounted() {
    this.eventsSubscriptions.forEach(s => s.unsubscribe());
  },
  methods: {
    async init(): Promise<void> {
      this._needToHidePrices = await this.hidingPriceService.needToHidePrices({ isPackagePrice: true });

      this.updatePackageData();

      this._fetchPermissions();

      this.eventsSubscriptions.push(this.subscribeOnPackageLoaded());
      this.eventsSubscriptions.push(this.subscribeOnPackageUpdated());
    },

    updatePackageData() {
      this.packageData = {...this.packageBuilder.getViewData()};
    },

    subscribeOnPackageUpdated() {
      return this.packageBuilder.onChanged(async (changed) => {
        this.updatePackageData();
      });
    },

    subscribeOnPackageLoaded() {
      return this.packageBuilder.onPackageLoaded(async (value) => {
        if (!value) {
          return;
        }

        this.updatePackageData();
      });
    },

    needToShowPrices() {
      return !this._needToHidePrices;
    },

    showPriceViewSelector(): boolean {
      return !this._needToHidePrices;
    },

    getPackageMarkUp() {
      if (!this.currentUser.isStaffOrHiddenStaff()) {
        return '';
      }

      const productPriceView = this.productPriceViewService.getValueFromStore();

      const markUp = productPriceView?.packageView?.total ? this.packageData.markUpTotal : this.packageData.markUp;

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
      if (this.currentUser.isSupplierContact()) {
        return;
      }

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

    showCustomerNotes(): boolean {
      return !!(this.packageData.customerNote || this.packageData.eventCustomerNote);
    },

    showStaffNotes(): boolean {
      return this.currentUser.isStaffOrHiddenStaff() &&
        !!(this.packageData.staffNote || this.packageData.eventStaffNote);
    },

    getCurrentSiteArea() {
      return this.packageBuilder.getCurrentSiteArea();
    },

    getPackage(): EventPackage {
      return this.currentEvent.has() && this.packageBuilder.getPackage();
    }
  }
};
</script>

<style>

</style>
