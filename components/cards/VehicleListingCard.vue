<template>
  <card-wrapper class="vehicle-listing-card card">
    <ImageWrapper
      v-if="images"
      :images="images"
      :max="1"
      :width="290"
      :height="145"
      loading="lazy"
    />
    <card-text-wrapper>
      <div class="sale-type">{{ saleType }}</div>
      <h1 class="name">{{ name }}</h1>
      <div class="year">2000cc · Petrol · 58,000 Miles · Manual</div>
      <div class="price">{{ price }}</div>
    </card-text-wrapper>
  </card-wrapper>
</template>

<script setup lang="ts">
const props = defineProps(["images", "name", "saleType", "year", "price"]);
</script>

<style lang="scss">
.vehicle-listing-card {
  width: 300px;
  & figure {
    @include aspect-ratio(3, 2);
  }
  & header {
    @include aspect-ratio(3, 2);
    //     min-height: 150px;
  }
  & .name {
    font-family: $ff2;
    font-size: 15px;
    font-weight: 100;
  }
  & .sale-type {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }
  & .year {
    font-size: 12px;
  }
  & .price {
    font-size: 14px;
    font-weight: 400;
  }
}
</style>
