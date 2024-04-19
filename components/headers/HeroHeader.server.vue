<template>
  <figure class="hero-header">
    <image-wrapper :images="props.images" :random="props.random" loading="eager"
                   :max="props.max" :min="props.min" :grayscale="props.grayscale"
                   :width="props.width" :height="props.height" :tint="true"
                   :preload-random="true" dpr="1"
                   class="random-tint image-row">
      <BarText :props="props" />
    </image-wrapper>
  </figure>
</template>

<script>
export default {
  props: ['props'],
}
</script>

<style lang="scss">

.hero-header {
  & .images{
    height: 300px;
    width: 100%;
    @include mobile{
      & figure:nth-child(1n+2) {
      display: none;
      }
    }

  }
  & h1 {
    @include font-size(4);
    color: white;
    text-shadow: 1px 1px #000000;
  }

  & h2 {
    @include font-size(0);
    text-shadow: 1px 1px #000000;
  }

  & .overlay {
    text-align: center;

    & > * {
      margin: 0 auto;
    }
  }
}
</style>



