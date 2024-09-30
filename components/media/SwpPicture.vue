<template>
    <div class="swp-picture">
        <picture v-for="(image, index) in normalizedImages" :key="index" :class="'image-' + (index + 1)">
            <!-- Iterate over the normalized sources -->
            <source v-for="(source, srcIndex) in normalizedSources" :key="srcIndex" :media="source.media" :srcset="constructSrcSet(source, image.id)" :sizes="sizes || source.sizes || defaultSizes(source.widths)" />
            <!-- Fallback image src -->
            <img :src="constructSrcSet(normalizedSources[0], image.id).split(',')[0].split(' ')[0]" :alt="image.alt || ''" :loading="loading || 'lazy'" />
        </picture>

        <div v-if="$slots.default" class="overlay test">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
const baseUrl = 'https://media.chillisauce.com/image/upload/'; // Base URL for images

// Props definition
const props = defineProps<{
    id?: string; // Optional single image id
    alt?: string; // Optional alt text for single image
    images?: Array<{ id: string; alt?: string }>; // Array of image objects
    loading?: 'eager' | 'lazy'; // Defaults to lazy
    modifiers?: string[]; // General modifiers for images
    widths: string; // Required, range of widths like "400:2000"
    sizes?: string; // Added sizes prop
    increment?: number; // Optional increment for width steps, defaults to 200
    aspectRatio?: string; // Optional global aspect ratio
    sources?: Array<{
        media: string; // Media query for the source
        sizes?: string; // Optional sizes, default to first width in pixels
        widths: string; // Width range for the source
        modifiers?: string[]; // Optional modifiers for the source
        aspectRatio?: string; // Optional aspect ratio for the source
        increment?: number; // Source-specific increment, fallback to global or default
    }>;
}>();

// Default sizes based on first width in range
const defaultSizes = (widthRange: string): string => `${widthRange.split(':')[0]}px`;

// Create a normalized images array from either images array or single id/alt
const normalizedImages = computed(() => (props.images?.length ? props.images : [{ id: props.id!, alt: props.alt }]));

// Normalize sources or create default source from provided props
const normalizedSources = computed(() =>
    props.sources?.length
        ? props.sources
        : [
              {
                  media: '',
                  sizes: defaultSizes(props.widths),
                  widths: props.widths,
                  modifiers: props.modifiers ?? [],
                  aspectRatio: props.aspectRatio ?? '',
                  increment: props.increment ?? 200
              }
          ]
);

// Merge default and custom modifiers
const mergeModifiers = (source: { modifiers?: string[]; aspectRatio?: string }): string[] => {
    const defaultModifiers = ['c_fill', 'q_auto', 'f_auto', 'dpr_1'];
    return [...defaultModifiers, ...(props.modifiers ?? []), ...(source.modifiers ?? []), ...(source.aspectRatio ? [`ar_${source.aspectRatio}`] : [])];
};

// Construct srcset from width range, modifiers, and image id
const constructSrcSet = (source: { widths: string; modifiers?: string[]; aspectRatio?: string; increment?: number }, imageId: string): string => {
    const [minWidth, maxWidth] = source.widths.split(':').map(Number);
    const step = source.increment || props.increment || 200;
    return Array.from({ length: Math.floor((maxWidth - minWidth) / step) + 1 }, (_, i) => minWidth + i * step)
        .map((width) => `${baseUrl}${[`w_${width}`, ...mergeModifiers(source)].join(',')}/${imageId} ${width}w`)
        .join(', ');
};
</script>

<style lang="scss">
.swp-picture {
    position: relative;
    &.darken img {
        filter: brightness(50%);
    }
    &.grayscale img {
        filter: grayscale(70%);
    }
    &.darken.grayscale img {
        filter: brightness(50%) grayscale(70%);
    }

    picture {
        position: relative; //Not Needed??? - these 3 don't seem to do anything.
        background-size: cover;
        background-position: center;

        color: white; // Default white text over image
        height: 100%;
        display: block;
        > img {
            position: absolute;
            top: 0px;
            right: 0px;
            bottom: 0px;
            left: 0px;
            object-fit: cover;
            width: 100%;
            height: 100%;
        }
    }
    .overlay {
        position: absolute;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        color: white;
    }
}
</style>

/* To use, put the image dimensions on 'picture' and use ''.overlay' to design any overlay elements. */
