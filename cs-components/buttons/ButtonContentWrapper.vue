<template>
  <div class="button-content-wrapper" :class="{ disabled: disabled}">
    <slot name="main" />
    <div class="expandable">
      <slot name="expandable" />
    </div>
  </div>
</template>

<script>
export default {
  props: ['disabled'],
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.button-content-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  & button,
  & .expandable {
    color: currentColor;
    font-size: inherit;
    text-transform: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    background-color: inherit;
  }
  & .expandable{
    background-color: $CB-2;
  }
  &.disabled .icon{
    display: none;
  }

  &:not(.disabled) button {
    margin-bottom: 0.5em;
   border: 2px solid $CB-1;
    display: flex;
    justify-content: space-between;
    border-radius: 3px;
    padding: 0.5em 1em;
    cursor: pointer;
    user-select: none;
    transition: all 1s ease;
    &.open {
      .icon {
        transition: all 1s ease-in;
        rotate: 180deg;
      }
    }
    &.hidden {
      .icon {
        transition: all 1s ease;
        rotate: 360deg;
      }
    }
    & .button-icon {
      width: 1.2em;
      height: 1.2em;
      margin-left: 1em;
      & svg path {
        stroke-width: 1.5px;
      }
    }
  }
  &.disabled .expandable {
    display: none;
  }
  &:not(.disabled) .expandable {
    background-color: $CB-7;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 10;
    transition: all 1s ease;
    .option-wrapper {
      transition: all 1s ease;
      &.open {
        height: 200px;
        width: 100%;
        overflow-y: auto;
        padding-bottom: 0.6em;
      }
      &.hidden {
        height: 0px;
        overflow: hidden;
      }
      .option {
        padding-left: 1em;
        cursor: pointer;
        user-select: none;
        &.selected {
          background: $CB-5;
        }
        &:hover {
          background: $CB-4;
        }
      }
    }
  }
}
@keyframes button-hover {
  0% {
    background: linear-gradient(to bottom right, #48b1bf, #06beb6);
    opacity: 0.1;
  }
  100% {
    opacity: 1;
  }
}
</style>
