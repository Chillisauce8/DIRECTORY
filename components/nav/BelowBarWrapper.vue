<template>
  <div class="below-bar-wrapper">
    <slot/>
</div>
</template>

<script>
export default {
}
</script>

<style lang="scss">
.below-bar-wrapper {
  margin-top: 64px;
  display: flex;
  flex-direction: column;
}
</style>
