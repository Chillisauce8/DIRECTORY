<template>
  <div class="vehicle-summary">
    <h1>1950 Jaguar XK120 Competition Roadster
</h1>
<div class="Row  Around">
  <div class="X-Center"><LazySvgIcon svg="dial" />
  <div>20,000 miles</div>
  </div>
  <div class="X-Center"><LazySvgIcon svg="dial2" />
  <div>Auction</div>
  </div>
  <div class="X-Center"><LazySvgIcon svg="steering" />
<div>RHD</div>
</div>
</div>
<div class="Row  Around">
  <div class="X-Center"><LazySvgIcon svg="dial" />
  <div>For Sale</div>
  </div>
  <div class="X-Center"><LazySvgIcon svg="dial2" />
  <div>£20,000 to £22,000</div>
  </div>
  <div class="X-Center"><LazySvgIcon svg="steering" />
<div>6 Days</div>
</div>
</div>
<dl class="includes">
      <dd>Odometer</dd>
      <dd>Stearing</dd>
      <dd>Sale Tyoe</dd>
      <dd>Seller Type</dd>
      <dd>Sales Status</dd>
      <dd>Currency</dd>
      <dd>Estimate From</dd>
      <dd>Estimate To</dd>
      <dd>Price</dd>
      <dd>Price Type</dd>
      <dd>Auction Start</dd>
      <dd>Auction End</dd>
      <dd>Listing Date</dd>
      <dd>Country</dd>
      <dd>Address</dd>
      <dd>Listing Source</dd>
    </dl>




    <dl class="includes">
      <dt>Specs</dt>
      <dd>Make</dd>
      <dd>Model</dd>
      <dd>Generation</dd>
      <dd>Engine</dd>
      <dd>Year</dd>
      <dd>Vin</dd>
      <dd>Engine Number</dd>
      <dd>Reg Number</dd>
      <dd>Odometer</dd>
      <dd>Transsmission</dd>
      <dd>Stearing</dd>
      <dd>Exterior</dd>
      <dd>Interior</dd>
      <dd>Body Style</dd>
      <dd>Doors</dd>
    </dl>
    <dl class="options">
      <dt>Sale Info</dt>
      <dd>Sale Tyoe</dd>
      <dd>Seller Type</dd>
      <dd>Sales Status</dd>
      <dd>Lot Number</dd>
      <dd>Currency</dd>
      <dd>Estimate From</dd>
      <dd>Estimate To</dd>
      <dd>Price</dd>
      <dd>Price Type</dd>
      <dd>Auction Start</dd>
      <dd>Auction End</dd>
      <dd>Listing Date</dd>
      <dd>Country</dd>
      <dd>Address</dd>
      <dd>Listing Source</dd>
    </dl>


    <div class="pricing">
      <span class="price Pound">129</span
      ><span class="price-per">per person (based on 8 people)</span>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
.vehicle-summary {
  position: sticky;
  top: 84px;
  & > h1 {
    @include font-size(5);
    @include font-style('header');
  }
  & .icon{
    width: 36px;
    height: 36px;
  }
  dt {
    font-weight: 800;
    text-transform: uppercase;
  }
  & .stars {
    font-size: 28px;
    color: $C1;
  }
  & .review-count {
    font-size: 12px;
    font-weight: 700;
  }
  & .pricing {
    margin: 1rem 0;
  }
  & .price {
    font-size: 48px;
    font-weight: 100;
    margin: 0 0.25rem 0 0;
  }
  & .price-per {
    font-size: 12px;
  }
  & .view-all-anchor {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: $C2;
    cursor: pointer;
    &:hover {
      text-transform: underline;
    }
  }
}
</style>
