<template>
    <div
      class="tool-helper"
      :class="{ hidden: !open, open: open }"
    >
      <div class="message">
        <LazySvgIcon v-if="point === 'up'" svg="drawn-arrow-2" :class="[point, position]" />
        <p v-if="title">{{ title }}</p>
        <slot />
      </div>
      <button v-if="closeButton"
        class="button-wrapper"
        @blur="open=false"
        @click="open=!open"
        :class="{ hidden: !open, open: open }"
      >
        Got It! - Close
      </button>
      <LazySvgIcon v-if="point === 'down'" svg="drawn-arrow-2" :class="[point, position]" />
    </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: false,
    },
    point: {
      type: String,
      required: false,
    },
    position: {
      type: String,
      required: false,
    },
    closeButton: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data() {
    return {
      open: true,
    };
  },
};
</script>

<style lang="scss">
.tool-helper {
    z-index: -1;
 position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  line-height:1.3;
  color: white;
  max-height: 500px;
  transition: all 0.5s ease-in-out;
  padding: 10px;
  border-radius: 3px;
  overflow: visible;
  //  @include frosted-glass-darker();
  @include desktop{
    font-size: 14px;
  }
  @include mobile{
    font-size: 12px;
  }
  & p {
    font-size: 14px;
    font-weight: 600;
    font-family: $ff2;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 5px;
   
  }
  &.hidden {
    max-height: 0px;
    padding: 0px;
    overflow: hidden;
  }
  button {
    background-color: $C2;
    padding: 5px 10px;
    margin: 0 auto;
    color: inherit;
    margin-top: 10px;
    border-radius: 3px;
  }
  .icon {
    width: 50px;
    height: 50px;
    position: relative;
    &.down {
      position:absolute; 
      bottom: -20px;
      transform: rotate(-20deg);
    }
    &.up{
        position:absolute;
        transform: rotate(-180deg);
    }
    &.left{
        left: 20%;
        transform: rotate(5deg);
    }
    &.right{
        left: 65%;
    }
  }
}
</style>
