<template>
    <div class="reveal-item" :class="{ contents: displayContents }">
        <div class="summary" @click="onClick" :class="{ contents: displayContents, active: open }">
            <slot name="summary" />
            <span v-if="title">{{ title }}</span>
            <RevealIcon v-if="shouldShowIcon" :open="open" class="icon" />
        </div>
        <reveal-content v-if="shouldReveal" :open="open">
            <slot />
        </reveal-content>
        <slot v-else />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWindowSize } from '~/composables/useWindowSize';

// Define the expected props and their types
interface Props {
    title?: string; // Optional text to show in the header
    ifMobile?: boolean; // If true, only shows as accordion on mobile
    displayContents?: boolean; // If true, removes container styling
    icon?: boolean; // Whether to show the expand/collapse icon
}

// Set default values for props
const props = withDefaults(defineProps<Props>(), {
    ifMobile: false,
    displayContents: false,
    icon: true
});

// Track if content is expanded or collapsed
const open = ref(false);
// Get current device type (mobile/desktop)
const { isMobile } = useWindowSize();

// Determine if content should be shown as expandable accordion
const shouldReveal = computed(
    () =>
        // Show as accordion if we're on mobile OR if it's not mobile-only
        isMobile.value || !props.ifMobile
);

// Determine if expand/collapse icon should be visible
const shouldShowIcon = computed(() => props.icon && shouldReveal.value);

// Toggle expanded/collapsed state
const onClick = () => {
    open.value = !open.value;
};
</script>

<style lang="scss">
.reveal-item {
    &.contents,
    & > .contents {
        display: contents;
    }
    & .summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        gap: 1rem;
        transition: background-color 0.3s ease;

        &.active {
            background-color: var(--reveal-active-bg, rgba(0, 0, 0, 0.05));
        }
    }
}
</style>
