<template>
  <HeroHeaderWrapper>
    <image-wrapper :images="props.images" :random="props.random" loading="eager"
                   :max="props.max" :min="props.min" :grayscale="props.grayscale"
                   :width="props.width" :height="props.height" :tint="true"
                   :preload-random="true" dpr="1"
                   class="random-tint image-row">
      <BarText :props="props" />
    </image-wrapper>
  </HeroHeaderWrapper>
</template>

<script>
export default {
  props: ['props'],
}
</script>

<style lang="scss">

</style>
