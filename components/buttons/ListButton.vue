<template>
  <button class="list-button">
    <div class="button-text"><slot />{{ text }}</div>
    <LazySvgIcon svg="chevron-right" class="icon" />
  </button>
</template>

<script>
export default {
  props: ["text"],
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.list-button {
  font-family: $ff2;
  text-transform: uppercase;
  transition: all 0.5s ease-in-out;
  padding: 5px;
  @include scale(font-size, 14px, 18px, 1.5);
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  .icon {
    width: 16px;
  }
  &:hover {
    background-color: $CB-1;
    & .icon {
      color: $C1;
    }
  }
}
</style>
