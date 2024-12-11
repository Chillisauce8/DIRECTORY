<template>
    <component :is="button ? 'button' : 'div'" class="svg-icon" :class="svg">
        <i v-html="iconContent" class="icon" />
        <!-- Display label if it's defined, using the class based on labelPosition -->
        <div v-if="label" class="label" :class="labelPosition">{{ label }}</div>
    </component>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

// Define types for props
interface SvgIconProps {
    svg: string;
    label?: string;
    labelPosition?: 'hover' | 'row' | 'column';
    button?: boolean;
}

// Use defineProps with explicit types
const props = defineProps<SvgIconProps>();

// Icon content as a ref to store SVG markup
const iconContent = ref<string>('');

// Fallback SVG content for missing icons
const fallbackSvg: string = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" d="M7.5 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16.5 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM10.5 9.5h3M7.5 19a4.5 4.5 0 1 1 9 0"/>
  <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" d="M12 23.5c6.351 0 11.5-5.149 11.5-11.5S18.351.5 12 .5.5 5.649.5 12 5.649 23.5 12 23.5ZM.5 5l4.248 3.304M23.5 5l-4.248 3.304"/>
  <path d="M8 9.25a.25.25 0 0 1 0-.5M8 9.25a.25.25 0 0 0 0-.5"/>
  <g>
    <path d="M17 9.25a.25.25 0 1 1 0-.5M17 9.25a.25.25 0 1 0 0-.5"/>
  </g>
</svg>
`;

// Load icon content or fallback SVG if unavailable
const loadIcon = async (): Promise<void> => {
    try {
        const response = await fetch(`/icons/${props.svg}.svg`);
        const contentType = response.headers.get('content-type');

        if (response.ok && contentType && contentType.includes('image/svg+xml')) {
            iconContent.value = await response.text();
        } else {
            console.warn(`Icon ${props.svg} not found or invalid content type. Using fallback icon.`);
            iconContent.value = fallbackSvg;
        }
    } catch (error) {
        console.error(`Error loading icon ${props.svg}`, error);
        iconContent.value = fallbackSvg;
    }
};

// Load icon on mount and watch for `svg` prop changes
onMounted(loadIcon);
watch(() => props.svg, loadIcon);
</script>

<style lang="scss">
.svg-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: visible; /* Ensure label isn't cut off */
    .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        svg {
            width: 100%;
            height: 100%;
            stroke: currentColor;
            stroke-width: 1;
            fill: none;
        }
        &.fill svg {
            fill: currentColor;
        }
        &.rotate-90 {
            transform: rotate(90deg);
        }
        &.rotate-180 {
            transform: rotate(180deg);
        }
        &.rotate-270 {
            transform: rotate(270deg);
        }
        &.inline {
            display: inline-block;
            position: relative;
            top: 0.2em;
        }
    }
    .label {
        font-size: 0.75em;
        margin-top: 1em;
        padding: 0.2em 0.5em;
        border-radius: 0.2em;
        &.hover {
            transition: all 1s ease;
            opacity: 0;
            background-color: var(--background-inverted);
            color: var(--color-inverted);
            position: absolute;
            bottom: -36px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            z-index: 1; /* Ensure it shows above other content */
        }
        &.row {
            display: flex;
            align-items: center;
        }

        &.column {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }

    &:hover .label.hover {
        opacity: 1;
    }
}
</style>
