<template>
  <div class="list-wrapper ANIMATE">
    <div
      class="v-hl-btn v-hl-btn-prev slider-only"
      v-if="button && hasPrev"
      @click.stop="prev"
      role="button"
      :class="{ 'v-hl-btn-between': buttonBetween }"
    >
      <slot name="btn-prev">
        <svg
          class="v-hl-svg"
          viewBox="0 0 24 24"
          aria-label="horizontal scroll area navigate to previous button"
        >
          <path
            d="m9.8 12 5 5a1 1 0 1 1-1.4 1.4l-5.7-5.7a1 1 0 0 1 0-1.4l5.7-5.7a1 1 0 0 1 1.4 1.4l-5 5z"
          />
        </svg>
      </slot>
    </div>

    <div
      class="v-hl-btn v-hl-btn-next slider-only"
      v-if="button && hasNext"
      @click.stop="next"
      role="button"
      :class="{ 'v-hl-btn-between': buttonBetween }"
    >
      <slot name="btn-next">
        <svg
          class="v-hl-svg"
          viewBox="0 0 24 24"
          aria-label="horizontal scroll area navigate to next button"
        >
          <path
            d="m14.3 12.1-5-5a1 1 0 0 1 1.4-1.4l5.7 5.7a1 1 0 0 1 0 1.4l-5.7 5.7a1 1 0 0 1-1.4-1.4l5-5z"
          />
        </svg>
      </slot>
    </div>

    <div
      class="v-hl-container slider-only scroll-wrapper"
      ref="container"
      @scroll.passive="onScroll"
      :class="{
        'v-hl-responsive': responsive,
        'v-hl-scroll': scroll,
        'v-hl-snap-start': snap === 'start',
        'v-hl-snap-center': snap === 'center',
        'v-hl-snap-end': snap === 'end',
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
// Compatibility delta due to rounding issues
const delta = 2.5;

interface VueHorizontalData {
  left: number
  width: number
  scrollWidth: number
  hasPrev: boolean
  hasNext: boolean
  hasAfterNext: boolean;
  needToggle: boolean
  debounceId?: number | undefined
}

export default {
  name: 'VueHorizontal',

  data(): VueHorizontalData {
    return {
      left: 0,
      width: 0,
      scrollWidth: 0,
      hasPrev: false,
      hasNext: false,
      hasAfterNext: false,
      needToggle: false,
      debounceId: undefined,
    }
  },
  props: {
    /**
     * Navigation button visibility
     */
    button: {
      type: Boolean,
      default: () => true,
    },
    /**
     * Navigation button alignment, default to  Between the edge of the horizontal axis.
     */
    buttonBetween: {
      type: Boolean,
      default: () => true,
    },
    /**
     * Scrollbar visibility
     */
    scroll: {
      type: Boolean,
      default: () => false,
    },
    /**
     * Use default responsive breakpoint.
     */
    responsive: {
      type: Boolean,
      default: () => false,
    },
    /**
     * Move window, indicates the percent of width to travel when nav is triggered.
     */
    displacement: {
      type: Number,
      default: () => 1.0,
    },
    /**
     * Snap to start|center|end
     */
    snap: {
      type: String,
      default: () => 'start',
    },
  },
  mounted() {
    nextTick(() => this.onScrollDebounce());
  },
  updated() {
    nextTick(() => {
      this.onScrollDebounce();
    });
  },
  onBeforeUnmount() {
    clearTimeout(this.debounceId);
  },
  methods: {
    children(): HTMLCollection {
      const container = this.$refs.container as Element
      return container?.children;
    },

    findPrevSlot(x: number): Element | undefined {
      const children = this.children()
      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect()
        if (rect.left <= x && x <= rect.right) {
          return children[i]
        }
        if (x <= rect.left) {
          return children[i]
        }
      }
    },

    findNextSlot(x: number): Element | undefined {
      const children = this.children()
      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect()
        if (rect.right <= x) {
          continue
        } else if (rect.left <= x) {
          return children[i]
        }
        if (x <= rect.left) {
          return children[i]
        }
      }
    },
    /**
     * Toggle and scroll to the previous set of horizontal content.
     */
    prev(): void {
      this.$emit('prev')
      const container = this.$refs.container as Element
      const left = container.getBoundingClientRect().left
      const x = left + container.clientWidth * -this.displacement - delta
      const element = this.findPrevSlot(x)
      if (element) {
        const width = element.getBoundingClientRect().left - left
        this.scrollToLeft(container.scrollLeft + width)
        return
      }
      const width = container.clientWidth * this.displacement
      this.scrollToLeft(container.scrollLeft - width)
    },
    /**
     * Toggle and scroll to the next set of horizontal content.
     */
    next(): void {
      this.$emit('next')
      const container = this.$refs.container as Element
      const left = container.getBoundingClientRect().left
      const x = left + container.clientWidth * this.displacement + delta
      const element = this.findNextSlot(x)
      if (element) {
        const width = element.getBoundingClientRect().left - left
        if (width > delta) {
          this.scrollToLeft(container.scrollLeft + width)
          return
        }
      }
      const width = container.clientWidth * this.displacement
      this.scrollToLeft(container.scrollLeft + width)
    },
    /**
     * Index of the slots to scroll to.
     * @param {number} i index
     */
    scrollToIndex(i: number): void {
      const children = this.children()
      if (children[i]) {
        const container = this.$refs.container as Element
        const rect = children[i].getBoundingClientRect()
        const left = rect.left - container.getBoundingClientRect().left
        this.scrollToLeft(container.scrollLeft + left)
      }
    },
    /**
     * Amount of pixel to scroll to on the left.
     * @param {number} left of the horizontal
     * @param {'smooth' | 'auto} [behavior='smooth']
     */
    scrollToLeft(left: number, behavior: 'smooth' | 'auto' = 'smooth'): void {
      const element = this.$refs.container as Element
      element.scrollTo({ left: left, behavior: behavior })
    },

    onScroll(): void {
      const container = this.$refs.container as Element;
      // Resolves https://github.com/fuxingloh/vue-horizontal/issues/99#issue-862691647

      if (!container) return;

      this.$emit('scroll', {
        left: container.scrollLeft,
      });

      clearTimeout(this.debounceId);
      // @ts-ignore
      this.debounceId = setTimeout(this.onScrollDebounce, 100);
    },

    onScrollDebounce(): void {
      this.refresh((data) => {
        this.$emit('scroll-debounce', data);
      })
    },
    /**
     * Manually refresh vue-horizontal
     * @param {(data: VueHorizontalData) => void} [callback] after refreshed, optional
     */
    refresh(callback?: (data: VueHorizontalData) => void): void {
      this.$nextTick(() => {
        const data = this.calculate()

        if (this.hasNext && (!data.hasNext || !data.hasAfterNext)) {
          this.$emit('getNextData');
        }

        this.left = data.left
        this.width = data.width
        this.scrollWidth = data.scrollWidth
        this.hasNext = data.hasNext
        this.hasAfterNext = data.hasAfterNext
        this.hasPrev = data.hasPrev
        callback?.(data);

        this.$emit('needToggle', data.needToggle);
      })
    },

    calculate(): VueHorizontalData {
      const container = this.$refs.container as Element;
      const firstChild = this.children()?.[0];

      function hasNext(): boolean {
        return (
          container.scrollWidth >
          container.scrollLeft + container.clientWidth + delta
        )
      }

      function hasAfterNext(): boolean {
        return (
          container.scrollWidth >
          container.scrollLeft + (container.clientWidth * 2) + delta
        )
      }

      function hasPrev(): boolean {
        if (container.scrollLeft === 0) {
          return false
        }
        const containerVWLeft = container.getBoundingClientRect().left
        const firstChildLeft = firstChild?.getBoundingClientRect()?.left ?? 0
        return Math.abs(containerVWLeft - firstChildLeft) >= delta
      }

      function needToggle(): boolean {
        return container.scrollWidth > container.clientWidth;
      }

    //  console.log("Scroll Left: " + container.scrollLeft);
    //  console.log("Client Width: " + container.clientWidth);
   //   console.log("Scroll Width: " + container.scrollWidth);
      return {
        left: container.scrollLeft,
        width: container.clientWidth,
        scrollWidth: container.scrollWidth,
        hasNext: hasNext(),
        hasAfterNext: hasAfterNext(),
        hasPrev: hasPrev(),
        needToggle: needToggle(),
      }
    },
  },
}
</script>

<style lang="scss">
$grid-gap-mobile: 10px;
$grid-gap-desktop: 20px;
$grid-gap-breakpoint: 800px;
$grid-background-color: $CB-1;
$grid-min-card-width: 300px;
$stars-color: $C1;

.list-wrapper {
  // transition: 1s all ease-in-out;
  &.grid {
    @include no-slider();
    animation: showGrid 1s ease-in-out 0s both;
    display: grid;
    height: auto;
    justify-content: center;
    & .card{
      margin: 0 auto;
     // max-width: 450px; // Stops items expanding to full width - NEEDS ADDITIONAL FIX
    }
    &.closing {
      animation: hideGrid 1s ease-in-out 0s both;
    }

    grid-template-columns: repeat(auto-fit, minmax($grid-min-card-width, 1fr));

    @media (max-width: $grid-gap-breakpoint) {
      grid-gap: $grid-gap-mobile;
      padding: $grid-gap-mobile;
    }
    @media (min-width: $grid-gap-breakpoint) {
      grid-gap: $grid-gap-desktop;
      padding: $grid-gap-desktop;
    }
    //   background-color: $grid-background-color !important;
    //  grid-auto-rows: max-content;
  }
  // If it isn't a slider, then remove / ignore a few html tags.
  &.slider {
    @include slider();
    margin-left: 10px; // May need fixing up??
  }
  &.slider-mobile {
    @include mobile {
      @include slider();
    }
    @include desktop {
      @include no-slider();
    }
  }
}

@keyframes showGrid {
  0% {
    //  display: flex;
    opacity: 0;
    transform: scale(0);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes hideGrid {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0);
  }
}

@keyframes showSliderMobile {
  0% {
   // transform: translate(20vw, 0);
    opacity: 0;
  }
  100% {
    opacity: 1;
    transform: scale(1);
    transform: translate(0, 0);
  }
}


@keyframes showSlider {
  0% {
    transform: translate(20vw, 0);
    opacity: 0;
  }
  1% {
    //   display: flex;
    opacity: 0;
    //   transform: scale(0);

    // transform-origin: right;
  }
  100% {
    opacity: 1;
    transform: scale(1);
    transform: translate(0, 0);
  }
}
</style>
