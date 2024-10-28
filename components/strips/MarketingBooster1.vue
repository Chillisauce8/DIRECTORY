<template>
  <section class="marketing-booster-1 Column-Row">
    <div>Over 2 Million customers</div>
    <div>The Uk's Largest Stag & Hen Organiser</div>
    <div>20 Years Experience</div>
  </section>
</template>

<script>
export default {}
</script>

<style lang="scss">
.marketing-booster-1 {
  color:white;
  padding: 10px;

  background-image: $GBC-4;
  text-align: center;

  & > div {
    font-size: 14px;

    letter-spacing: 5px;
    text-transform: uppercase;
    @include desktop() {
      margin: 0 50px;
    }
    @include mobile() {
      font-size: 10px;
      margin: 5px 5%;
    }
  }
}
</style>
