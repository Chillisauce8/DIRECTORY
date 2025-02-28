<template>
      <button class="close-button">
        <LazySvgIcon svg="close" class="close-icon" />
      </button>
</template>

<script>
export default {}
</script>

<style lang="scss">
     .close-button {
      cursor: pointer;
      width: 64px;
      height: 64px;
      &:hover .close-icon {
        transform: rotateZ(90deg);
        transition: all 0.5s ease;
      }
      & .close-icon {
        width: 32px;
        height: 32px;
        margin: 16px;
      }
    }
</style>
