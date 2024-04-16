<template>
  <card-wrapper
    v-if="!!product"
    class="product-card"
    :class="[open ? 'open' : 'closed']"
    :selectable="!!selectable"
    :clickable="!!clickable"
    :selected="selected"
    :link="link"
    :search-hide="searchHide"
    :search-terms="searchTerms"
    @click="onCardClick"
    @contextmenu="openContextMenu"
    v-on:selected="onCardSelected"
  >
    <template v-if="product.isMultiActivity()">
      <ProductImages :label="product.label" :images="getMultiActivityImages(product)" display="image-grid"/>
    </template>
    <template v-else>
      <ProductImages :label="product.label" :src="getMainImage(product)" display="image-grid"
        :alt="getImageDefaultAlt()"/>
    </template>

    <card-text-wrapper>
      <h1 class="Row" v-if="display === 'list'">
        <span>{{ getName(product) }}</span>
        <span v-if="topInfo" class="top-info">
          {{topInfo}}<sup class="top-info-label" v-if="topInfoLabel">{{topInfoLabel}}</sup>
        </span>
      </h1>

      <ProductCardIncludes
        v-if="display === 'list'"
        :title="getName(product)"
        :includes="getIncluded(product)"
      />

      <ProductCardOverview v-if="display === 'card'"
                           :product="product"
                           :section="section"
                           :productData="productData"
                           :need-to-hide-prices="needToHidePrices || display === 'list'"
                           :need-to-hide-distance="needToHideDistance"
                           @quickAddButtonClick="onQuickAddButtonClick($event)"
      />
    </card-text-wrapper>

    <client-only>
      <ProductContextMenu v-if="!isContextMenuDisabled && contextMenuItems?.length > 0"
                          :items="contextMenuItems"
                          :params="contextMenuParams"
                          @click="onContextMenuClick">
      </ProductContextMenu>
    </client-only>
  </card-wrapper>
</template>

<script>


import {useCsLodash} from "~/services/cs-lodash.factory";
import {useProductIncludedDataPreparer} from "~/services/helpers/product/product-included-data-preparer.factory";
import {useHidingPriceService} from "~/services/helpers/pricing/hiding-price-service.factory";
import {Product} from "~/services/models/product";
import {useCurrentSection} from "~/services/helpers/current-section.factory";
import {useCurrentLocationService} from "~/services/helpers/current-location.service.factory";
import {useProductContextMenuService} from "~/services/helpers/product/product-context-menu.factory";

export default {
  props: {
    product: Product,
    productData: {
      type: Object,
      required: false,
    },
    contextMenuItems: {
      type: Array,
      required: false,
    },
    section: String,
    display: String,
    topInfo: {
      type: String,
      required: false,
    },
    topInfoLabel: {
      type: String,
      required: false,
    },
    selectable: {
      type: Boolean,
      required: false,
    },
    clickable: {
      type: Boolean,
      required: false,
    },
    selected: {
      type: Boolean,
      required: false,
    },
    link: {
      type: [String, Object],
      required: false,
    },
    needToHideDistance: {
      type: Boolean,
      required: false,
    },
    searchHide: {
      type: Boolean,
      default: () => false,
    },
    searchTerms: {
      type: String,
      default: () => "",
    },
  },
  emits: [
    "click",
    "cardSelected",
    "quickAddButtonClick",
    "contextMenuClick",
  ],
  setup(props) {
    return {
      csLodash: useCsLodash(),
      productIncludedDataPreparer: useProductIncludedDataPreparer(),
      hidingPriceService: useHidingPriceService(),
      currentSection: useCurrentSection(),
      currentLocation: useCurrentLocationService(),
      productContextMenuService: useProductContextMenuService(),
    }
  },
  beforeMount() {
    this.subscribeOnRecalculateHidingPrices();
  },
  unmounted() {
    this.unsubscribeAll();
  },
  mounted() {
    // this.product.label = 'New';
  },
  async created() {
    await this.getHidePricesPermission();
  },
  data() {
    return {
      open: false,
      list: true,
      imagesApiPath: 'https://media.chillisauce.com/image/upload/',
      needToHidePrices: true,
      recalculateHidingPricesSubscription: undefined,
      contextMenuParams: undefined,
    };
  },
  computed: {
    isContextMenuDisabled() {
      return this.productContextMenuService.isDisabled(this.product) || !this.contextMenuItems?.length;
    },
  },
  methods: {
    onCardClick(event) {
      this.open = !this.open;
      this.$emit('click', event);
    },

    onCardSelected(event) {
      this.$emit('cardSelected', event);
    },

    onQuickAddButtonClick(event) {
      this.$emit("quickAddButtonClick", event);
    },

    onContextMenuClick(dayIndex) {
      this.$emit("contextMenuClick", dayIndex);
    },

    openContextMenu(event) {
      if (this.isContextMenuDisabled) {
        return;
      }

      event.preventDefault();

      this.contextMenuParams = {
        x: event.x,
        y: event.y,
      };
    },

    getMainImage(product) {
      try {
        const imageId = product.getMainImageId(this.section);

        if (imageId) {
          return this.imagesApiPath + imageId;
        } else {
          let images;
          const venues = this.product.getTopVenues();
          const venueOnTop = this.product.isVenueOnTop();

          if (!venueOnTop || !venues.length) {
            return;
          }

          images = venues[0].getSectionImages(this.section);

          if (images[0]) {
            return this.imagesApiPath + images[0].image.id;
          }

          images = venues[0].getSectionImages(null);

          if (images[0]) {
            return this.imagesApiPath + images[0].image.id;
          }
        }
      } catch(ex) {

      }
    },

    getMultiActivityImages(product) {
      const optionImages = product.getOptions().map(option => {
        return option.product.getMainImageId(this.section);
      }).filter(item => !!item)
      .map(item => {
        return item;
      });

      const imagesIdList = [product.getMainImageId(this.section), ...optionImages];
      const uniqImagesIdList = this.csLodash.uniq(imagesIdList);

      let result = uniqImagesIdList.map(id => ({
        src: this.imagesApiPath + id,
        alt: this.getImageDefaultAlt()
      }));

      if (result.length > 6) {
        result = result.slice(0, 6);
      }

      return result;
    },

    getImageDefaultAlt() {
      const locationName = this.currentLocation.getLocationName();

      if (locationName) {
        return `${locationName} ${this.product.getName()} ${this.currentSection.getIdeasName()}`;
      } else {
        return `${this.product.getName()} ${this.currentSection.getIdeasName()}`;
      }
    },

    getName(product) {
      try {
        return product.getName();
      } catch(ex) {

      }
    },

    getIncluded(product) {
      try {
        return this.productIncludedDataPreparer.prepare(product);
      }  catch(ex) {

      }
    },

    getInfo(product) {
      try {
        return product.getInfo();
      }  catch(ex) {

      }
    },

    async getHidePricesPermission() {
      const params = {
        isProductPrice: true,
        additionalContext: {
          productType: this.product ? this.product.getType() : null,
        },
      };

      this.needToHidePrices = await this.hidingPriceService.needToHidePrices(params);
    },

    subscribeOnRecalculateHidingPrices() {
      this.recalculateHidingPricesSubscription =
          this.hidingPriceService.onRecalculateHidingPrices(this.getHidePricesPermission.bind(this));
    },

    unsubscribeAll() {
      this.recalculateHidingPricesSubscription.unsubscribe();
    },
  },
}
</script>

<style lang="scss">
$label-border-color: $C1;

.product-card {
  &.list,
  &.basket-package,
  &.full-package {
 //   display: flex; // Make Card Contents into a row.
    & .images {
      width: 25%;
      @include aspect-ratio(1, 1);
    }
    & header {
      position: relative;
      width: 75%;
      & li {
        @include ellipsis();
        @include scale(font-size, 8px, 14px, 1.8);
      }
    }

    & h1 {
      @include scale(font-size, 10px, 16px, 1.8);
      font-weight: 500;
      text-transform: uppercase;
      margin-bottom: 5px;
      @include ellipsis();
    }
  }
  &.card {
    & .images {
      @include aspect-ratio(3, 2);
      min-height: 193px; // Needed for Safari issue - not showing images
      width: 300px;
    }
    & header {
      @include aspect-ratio(3, 2);
      //     min-height: 250px;
    }
    & .label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      position: absolute;
      top: 0px;
      right: 0px;
      border: white 1px solid;
      border-color: $label-border-color;
      background: rgba(0, 0, 0, 0.75);
      padding: 0 5px;
      margin: 5px;
    }
  }
  .top-info {
    margin-left: 10px;

    &-label {
      vertical-align: top;
    }
  }
  & h1 {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }
}
</style>
