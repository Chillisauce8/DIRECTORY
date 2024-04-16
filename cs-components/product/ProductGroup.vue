<template>
  <CardsContainer title="Similar Options" display="slider" id="similar"
                  v-if="needShowCards()">
    <template v-for="productGroup in groups">
      <ProductCard class="card" v-if="allowedForGroup(productGroup)"
                   display="card"
                   :selectable="false"
                   :clickable="true"
                   :product="productGroup.productList[0]"
                   :productData="productGroup.productGridModel"
                   :section="section"
                   v-on:cardSelected="optionSelectionChanged(productGroup, $event)"
                   v-on:quickAddButtonClick="onQuickAddButtonClick(productGroup, $event)"
      >
      </ProductCard>
    </template>
  </CardsContainer>
</template>

<script lang="ts">
import type { Product } from "~/services/models/product";
import type { IProduct } from "~/services/models/product.interface";
import type { IProductAddon } from "~/services/models/productAddon";
import { useCsLodash } from "~/services/cs-lodash.factory";
import { useEventPermissionsService } from "~/services/helpers/event/event-permissions.service.factory";
import type { IHidePricesParams } from "~/services/helpers/pricing/hiding-price.service";
import type { IFiltrationContext } from "~/services/helpers/filter-helper.service";
import { useHidingPriceService } from "~/services/helpers/pricing/hiding-price-service.factory";
import { useProductPagePriceHelperService } from "~/services/helpers/pricing/product-page-price-helper-service.factory";
import type {IPriceConfig} from '~/services/models/pricing';
import type {IProductGroup} from '~/services/helpers/product/product-groups-helper.service';
import { useQuickAddProductService } from "~/services/helpers/package-builder/quick-add-product.factory";


export default {
  props: ['product', 'groups', 'section', 'readOnly', 'priceConditions', 'priceViewValue'],
  setup() {
    return {
      csLodash: useCsLodash(),
      eventPermissionsService: useEventPermissionsService(),
      hidingPriceService: useHidingPriceService(),
      productPagePriceHelperService: useProductPagePriceHelperService(),
      quickAddProductService: useQuickAddProductService(),
    }
  },
  data() {
    return {
      showNullPriceProductPermission: undefined,
      needToHidePrices: true,
      recalculateHidingPricesSubscription: undefined,
    }
  },
  async created() {
    this.checkShowNullPriceProductPermission();
    await this.checkHidePricesPermission();
  },
  beforeMount() {
    this.subscribeOnRecalculateHidingPrices();
  },
  unmounted() {
    this.unsubscribeAll();
  },
  methods: {
    getGroupProductData(group: IProductGroup) {
      return group.productGridModel;
    },

    needShowCards() {
      if (this.groups.length <= 1) {
        return false;
      }

      if (this.showNullPriceProductPermission) {
        return true;
      }

      let countOfProductsWithPrice: number = 0;

      for (const group of this.groups) {
        if (group.productGridModel.productPriceView !== 'POA') {
          countOfProductsWithPrice++;
        }
      }

      return (countOfProductsWithPrice > 1);
    },

    checkShowNullPriceProductPermission() {
      this.showNullPriceProductPermission = this.eventPermissionsService
        .hasPermission('productGrid.showNullPriceProduct', {});
    },

    async checkHidePricesPermission(): Promise<void> {
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

    optionSelectionChanged(groupProduct, value) {
      this.$emit('selectionChanged', {groupProduct, value});
    },

    onQuickAddButtonClick(group: IProductGroup<Product>, event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      this.quickAddProductService.add(group?.productList?.[0]);
    },

    allowedForGroup(group: IProductGroup) {
      return group.productList[0].getId() !== this.product.getId();
    },

    getProductPrice(product: IProduct, getPriceView: boolean = true, ignoreHidePrice: boolean = false) {
      let selectedAddons = product.getSelectedAddons().map(item => item.selected ? item.product.getId() : null);

      product.getAddons().forEach((item: IProductAddon) => item.selected = false);
      const priceConditionsCopy = this.csLodash.cloneDeep(this.priceConditions);

      if (priceConditionsCopy.packageAccommodationDaysCombination) {
        priceConditionsCopy.packageAccommodationDaysCombination.forEach(i => delete i.unitsCount);
      }

      delete priceConditionsCopy.unitsCount;

      const priceConfig: IPriceConfig = {
        getViewPrice: getPriceView,
        getMeanPrice: false,
        pricingConditions: priceConditionsCopy,
        priceViewValue: this.priceViewValue,
      };

      let price;

      if (this.needToHidePrices && !ignoreHidePrice) {
        priceConfig.getViewPrice = false;
        price = this.hidingPriceService.needToShowSymbolsWithABTest() ?
          this.hidingPriceService.getHiddenPrice(<number>product.getPrice(priceConfig)) : '';
      } else {
        priceConfig.getViewPrice = getPriceView;
        price = product.getPrice(priceConfig);
      }

      product.getAddons().forEach(item => item.selected = selectedAddons.indexOf(item.product.getId()) !== -1);

      selectedAddons = null;

      return price;
  },

    getPriceLabel(product: IProduct) {
      if (this.getProductPrice(product) === 'POA' || this.needToHidePrices) {
        return '';
      }

      return this.priceViewValue && this.priceViewValue.total ? 'FP' : 'PP';
    },

    // TODO: Should be used for price tooltip
    getProductPriceAdditionalInfo(product: IProduct): any {
      const priceConditionsCopy = this.csLodash.cloneDeep(this.priceConditions);

      const priceConfig: IPriceConfig = {
        pricingConditions: priceConditionsCopy,
      };

      return this.productPagePriceHelperService.getPriceAdditionalInfo(product, priceConfig);
    },

    subscribeOnRecalculateHidingPrices() {
      this.recalculateHidingPricesSubscription =
          this.hidingPriceService.onRecalculateHidingPrices(this.checkHidePricesPermission.bind(this));
    },

    unsubscribeAll() {
      if (this.recalculateHidingPricesSubscription) {
        this.recalculateHidingPricesSubscription.unsubscribe();
      }
    },
  }
}
</script>

<style>

</style>
