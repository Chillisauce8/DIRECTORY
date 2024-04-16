<template>
  <section class="block-wrapper X-Center">
    <slot />
  </section>
</template>

<script>
export default {}
</script>

<style lang="scss">
.block-wrapper {
  padding: 2em;
  background-color: $CB;
  text-align: center;
  & > * {
    margin: 20px 0;
  }
  & h1 {
    font-size: 1.4em;
  }
}
</style>
