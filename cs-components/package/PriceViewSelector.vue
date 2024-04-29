<template>
  <select v-model="priceViewValue" @change="onPriceViewChange()">
    <option v-for="priceViewOption in priceViewValueOptions"
            :key="priceViewOption.view" :value="priceViewOption">
      {{ priceViewOption.view }}
    </option>
  </select>
</template>

<script>
import { useProductPriceViewService } from "~/service/helpers/pricing/product-price-view-service.factory";

export default {
  props: ['eventPackage', 'product', 'siteArea'],
  data() {
    return {
      priceViewValue: undefined,
      priceViewValueOptions: [],
      _config: undefined,
      priceViewValueChangesSubscription: undefined
    }
  },
  setup() {
    return {
      productPriceViewService: useProductPriceViewService(),
    };
  },
  mounted() {
    this.initPriceViewValue();
  },
  unmounted() {
    this.priceViewValueChangesSubscription ? this.priceViewValueChangesSubscription.unsubscribe() : null;
  },
  watch: {
    eventPackage: function (newVal, oldVal) {
      this.initPriceViewValue();
    }
  },
  methods: {
    onPriceViewChange() {
      this.productPriceViewService.store(this.priceViewValue, this._config);

      this.$emit('priceViewValueChange', this.priceViewValue);
    },

    initPriceViewValue() {
      this._setCurrentPriceViewValue();
      this.onPriceViewChange();

      this.priceViewValueChangesSubscription =
        this.productPriceViewService.subscribeOnPriceViewValueChange(() => {
          this._setCurrentPriceViewValue();
        });
    },

    _setCurrentPriceViewValue() {
      this._config = {
        siteArea: this.siteArea || 'website',
        product: this.product,
        eventPackage: this.eventPackage
      };

      this.priceViewValueOptions = this.productPriceViewService.getPriceViewOptions(this._config);

      const priceViewValueIndex = this.priceViewValueOptions.findIndex(option => {
        return option.value === this.productPriceViewService.getPriceViewValue(this._config).value;
      });

      this.priceViewValue = this.priceViewValueOptions[priceViewValueIndex];
    }
  }
};
</script>

<style>

</style>
