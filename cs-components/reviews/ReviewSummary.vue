<template>
    <div
      class="review-summary column Center"
      itemprop="aggregateRating"
      itemscope
      itemtype="https://schema.org/AggregateRating"
    >

      <SvgTrustpilot v-if="trustpilot"  class="trustpilot-logo"/> 
   

      <div class="number" itemprop="ratingValue" v-else>
        {{ reviewScore }}
      </div>
      <NuxtLink to="https://uk.trustpilot.com/review/www.chillisauce.com" target="_blank" rel="noopener" v-if="trustpilot">
      <div class="trustpilot-score"  >
     <div> <SvgTrustpilot45Star class="trustpilot-stars" /> </div> <div class="trust-rating">4.6</div>
    </div>
</NuxtLink>
      <StarRating :stars="reviewScore" class="stars" v-else />
      <div class="reviews">
        <span>from </span>
        <span itemprop="reviewCount">{{ reviewCount }}</span>
        <span> Reviews</span>
      </div>
    </div>
</template>

<script>
export default {
  props: ["reviewScore", "reviewCount", 'trustpilot'],
};
</script>

<style lang="scss">
.review-summary {

  & .number {
    font-size: 72px;
    line-height: 1;
    font-family: $ff2;
  }
  & .stars {
    color: $C1;
    line-height: 1;
    font-size: 48px;
  }
  & .reviews {
    //   font-weight: 800;
  }
  .trustpilot-logo{

  }
  .trustpilot-score{
    display: flex;
    align-items: center;
    .trustpilot-stars{
      margin: 20px;
    }
    .trust-rating{
      font-size: 50px;
    }
    
  }
}
</style>
