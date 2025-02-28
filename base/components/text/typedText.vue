<template>
  <div :class="{'fast-animation': dataState.fastAnimation}" class="typed-text">
    <slot />
  </div>
</template>

<script lang="ts">
import {reactive} from 'vue';

interface TypedTextProps {
  fastAnimation?: boolean;
}


export default {
  props: ['fastAnimation'],
  setup(props: TypedTextProps) {
    const dataState = reactive({
      fastAnimation: props?.fastAnimation ?? false,
    });

    return {dataState};
  }
}
</script>

<style lang="scss">
.typed-text {
  &.fast-animation {
    animation: typing 1s steps(20, end) .8s forwards, blinking 0.4s 0s 2;
  }
  overflow: hidden;
  border-right: 2px solid transparent;
  white-space: nowrap;
 // animation: typing 1s steps(20, end) 2s forwards, blinking 0.8s 0s 4;
  animation: typing 2s steps(15, end) .8s forwards, blinking 0.8s 0s 10;
  width: 0;
}
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
@keyframes blinking {
  from {
    border-color: currentColor;
  }
  to {
    border-color: transparent;
  }
}
</style>
