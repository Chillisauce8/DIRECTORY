<template>
  <ProductList :props="{title: multiProductHeader, display: 'slider', id: 'options'}"
               v-if="props.product.getOptions().length" class="product-options">
    <div class="W1">
      <section v-if="hasCostingConditions()" class="width_main padding_1_0 Row space-around-start">
        <template v-for="item in vm.costingConditions">
          <div class="option-item" v-bind:class="{ selected: isPricingActive(item) }">
            <div class="h7">Pick any {{item.count}}</div>
            <div class="h3 price option-item-price text-align_center">{{item.price}}</div>
          </div>
        </template>
      </section>

      <div v-if="!vm.isSelectionValid" class="alert-message">
        Please select a valid number of products
      </div>
      <div v-if="product.isAllProductsForOptions()" class="width_main padding_1_0 Row space-around-start">
        Options included
      </div>
    </div>

    <template v-if="vm.optionsAutoSelectionDone">
      <template v-for="(option, index) in product.getOptions()">
        <ProductCard class="list W1 Row"
                     v-if="needToShowProductOption(option)"
                     display="list"
                     :selectable=isSelectable()
                     :product="option.product"
                     :section="section"
                     :selected="option.selected"
                     :topInfo="getAdditionalInfo(option)"
                     v-on:cardSelected="optionSelectionChanged(option, $event)">
        </ProductCard>
      </template>
    </template>
  </ProductList>
</template>

<script lang="ts" setup>

import { useHidingPriceService } from '~/service/helpers/pricing/hiding-price-service.factory';
import { useProductPagePriceHelperService } from '~/service/helpers/pricing/product-page-price-helper-service.factory';
import { useCsLodash } from '~/service/cs-lodash.factory';
import { usePricingService } from '~/service/helpers/pricing/pricing-service.factory';
import { useEventPermissionsService } from '~/service/helpers/event/event-permissions.service.factory';
import { Product } from '~/service/models/product';
import { ProductOption } from '~/service/models/productOption';


interface ProductOptionsProps {
  product: Product;
  priceConditions: any;
  priceViewValue: any;
  section: string;
  readOnly?: boolean;
  productStage?: string;
  multiProductHeader?: any;
}

interface ProductOptionsEmits {
  (e: 'selectionChanged', value: {option: ProductOption, costingConditions: any, value: any}): void;
  (e: 'selectionValidityChange', value: boolean): void;
}


const props = defineProps<ProductOptionsProps>();
const emits = defineEmits<ProductOptionsEmits>();

const hidingPriceService = useHidingPriceService();
const productPagePriceHelperService = useProductPagePriceHelperService();
const csLodash = useCsLodash();
const pricingService = usePricingService();
const eventPermissionsService = useEventPermissionsService();

const vm = reactive({
  costingConditions: undefined,
  needToHidePrices: true,
  recalculateHidingPricesSubscription: undefined,
  showNullPriceProductPermission: undefined,
  isSelectionValid: true,
  optionsAutoSelectionDone: !!process.server,
});


function needToShowProductOption(option) {
  if (vm.showNullPriceProductPermission) {
    return true;
  }

  return getAdditionalInfo(option) !== 'POA';
}

function checkShowNullPriceProductPermission() {
  vm.showNullPriceProductPermission = eventPermissionsService
      .hasPermission('productGrid.showNullPriceProduct', {});
}

function isSelectable() {
  return !props.product.isAllProductsForOptions() && props.readOnly !== true;
}

async function checkHidePricesPermission() {
  const additionalContext: any = {
    productType: props.product ? props.product.getType() : null
  };

  if (props.productStage) {
    additionalContext.productStage = props.productStage;
  }

  const params = {
    isProductPrice: true,
    additionalContext: additionalContext
  };

  vm.needToHidePrices = await hidingPriceService.needToHidePrices(params);
}

function optionSelectionChanged(option, value) {
  emits('selectionChanged', {option, costingConditions: vm.costingConditions, value});

  vm.isSelectionValid = isValidOptionsCountSelected();
  emits('selectionValidityChange', vm.isSelectionValid);
}

function hasCostingConditions() {
  return !!(vm.costingConditions && vm.costingConditions.length);
}

function isValidOptionsCountSelected() {
  if (props.product.isAllProductsForOptions()) {
    return true;
  }

  if ((!vm.costingConditions || !vm.costingConditions.length) && !props.product.isAllProductsForOptions()) {
    return true;
  }

  const allowedProductCountArray = vm.costingConditions.map((item) => item.count);

  const selectedCount = getSelectedProductsCount();

  return allowedProductCountArray.indexOf(selectedCount) !== -1;
}

function getSelectedProductsCount() {
  return props.product.getOptions().reduce((count, option) => {
    return (option.selected) ? count + 1 : count;
  }, 0);
}

function isPricingActive(pricing) {
  return (getSelectedProductsCount() === pricing.count);
}

function productHasActivitiesNumberCostCondition() {
  return props.product.hasActivitiesNumberCostCondition();
}

function getCostings() {
  let optionsProductsCount;
  let costingList = [];

  if (props.product.isAllProductsForOptions() || !productHasActivitiesNumberCostCondition()) {
    return costingList;
  }

  if (props.product.getOptions()) {
    optionsProductsCount = props.product.getOptions().length;
  }

  for (let count = 1; count <= optionsProductsCount; ++count) {
    let activitiesIdList = props.product.getOptions().slice(0, count)
        .map((item) => item.product.getId());

    let priceConfig: any = productPagePriceHelperService.getPriceConfig({
      skipSupplements: true,
      useActivitiesFromConfig: true
    });

        priceConfig.pricingConditions = Object.assign({}, priceConfig.pricingConditions, {activitiesIdList});

    priceConfig.getViewPrice = !vm.needToHidePrices;

    let pricePair = pricingService.calculateProductPrice(props.product, priceConfig);
    let price = productPagePriceHelperService.getPriceFromPair(pricePair);

    if (price === null || price === 'POA') {
      continue;
    }

    if (vm.needToHidePrices) {
      price = hidingPriceService.needToShowSymbolsWithABTest() ?
          hidingPriceService.getHiddenPrice(price as number) : '';
    }

    costingList.push({count, price});
  }

  return costingList;
}

function selectOptionProducts(costingList) {
  if (costingList.length === 0 || props.product.isAllProductsForOptions()) {
    return;
  }

  const products = csLodash.sortBy(props.product.getOptions(), 'suppliment');

  if (!props.product.isAllProductsForOptions()) {
    const minimalPriceCosting = costingList.sort((itemA, itemB) => {
      return itemA.count - itemB.count;
    })[0];

    for (let i = 0; i < minimalPriceCosting.count; ++i) {
      const item = products[i];
      item.selected = true;
      optionSelectionChanged(item, true);
    }
  } else {
    for (let item of props.product.getOptions()) {
      item.selected = true;
      optionSelectionChanged(item, true);
    }
  }
}

function getPersonCountForSupplement() {
  if (props.priceViewValue && props.priceViewValue.total) {
    return props.priceConditions.personsCount;
  }

  return 1;
}

function showSupplements(option) {
  return props.product.hasOptionsSupplements() && option.getSupplement();
}

function needExcludeVAT() {
  return !productPagePriceHelperService.getPriceConfig()['skipVatExcluding'];
}

function getAdditionalInfo(option) {
  const supplementViewConfig = {
    personCount: getPersonCountForSupplement(),
    excludeVat: needExcludeVAT(),
    pricingConfig: props.priceConditions,
    product: props.product
  };

  if (!showSupplements(option)) {
    return null;
  }

  if (vm.needToHidePrices) {
    if (!hidingPriceService.needToShowSymbolsWithABTest()) {
      return '';
    }

    const supplement = option.getSupplement(supplementViewConfig);

    if (supplement) {
      return hidingPriceService.getHiddenPrice(supplement) ?
          '+ ' + hidingPriceService.getHiddenPrice(supplement) : '';
    }

    return 'POA';
  }

  return option.getSupplementView(supplementViewConfig);
}

function subscribeOnRecalculateHidingPrices() {
  vm.recalculateHidingPricesSubscription =
      hidingPriceService.onRecalculateHidingPrices(checkHidePricesPermission);
}

function unsubscribeAll() {
  vm.recalculateHidingPricesSubscription.unsubscribe();
}

async function created() {
  checkShowNullPriceProductPermission();

  await checkHidePricesPermission();

  vm.costingConditions = getCostings();

  if (!props.readOnly && getSelectedProductsCount() === 0) {
    selectOptionProducts(vm.costingConditions);
  }

  vm.optionsAutoSelectionDone = true;
}

onBeforeMount(() => {
  subscribeOnRecalculateHidingPrices();
});

onUnmounted(() => {
  unsubscribeAll();
});

created();

</script>

<style lang="scss">
.product-options{
  & .alert-message{
    text-align: center;
    color: $C1;
    font-family: $ff2;
  }

}


</style>
