<template>
  <div class="product-card-overview" v-if="productData">
    <div class="new"></div>
    <div class="title">
      <h1 v-if="!hideName">
        {{ product.getName() }}
      </h1>
    
      <div
        class="options"
        v-if="product.getOptions() && product.getOptions().length"
      >
        +{{ product.getOptions().length }}
        {{ product.getOptions().length === 1 ? "option" : "options" }}
      </div>
    </div>
    <h2 class="venue" :class="{ hidevenue: productData.closestVenue?.isVenueOnTop === false }">
      {{ productData.closestVenue ? productData.closestVenue.name : "" }}
    </h2>
    <div class="ratings" v-if="productData.reviewScore">
      <div class="stars" :style="'--rating:' + productData.reviewScore"></div>
      <div class="reviews">
        {{ productData.reviewCount }}
        {{ productData.reviewCount === 1 ? "Review" : "Reviews" }}
      </div>
    </div>
    <client-only>

      <div class="pricing" v-if="!needToHidePrices">
        <div class="allocation user-staff-show" v-if="allocationString">
          <span> {{ allocationString }} </span>
          </div>
      <div class="price" >
        {{ productPriceView }}
      </div>
  
   <div class="margin user-staff-show" v-if="productData.productMarkUpView">
        {{ productData.productMarkUpView }}
      </div>
      </div>
    </client-only>
    <div class="location">
      <div
        class="distance"
        v-if="
          !needToHideDistance &&
          productData.venue &&
          productData.venue.distance !== undefined
        "
      >
        {{ productData.venue.distance }} from
        {{ currentLocation.getLocationName() }} centre
      </div>
    </div>
    <client-only>
      <div class="sales-info user-staff-show" v-if="currentLocation.has()">
        <div class="supplier-name">{{ productData.supplierName }}</div>
        <div class="bottom-row">
          <button class="quick-add-button" @click="quickAddButtonClick($event)">Quick Add</button>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script>
import { Product } from "~/services/models/product";
import { useCurrentLocationService } from "~/services/helpers/current-location.service.factory";

export default {
  setup(props) {
    return {
      currentLocation: useCurrentLocationService(),
    };
  },
  emits: [
    "quickAddButtonClick",
  ],
  props: {
    product: {
      type: Product,
      required: true,
    },
    productData: {
      type: Object,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    hideName: {
      type: Boolean,
      default: () => false,
    },
    needToHidePrices: {
      type: Boolean,
      default: () => false,
    },
    needToHideDistance: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    productPriceView() {
      return this.productData.productPriceView;
    },
    allocationString() {
      return this.productData.allocation?.length > 0 ? this.productData.allocation.join(' / ') : '';
    },
  },
  methods: {
    quickAddButtonClick: function(event) {
      this.$emit("quickAddButtonClick", event);
    }
  },
};
</script>

<style lang="scss">
$stars-color: $C1;
.product-card-overview {
  & h1 {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }
  & h2 {
    font-size: 9px;
    font-weight: 300;
    // font-style: italic;
    //     text-transform: uppercase;
  }
  & .options {
    font-size: 10px;
  }
  & .stars {
    color: $stars-color;
    font-size: 12px;
    text-transform: uppercase;
  }

  & .pricing {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: 300;
& .price{
  margin: 0 10px 0 10px;
}

    & .margin, .allocation{
  
      font-size: 14px;
    }
  }
  & .distance {
    font-size: 10px;
    color: darkgray;
  }
  & .supplier-name {
    font-size: 12px;
    font-weight: 500;
    // text-transform: uppercase;
  }
  & .costs {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 500;
    // text-transform: uppercase;
  }
  & .bottom-row {
    display: flex;
    justify-content: center;
  }
  & .quick-add-button {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-family: $ff2;
    border: 1px solid;
    border-radius: 3px;
    padding: 3px;
    transition: all 1s ease-in-out;
    &:hover {
      background-color: $CB-1;
    }
  }
}
</style>
