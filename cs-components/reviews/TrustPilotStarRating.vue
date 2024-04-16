<template>
<SvgTrustpilotStar class="trustpilot-5-stars" />  

<!--
<div class="trust-pilot-star-rating">
<div class="grey"></div>
<div class="green"></div>
<div class="tp-stars">
  <div>★</div>
  <div>★</div>
  <div>★</div>
  <div>★</div>
  <div>★</div>
</div>

</div>
-->


</template>

<script>
export default {
  props: ["stars"],

  computed: {
    styles() {
      return {
        "--rating": this.stars
      };
    }
  }
};
</script>
<style lang="scss">
.trustpilot-5-stars{
    width: 120px;
    margin: 0 auto;
}

.rating .trust-pilot-star-rating{
    margin: 0 auto;
}

.trust-pilot-star-rating{
    display: flex;
    position: relative;
    font-size: 16px;
    line-height: 1;
    height: 2em;
    width: 10em;
    .grey{
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #dbdce5;
    }
    .green{
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #36aa8c;
    }

.tp-stars {
    position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
  --percent: calc(var(--rating) / 5 * 100%);
// background-color: white;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr; 
  font-family: Times;
  color: white;

  div{
    display: flex;
    justify-content: center;
    align-items: center;
    background-color:transparent;
    width: 2em;
    height: 2em;
    border: solid 0.1em white;
  }
}
  
  
  // make sure ★ appears correctly
 /* &::before {
    font-family: Times;
    content: "☆☆☆☆☆";
  }
  &::after {
    font-family: Times;
    content: "★★★★★";
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    width: var(--percent);
    height: 100%;
    overflow: hidden;
  }
*/
}
</style>
