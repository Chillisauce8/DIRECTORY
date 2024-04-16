<template>
  <ProductList :props="{title: 'Add Ons', display: 'slider', id: 'addOns'}" v-if="addonsRef">
    <template v-for="(addon, index) in addonsRef" :key="index">

      <ProductCard class="list W1 Row"
                   v-if="needShowProductAddon(addon)"
                   display="list"
                   :product="addon.product"
                   :selectable="!readOnly"
                   :selected="addon.selected"
                   :section="section"
                   :topInfo="getPriceView(addon)"
                   v-on:cardSelected="addonSelectionChanged(addon, $event)">
      </ProductCard>
    </template>
  </ProductList>
</template>

<script lang="ts" setup>
import {useCsLodash} from "~/services/cs-lodash.factory";
import {useHidingPriceService} from "~/services/helpers/pricing/hiding-price-service.factory";
import {ProductAddon} from '~/services/models/productAddon';
import { useEventPermissionsService } from "~/services/helpers/event/event-permissions.service.factory";
import { useProductPageHelperService } from "~/services/helpers/product/product-page-helper.service.factory";
import { Product } from "~/services/models/product";
import { useProductPriceViewService } from '~/services/helpers/pricing/product-price-view-service.factory';
import { nextTick } from 'vue';


interface ProductAddonsProps {
  product: Product;
  productStage?: string;
  section: string;
  readOnly?: boolean;
  priceConditions: any;
  priceViewValue: any;
}


interface ProductAddonsEmits {
  (e: 'selectionChanged', value: {addon: ProductAddon, value: any}): void;
}

const props = defineProps<ProductAddonsProps>();
const emits = defineEmits<ProductAddonsEmits>();


const csLodash = useCsLodash();
const hidingPriceService = useHidingPriceService();
const eventPermissionsService = useEventPermissionsService();
const productPageHelperService = useProductPageHelperService();
const productPriceViewService = useProductPriceViewService();


let recalculateHidingPricesSubscription = undefined;
let updatePriceValueSubscription = undefined;


const vm = reactive({
  needToHidePrices: true,
  productStage: props.productStage,
});


const addonsRef = ref(productPageHelperService.getAddonsForPage(props.product, props.section));


function addonSelectionChanged(addon: ProductAddon, value: any): void {
  emits('selectionChanged', {addon, value});
}

function getPriceView(productAddon: ProductAddon) {
  return productPageHelperService.getAddonPriceView(productAddon, vm.needToHidePrices);
}

function needShowProductAddon(productAddon: ProductAddon): boolean {
  return productPageHelperService.needShowProductAddon(productAddon);
}

async function checkHidePricesPermission(): Promise<void> {
  vm.needToHidePrices = await productPageHelperService.needHidePrices(props.product, vm.productStage);
}

function subscribeOnRecalculateHidingPrices() {
  recalculateHidingPricesSubscription = hidingPriceService.onRecalculateHidingPrices(checkHidePricesPermission.bind(this));
}

function subscribeOnPriceViewValueChange() {
  updatePriceValueSubscription = productPriceViewService.subscribeOnPriceViewValueChange(async (value) => {
    if (!value) {
      return;
    }
    // Need to wait a bit to get updated packageBuilder viewData.
    // It uses the same subscription subscribeOnPriceViewValueChange
    setTimeout(async () => {
      addonsRef.value = productPageHelperService.getAddonsForPage(props.product, props.section);
    }, 300);
  });
}

function unsubscribeAll() {
  if (recalculateHidingPricesSubscription) {
    recalculateHidingPricesSubscription.unsubscribe();
  }

  if (updatePriceValueSubscription) {
    updatePriceValueSubscription.unsubscribe();
  }
}

await checkHidePricesPermission();

onBeforeMount(() => {
  subscribeOnRecalculateHidingPrices();
  subscribeOnPriceViewValueChange();
});

onUnmounted(() => {
  unsubscribeAll();
});

</script>

<style>

</style>
