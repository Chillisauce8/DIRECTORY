<template>
  <header class="product-header Split W5">
    <div class="media">
      <MediaCarousel v-if="mediaData" class="carousel" id="product-images" loading="eager"
                     :mediaData="mediaData">
      </MediaCarousel>
    </div>
    <div class="Copy">
      <ProductSummary :product="product"
                      :priceValue="priceValue"
                      :reviewScore="reviewScore"
                      :reviewCount="reviewCount"
                      :packageSettings="packageSettings"
                      :productStage="productStage"
                      :section="section"
                      @priceViewValueChange="onPriceViewChange">
      </ProductSummary>
    </div>
  </header>
</template>

<script lang="ts">
import { useSectionStore } from '~/store/section';
import { useCsLodash } from '~/service/cs-lodash.factory';


export default {
  props: ['product', 'reviewScore', 'reviewCount', 'priceValue', 'packageSettings',
  'productStage', 'section'],
  setup() {
    return {
      sectionStore: useSectionStore(),
      csLodash: useCsLodash(),
    };
  },
  computed: {
    mediaData() {
      if (this.product.isMultiActivity()) {
        const images = this.getMultiActivityImages(this.product);

        return images.map(item => {
          return {
            id: item,
          }
        });
      }

      const section = this.sectionStore.section;

      let images: Array<any>;
      const venue = this.product.getVenueOnTop();
      const venueOnTop = this.product.isVenueOnTop();

      images = (venueOnTop && venue) ? venue.getSectionImages(section) :
          this.product.getSectionImages(section);

      if (venueOnTop && (!images || !images.length)) {
        images = this.product.getSectionImages(section);
      }

      return images.map(item => {
        return {
          id: item.image.id,
          alt: item.image?.description || item.image?.title,
        }
      });
    }
  },
  methods: {
    onPriceViewChange(value) {
      this.$emit('priceViewValueChange', value);
    },

    getMultiActivityImages(product) {
      const section = this.sectionStore.section;

      const optionImages = product.getOptions().map(option => {
        return option.product.getMainImageId(section);
      })
      .filter(item => !!item)
      .map(item => {
        return item;
      });

      const imagesIdList = [product.getMainImageId(section), ...optionImages];
      return this.csLodash.uniq(imagesIdList);
    },
  }
}
</script>

<style lang="scss">
.product-header {
}
</style>
