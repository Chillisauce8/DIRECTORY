<template>
  <LazySvgIcon
    svg="add"
    class="inline reveal-icon"
    :class="[open ? 'open' : 'closed']"
  />
</template>

<script>
export default {
  props: ['open'],
}
</script>

<style lang="scss">
.reveal-icon {
  transition: all 1s ease;
  &.open {
    transform: rotate(135deg);
  }
  &.closed {
    transform: rotate(-180deg);
  }
}
</style>
