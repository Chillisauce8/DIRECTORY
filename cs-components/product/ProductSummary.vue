<template>
  <div class="product-summary">
    <h1 v-html="getProductOrVenueOnTopTitle()"></h1>

    <div v-if="reviewScore > 0" class="reviews group">
      <StarRating :stars="reviewScore" />
      <div class="review-count">{{reviewScore}} out of 5 from {{reviewCount}} Reviews</div>
    </div>

    <div v-if="shouldShowAdditionalProductTitle()" class="padding_0_0_-5">
      <h3 itemprop="name"> {{ getProductTitle() }}</h3>
    </div>

    <dl class="includes" v-if="includedData?.length">
      <dt>Includes</dt>
      <template v-for="included in includedData">
        <dd>{{included}}</dd>
      </template>
    </dl>

    <dl v-if="thereAreOptionProducts && product.getSelectedOptions().length" class="options">
      <dt>Options Selected</dt>
      <template v-for="option in product.getSelectedOptions()">
        <dd>{{option.product.getName()}}</dd>
      </template>
    </dl>

    <div v-if="thereAreOptionProducts" class="view-all-anchor">
      <a href="#options">View all options</a>
    </div>

    <dl v-if="thereAreAddOnProducts" class="addons">
      <dt>Add Ons</dt>
      <template v-for="addon in product.getSelectedAddons()">
        <dd>{{addon.product.getName()}}</dd>
      </template>
    </dl>

    <div v-if="thereAreAddOnProducts" class="view-all-anchor">
      <a href="#addOns">+ View all addons</a>
    </div>

    <client-only>
      <div class="price-block" ref="priceBlock">
        <div class="pricing" v-if="!needToHidePrices">
          <span class="price">{{priceValue}}</span>
          <div v-if="priceValue" class="price-per">
            <PriceViewSelector class=""
                           :product="product"
                           :eventPackage="getPackage()"
                           :siteArea="getCurrentSiteArea()"
                           :style="{opacity: showPriceViewSelector() ? 1 : 0}"
                           @priceViewValueChange="onPriceViewChange">
            </PriceViewSelector>


        (based on {{packageSettings.peopleCount}} people)</div>
        </div>
        <div v-if="!needToHidePrices && getProductPriceMarkUp()">
          Markup = {{getProductPriceMarkUp()}}
        </div>

      </div>
    </client-only>
  </div>
</template>

<script lang="ts">


import {useProductIncludedDataPreparer} from "~/service/helpers/product/product-included-data-preparer.factory";
import {usePackageCommonSettingsStore} from '~/store/packageCommonSettings';
import {useSectionStore} from '~/store/section';
import { calculatePriceMarkUp, getPriceMarkUpString } from "~/service/models/pricing";
import { useProductPagePriceHelperService } from "~/service/helpers/pricing/product-page-price-helper-service.factory";
import { useHidingPriceService } from "~/service/helpers/pricing/hiding-price-service.factory";
import type { IHidePricesParams } from "~/service/helpers/pricing/hiding-price.service";
import type { IFiltrationContext } from "~/service/helpers/filter-helper.service";
import { useCurrentUser } from "~/service/helpers/user-common/current-user.factory";
import { useEventPackageBuilder } from "~/service/helpers/package-builder/package-builder.service.factory";
import { EventPackage } from "~/service/models/package";
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { useProductPriceViewService } from "~/service/helpers/pricing/product-price-view-service.factory";
import { getWindowSafe } from '~/service/helpers/browser/browser.helpers';
import { SITE_AREAS } from '~/service/siteAreas.const';
import { useProductPageHelperService } from '~/service/helpers/product/product-page-helper.service.factory';
import {useCurrentSiteArea} from '~/service/helpers/current-site-area.factory';

export default {
  props: ['product', 'reviewScore', 'reviewCount', 'priceValue', 'packageSettings',
    'productStage', 'section'],
  setup() {
    return {
      productIncludedDataPreparer: useProductIncludedDataPreparer(),
      packageCommonSettingsStore: usePackageCommonSettingsStore(),
      sectionStore: useSectionStore(),
      productPagePriceHelperService: useProductPagePriceHelperService(),
      hidingPriceService: useHidingPriceService(),
      currentUser: useCurrentUser(),
      packageBuilder: useEventPackageBuilder(),
      currentEvent: useCurrentEvent(),
      productPriceViewService: useProductPriceViewService(),
      productPageHelperService: useProductPageHelperService(),
      currentSiteArea: useCurrentSiteArea(),
    }
  },
  data() {
    return {
      needToHidePrices: true,
      priceViewValue: undefined,
      recalculateHidingPricesSubscription: undefined,
    };
  },
  computed: {
    thereAreOptionProducts() {
      return this.product.getOptions()?.length > 0;
    },
    thereAreAddOnProducts() {
      return this.productPageHelperService.needShowPageAddons(
          this.product, this.section, this.productStage);
    },
    includedData() {
      return this.productIncludedDataPreparer.prepare(this.product);
    }
  },
  async created() {
    await this.init();
  },
  beforeMount() {
    this.subscribeOnRecalculateHidingPrices();
  },
  unmounted() {
    this.unsubscribeAll();
  },
  mounted() {
    // this.ssrMode = false;
    // const priceBlock = this.$refs.priceBlock as Element;
    // priceBlock.classList.remove('None');
  },
  methods: {
    async init() {
      await this.checkHidePricesPermission();

      this.priceViewValue = this.productPriceViewService.getPriceViewValue({
        siteArea: this.getCurrentSiteArea(),
        product: this.product,
        eventPackage: this.getPackage(),
      });
    },

    async checkHidePricesPermission() {
      const additionalContext: IFiltrationContext = {
        productType: this.product ? this.product.getType() : null,
      };

      if (this.productStage) {
        additionalContext.productStage = this.productStage;
      }

      const params: IHidePricesParams = {
        isProductPrice: true,
        additionalContext: additionalContext,
      };

      this.needToHidePrices = await this.hidingPriceService.needToHidePrices(params);
    },

    getProductPriceMarkUp() {
      if (!this.currentUser.isStaffOrHiddenStaff()) {
        return '';
      }

      if (this.currentSiteArea.get() === SITE_AREAS.supplier) {
        return '';
      }

      if (this.needToHidePrices) {
        return '';
      }

      const pricePair = this.productPagePriceHelperService.getPrice({
        getPricePair: true,
        skipVatExcluding: true
      }) as {spp; agency};

      if (!pricePair) {
        return '';
      }

      const {spp, agency} = pricePair;
      const margin = calculatePriceMarkUp(spp, agency, this.product.getPriceCalculator());

      return getPriceMarkUpString(margin);
    },

    getCurrentSiteArea() {
      return this.packageBuilder.getCurrentSiteArea();
    },

    getPackage(): EventPackage {
      if (!this.currentEvent.has()) {
        return null;
      }

      return this.packageBuilder.getPackage();
    },

    showPriceViewSelector(): boolean {
      const window = getWindowSafe();

      if (!window) {
        return false;
      }

      return !this.needToHidePrices;
    },

    onPriceViewChange(value) {
      this.priceViewValue = value;
      this.$emit('priceViewValueChange', this.priceViewValue);
    },

    subscribeOnRecalculateHidingPrices() {
      this.recalculateHidingPricesSubscription =
          this.hidingPriceService.onRecalculateHidingPrices(this.checkHidePricesPermission.bind(this));
    },

    shouldShowAdditionalProductTitle(): boolean {
      return this.product.isVenueOnTop() && this.product.hasSelectedVenue();
    },

    getProductOrVenueOnTopTitle(): string {
      let name: string;
      let prefix: string = '';

      const isVenueOnTop = this.product.isVenueOnTop();

      let venueOnTop;

      if (isVenueOnTop && this.product.hasSelectedVenue()) {
        venueOnTop = this.product.getVenueOnTop();
      }

      if (venueOnTop) {
        const venue = this.product.getVenueOnTop();
        if (venue) {
          name = venue.getName();
        }
      } else {
        name = this.getProductTitle();
      }

      if (this.product.isAccommodation()) {
        const selectedVenue = this.product.getSelectedVenue();
        const venue = selectedVenue || this.product.calculateDefaultVenue({});

        const suitableVenue = venue.getTopVenue() ? venue.getMainVenue() : null;

        prefix = suitableVenue && suitableVenue.getStarRating() ?
            `${suitableVenue.getStarRating()}<span class="star-super">★</span> ` : '';
      }

      return `${prefix}${name}`;
    },

    getProductTitle(): string {
      const siteArea = this.getCurrentSiteArea();

      if (siteArea === SITE_AREAS.supplier) {
        return this.product.getNameForSupplier();
      }

      return this.product.getName(true);
    },

    unsubscribeAll() {
      this.recalculateHidingPricesSubscription.unsubscribe();
    },
  },
}
</script>

<style lang="scss">
.product-summary {
  //position: sticky;
  top: 84px;
  & > h1 {
    @include font-size(5);
    @include font-style('header');
  }
  dt {
    font-weight: 800;
    text-transform: uppercase;
  }
  & .stars {
    font-size: 28px;
    color: $C1;
  }
  & .review-count {
    font-size: 12px;
    font-weight: 700;
  }
  & .pricing {
    margin: 1rem 0;
  }
  & .price {
    font-size: 48px;
    font-weight: 100;
    margin: 0 0.25rem 0 0;
  }
  & .price-per {
    font-size: 12px;
  }
  & .view-all-anchor {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    font-family: $ff2;
    color: $C2;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
