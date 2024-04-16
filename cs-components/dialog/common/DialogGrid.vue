<template>
  <section class="dialog-grid">
    <slot />
  </section>
</template>

<script>
export default {}
</script>

<style lang="scss">
.dialog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

}
</style>
