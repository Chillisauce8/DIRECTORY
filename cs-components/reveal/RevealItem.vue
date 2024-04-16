<template>
  <div class="reveal-item" :class="{ Contents: displayContents }">
    <div
      class="summary"
      @click="onClick()"
      :class="{ Contents: displayContents }"
    >
      <slot name="summary" />
      <span v-if="title">{{ title }}</span>
      <RevealIcon :open="open" v-if="reveal && icon" />
    </div>
    <reveal-content :open="open" v-if="reveal">
      <slot />
    </reveal-content>
    <slot v-else />
  </div>
</template>

<script>
export default {
  props: ['title', 'ifMobile', 'displayContents', 'icon'],
  data() {
    return {
      open: false,
      reveal: null,
      mobile: true,
      window: {
        width: null,
        height: null,
      },
      isMobile: null,
      isDesktop: null,
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize, false);
    this.handleResize()
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    onClick() {
      this.open = !this.open;
    },
    handleResize() {
      this.window.width = window.innerWidth
      this.window.height = window.innerHeight
      if (this.window.width > 960) {
        this.isDesktop = true
        this.isMobile = false
        if (this.ifMobile) {
          this.reveal = false
        } else {
          this.reveal = true
        }
      } else {
        this.isMobile = true
        this.isDesktop = false
        this.reveal = true
      }
    },
  },
}
</script>

<style lang="scss">
.reveal-item {
  &.contents,
  & > .contents {
    display: contents;
  }
  & .summary {
    cursor: pointer;
    & .icon {
      float: right;
    }
  }
}
</style>
