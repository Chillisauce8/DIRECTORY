<template>
    <transition name="reveal" @enter="enter" @after-enter="afterEnter" @leave="leave">
        <div class="reveal" :class="[open ? 'open' : 'closed']" v-show="open" :style="{ '--reveal-duration': duration + 'ms' }">
            <div class="reveal-inner">
                <slot />
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
// Props for controlling the reveal animation
interface Props {
    open: boolean; // Whether content is expanded or collapsed
    duration?: number; // Animation duration in milliseconds
}

withDefaults(defineProps<Props>(), {
    duration: 300
});

// When content is being expanded:
const enter = (el: HTMLElement) => {
    // 1. Find the content wrapper
    const inner = el.querySelector('.reveal-inner') as HTMLElement;
    // 2. Get the final height we're animating to
    const height = inner.offsetHeight;
    // 3. Start at height 0
    el.style.height = '0';
    // 4. Force browser to acknowledge height change
    el.offsetHeight;
    // 5. Animate to final height
    el.style.height = `${height}px`;
};

// After expansion is complete:
const afterEnter = (el: HTMLElement) => {
    // Set height to auto to handle content changes
    el.style.height = 'auto';
};

// When content is being collapsed:
const leave = (el: HTMLElement) => {
    // 1. Lock current height before collapse
    el.style.height = `${el.offsetHeight}px`;
    // 2. Force browser to acknowledge height
    el.offsetHeight;
    // 3. Animate to height 0
    el.style.height = '0';
};
</script>

<style lang="scss">
.reveal {
    will-change: height;
    transition: height var(--reveal-duration) cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &-inner {
        padding: var(--reveal-padding, 1rem);
    }

    &.reveal-enter-active,
    &.reveal-leave-active {
        transition: height var(--reveal-duration) cubic-bezier(0.4, 0, 0.2, 1), opacity var(--reveal-duration) cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.reveal-enter-from,
    &.reveal-leave-to {
        opacity: 0;
    }
}
</style>
