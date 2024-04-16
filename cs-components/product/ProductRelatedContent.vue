<template>
  <div>
    <ProductVenue id="venue" v-if="venueForPageRelatedContent"
                  :venue="venueForPageRelatedContent">
    </ProductVenue>
  </div>
</template>

<script>
import { useProductPageHelperService } from "~/services/helpers/product/product-page-helper.service.factory";

export default {
  setup() {
    return {
      productPageHelperService: useProductPageHelperService(),
    }
  },
  props: ['product', 'isVenueOnTop', 'isVenueConfirmed', 'selectedVenue'],
  computed: {
    venueForPageRelatedContent() {
      const venues = this.productPageHelperService.getVenuesForPageRelatedContent(
        this.product, this.isVenueConfirmed, this.isVenueOnTop);

      if (this.selectedVenue) {
        return this.selectedVenue.getTopVenue();
      } else {
        return venues[0];
      }
    }
  }
}
</script>

<style>

</style>
