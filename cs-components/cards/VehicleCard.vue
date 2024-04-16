<template>
  <card-wrapper class="vehicle-card card">
    <ImageWrapper type="cars" :max="1" />
    <card-text-wrapper>
      <div class="sale-type">{{ saleType }}</div>
      <h1 class="name">{{ name }}</h1>
      <div class="year">{{ year }}</div>
      <div class="price">{{ price }}</div>
    </card-text-wrapper>
  </card-wrapper>
</template>

<script>
export default {
  data() {
    return {
      saleType: 'Auction',
      name: '1956 Austin Healey 100 Le-Mans Spec',
      year: '1956',
      price: 'Estimate £12,000 - £15,000',
    }
  },
}
</script>

<style lang="scss">
.vehicle-card {
  width: 300px;
  & figure {
    @include aspect-ratio(3, 2);
  }
  & header {
    @include aspect-ratio(3, 2);
    //     min-height: 150px;
  }
  & .name {
    font-size: 18px;
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
  }
}
</style>
