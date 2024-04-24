<template>
  <figure class="hero-header">
    <image-wrapper
      :images="props.images"
      :random="props.random"
      loading="eager"
      :max="props.max"
      :min="props.min"
      :grayscale="props.grayscale"
      :width="props.width"
      :height="props.height"
      :tint="true"
      :tintClass="props.tintClass"
      :preload-random="true"
      dpr="2"
      class="random-tint image-row"
      :class="props.style"
    >
      <h1 class="text-1">{{ props.title }}</h1>
      <h2 class="text-2">
        {{ props.subTitle }}
      </h2>
    </image-wrapper>
    <PageNav></PageNav>
  </figure>
</template>

<script>
export default {
  props: ["props"],
};
</script>

<style lang="scss">
.hero-header {
  & .images {
    height: 500px;
    width: auto;
    @include mobile {
      & figure:nth-child(1n + 2) {
        display: none;
      }
    }
  }
  & h1 {
    // @include font-size(7);
    @include scale("font-size", 40px, 60px, 1.2);
    color: white;
    //    text-shadow: 1px 1px #000000;
  }
  & .make h1 {
    position: absolute;
    left: 0;
    bottom: 0;
    background-color: black;
    @include scale("font-size", 24px, 48px, 1.1);
    padding: 0 0.5em 0;
  }

  & h2 {
    @include font-size(0);
    //   text-shadow: 1px 1px #000000;
  }

  & .overlay {
    text-align: center;

    & > * {
      margin: 0 auto;
    }
  }
}
</style>
