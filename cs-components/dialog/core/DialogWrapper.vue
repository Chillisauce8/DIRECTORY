<template>
  <div class="dialog-wrapper column Center">
    <slot />
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
.dialog-wrapper {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 20, 0.8);
  z-index: 10000;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
