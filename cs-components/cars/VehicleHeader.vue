<template>
  <header class="product-header Split W5">
    <div class="media">
      <MediaCarousel class="carousel" id="product-images" />
    </div>
    <div class="Copy">
      <VehicleSummary />
    </div>
  </header>
</template>

<script>
export default {
  props: ['contents'],
}
</script>

<style lang="scss">

</style>
