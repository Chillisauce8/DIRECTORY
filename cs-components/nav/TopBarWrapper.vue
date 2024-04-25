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

  @include frosted-glass();
  @include shadow-soft();
}
</style>
