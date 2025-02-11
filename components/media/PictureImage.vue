<template>
    <div class="picture-image">
        <!-- Loop over images, rendering a <picture> tag for each -->
        <picture v-for="(image, index) in normalizedImages" :key="index" :class="'image-' + (index + 1)">
            <!-- Render sources only if `src` prop is not provided -->
            <template v-if="!src">
                <source v-for="(source, srcIndex) in normalizedSources" :key="srcIndex" :media="source.media" :srcset="constructSrcSet(source, image._id)" :sizes="sizes || source.sizes || defaultSizes(source.widths)" />
            </template>
            <!-- Fallback image with src from prop or constructed srcset -->
            <img :src="src || constructSrcSet(normalizedSources[0], image._id).split(',')[0].split(' ')[0]" :alt="image.alt || ''" :loading="loading || 'lazy'" />
        </picture>

        <!-- Overlay with slot -->
        <div v-if="$slots.default" class="overlay">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Base URL for image resources
const baseUrl = 'https://media.chillisauce.com/image/upload/';

// Define component props
const props = defineProps<{
    _id?: string;
    id?: string; // Add legacy id prop
    alt?: string;
    src?: string;
    images?: Array<{ _id?: string; id?: string; alt?: string }>; // Support both id types in images
    loading?: 'eager' | 'lazy';
    widths: string;
    sizes?: string;
    increment?: number;
    aspectRatio?: string;
    sources?: Array<{
        media: string;
        sizes?: string;
        widths: string;
        modifiers?: string[];
        aspectRatio?: string;
        increment?: number;
    }>;
}>();

// Emit events to parent component
const emit = defineEmits(['update:src']);

// Return the default `sizes` value based on width range
const defaultSizes = (widthRange: string): string => `${widthRange.split(':')[0]}px`;

// Normalize images array; use props if images prop is empty
const normalizedImages = computed(() => {
    if (props.images?.length) {
        return props.images.map((img) => ({
            _id: img._id || img.id, // Handle both id types
            alt: img.alt
        }));
    }
    return [
        {
            _id: props._id || props.id, // Handle both id types
            alt: props.alt
        }
    ];
});

// Normalize sources array; default to one source if sources prop is empty
const normalizedSources = computed(() => (props.sources?.length ? props.sources : [{ media: '', sizes: defaultSizes(props.widths), widths: props.widths, modifiers: [], aspectRatio: props.aspectRatio ?? '', increment: props.increment ?? 200 }]));

// Helper function to combine default and source-specific modifiers
const mergeModifiers = (source: { modifiers?: string[]; aspectRatio?: string }): string[] => {
    const defaultModifiers = ['c_fill', 'q_auto', 'f_auto', 'dpr_1'];
    return [...defaultModifiers, ...(source.modifiers ?? []), ...(source.aspectRatio ? [`ar_${source.aspectRatio}`] : [])];
};

// Construct the srcset based on widths, modifiers, and increments
const constructSrcSet = (source: { widths: string; modifiers?: string[]; aspectRatio?: string; increment?: number }, imageId: string): string => {
    const [minWidth, maxWidth] = source.widths.split(':').map(Number);
    const step = source.increment || props.increment || 200;
    return Array.from({ length: Math.floor((maxWidth - minWidth) / step) + 1 }, (_, i) => minWidth + i * step)
        .map((width) => `${baseUrl}${[`w_${width}`, ...mergeModifiers(source)].join(',')}/${imageId} ${width}w`)
        .join(', ');
};

// Compute the full-size image src for the fallback img tag
const fullSizeImageModifiers = ['c_fill', 'q_auto', 'f_auto'];
const fullSizeSrc = computed(() => {
    const imageId = props._id || props.id;
    return imageId ? `${baseUrl}${fullSizeImageModifiers.join(',')}/${imageId}` : '';
});

// Emit full-size src to parent component on mount
emit('update:src', fullSizeSrc.value);
</script>

<style lang="scss">
.picture-image {
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
        .heart {
            width: 24px;
            height: 24px;
            position: absolute;
            bottom: 5px;
            right: 5px;
            &.loved svg {
                fill: red;
                stroke: red;
            }
            & svg {
                fill: rgba(150, 150, 150, 0.5);
            }
            &:hover {
                animation: heart-pump 0.75s ease-in-out infinite;
                svg {
                    fill: red;
                    stroke: red;
                }
            }
        }
    }
}
@keyframes heart-pump {
    0% {
        width: 24px;
        height: 24px;
    }
    65% {
        width: 28px;
        height: 28px;
        bottom: 3px;
        right: 3px;
    }
    100% {
        width: 24px;
        height: 24px;
    }
}
</style>
<custom-docs>
USAGE EXAMPLES: 1. Basic Usage (Single Image with ID):
<PictureImage _id="abc123" widths="200:800" />

Renders:
<picture>
<img src="https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_1/abc123" 
         srcset="https://media.chillisauce.com/image/upload/w_200,c_fill,q_auto,f_auto,dpr_1/abc123 200w, 
                 https://media.chillisauce.com/image/upload/w_400,c_fill,q_auto,f_auto,dpr_1/abc123 400w,
                 https://media.chillisauce.com/image/upload/w_600,c_fill,q_auto,f_auto,dpr_1/abc123 600w,
                 https://media.chillisauce.com/image/upload/w_800,c_fill,q_auto,f_auto,dpr_1/abc123 800w"
         loading="lazy"
         alt="">
</picture>

2. Multiple Images Array:
   <PictureImage
       :images="[
           { _id: 'abc123', alt: 'First image' },
           { _id: 'def456', alt: 'Second image' }
       ]"
       widths="200:800"
   />

Renders:

<div class="picture-image">
    <picture class="image-1">
        <!-- srcset for first image -->
    </picture>
    <picture class="image-2">
        <!-- srcset for second image -->
    </picture>
</div>

3. Custom Responsive Sources:
   <PictureImage
       _id="abc123"
       :sources="[
           {
               media: '(min-width: 1024px)',
               widths: '800:1200',
               aspectRatio: '16:9'
           },
           {
               media: '(min-width: 640px)',
               widths: '400:800',
               aspectRatio: '4:3'
           },
           {
               media: '',
               widths: '200:400',
               aspectRatio: '1:1'
           }
       ]"
   />

4. With Custom Overlay:
   <PictureImage _id="abc123" widths="200:800">
    <div class="custom-overlay">
    <h2>Overlay Content</h2>
    </div>
    </PictureImage>
</custom-docs>
