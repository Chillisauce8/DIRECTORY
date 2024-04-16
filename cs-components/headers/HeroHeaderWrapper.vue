<template>
  <header class="hero-header-wrapper">
 <slot/>
  </header>
</template>

<script>
export default {
  props: ['props'],
}
</script>

<style lang="scss">
.hero-header-wrapper {
  &.location-header .images {
    @include desktop {
      height: 50vh;
    }
    @include mobile{
      height: 60vh;
    }
  }
  &.location-header.size-test .images {
    @include mobile{
      height: 300px;
    }
  }
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
