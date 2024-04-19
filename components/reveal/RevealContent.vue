<template>
  <transition
    name="reveal"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <div class="reveal" :class="[open ? 'open' : 'closed']" v-show="open">
      <slot :class="[open ? 'open' : 'closed']" />
    </div>
  </transition>
</template>

<script>
export default {
  props: ['open', 'displayContents'],
  methods: {
    enter(el) {
      el.style.height = 'auto';
      const height = getComputedStyle(el).height;
      el.style.height = 0;

      getComputedStyle(el) // May not be needed https://www.youtube.com/watch?v=zgIshnTiNjM 15:00
      setTimeout(() => {
        el.style.height = height;
      })
    },
    afterEnter(el) {
      el.style.height = 'auto';
    },
    leave(el) {
      el.style.height = getComputedStyle(el).height;
      getComputedStyle(el);
      setTimeout(() => {
        el.style.height = 0;
      })
    },
  },
}
</script>

<style lang="scss">
// PASS mobile or desktop classes to define if the accordion is visible on either
.reveal {
  will-change: height;
  &.reveal-enter-active,
  &.reveal-leave-active {
    transition: all 1s ease;
    overflow: hidden;
  }
  &.reveal-enter,
  &.reveal-leave-to {
    opacity: 0;
    //  transition: all 5s ease;
  }
}
</style>
