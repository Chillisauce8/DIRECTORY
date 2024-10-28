<template>
  <div class="top-bar-wrapper">
    <slot />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.top-bar-wrapper {
  display: flex;
  width: 100%;
  top: 0;
  z-index: 1;
  position: fixed;
  height: 64px;
  backdrop-filter: blur(10px);
  background-color: var(--bg-color-1);
  opacity: 95%;
  color: var(--text-color-contrast);
  //  @include shadow-soft();
}
</style>
