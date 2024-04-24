<template>
  <button
    :id="id"
    :disabled="disabled"
    :data-processing="processing ? '' : null"
    class="side-nav-button"
    :type="buttonType"
  >
    <div class="button-inner">
      <div v-if="icon" class="button-icon">
        <SvgIcon :svg="icon" class="inline" />
      </div>
      <div class="button-text"><slot />{{ text }}</div>
    </div>
  </button>
</template>

<script>
export default {
  props: [
    "id",
    "type",
    "form",
    "disabled",
    "text",
    "icon",
    "processing",
    "processingText",
  ],
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.side-nav-button {
  color: var(--text-color);

  text-transform: uppercase;
  font-family: $ff2;
  width: 300px;
  padding: 0 5px;
  height: 64px;
  cursor: pointer;
  transition: all 0.5s ease-in-out;
  &:hover {
    background-color: var(--bg-color-darkest);
    color: var(--text-color-contrast);
  }
  @include mobile {
    font-size: 15px;
    letter-spacing: 2px;
    font-weight: 600;
  }
  @include desktop {
    font-size: 16px;
    letter-spacing: 2px;
    font-weight: 600;
  }
  & .button-inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: auto;

    & .icon {
      width: 2em;
      height: 2em;
      margin: 0 20px 0;
      & svg path {
        stroke-width: 1px;
      }
    }
  }
  /*
  &[data-processing] {
    cursor: progress;
    // background-image: linear-gradient(to right,  var(--background-color),white, var(--background-color));
    background-image: linear-gradient(to right, var(--background-color), white);
    background-size: 200%;
    animation: processing 2s linear infinite;
  }
  &[disabled] {
    font-size: 12px;
    cursor: not-allowed;
    --background-color: #{$CB-3};
    border: 2px solid var(--background-color);
    background-color: var(--color);
    background-color: $CB-05;
    border-color: $CB-1;
    color: var(--background-color);
    & .disabled-text {
      font-size: 10px;
      text-transform: uppercase;
      color: $CB-6;
    }
  }
  &:hover:not([disabled]) {
    animation: hover-over 2s linear infinite;
  }
  */
}

@keyframes hover-over {
  0% {
    scale: 100%;
  }
  50% {
    scale: 100%;
  }
  100% {
    scale: 100%;
  }
}
</style>
