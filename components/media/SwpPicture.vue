<template>
    <div class="swp-picture">
        <picture v-for="(image, index) in normalizedImages" :key="index" :class="'image-' + (index + 1)">
            <!-- Conditionally render sources only if src prop is not provided -->
            <template v-if="!src">
                <source v-for="(source, srcIndex) in normalizedSources" :key="srcIndex" :media="source.media" :srcset="constructSrcSet(source, image.id)" :sizes="sizes || source.sizes || defaultSizes(source.widths)" />
            </template>
            <!-- Fallback image src -->
            <img :src="src || constructSrcSet(normalizedSources[0], image.id).split(',')[0].split(' ')[0]" :alt="image.alt || ''" :loading="loading || 'lazy'" />
        </picture>

        <div v-if="$slots.default || loveable || mode" class="overlay">
            <slot />
            <div v-if="mode" class="mode-icons">
                <SvgIcon v-if="mode === 'select'" svg="check-circle" class="select" />
                <SvgIcon v-if="mode === 'edit'" svg="edit" class="edit" />
                <SvgIcon v-if="mode === 'view'" svg="eye" class="view" />
            </div>
            <SvgIcon v-if="loveable" svg="heart" class="heart" :class="{ loved: isLoved }" @click="toggleLoved" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const baseUrl = 'https://media.chillisauce.com/image/upload/';

const props = defineProps<{
    loveable?: boolean;
    loved?: boolean;
    mode?: 'view' | 'select' | 'edit';
    selected?: boolean;
    id?: string;
    alt?: string;
    src?: string;
    images?: Array<{ id: string; alt?: string }>;
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

const emit = defineEmits(['update:src', 'update:loved']);

// Track local "loved" state
const isLoved = ref(props.loved ?? false);

// Watch for changes in the prop and update local state accordingly
watch(
    () => props.loved,
    (newVal) => {
        isLoved.value = newVal ?? false;
    }
);

// Toggle the "loved" state and emit an event to inform the parent component
const toggleLoved = () => {
    isLoved.value = !isLoved.value;
    emit('update:loved', isLoved.value);
};

// Hardcoded modifiers for the full-size image
const fullSizeImageModifiers = ['c_fill', 'q_auto', 'f_auto'];

// Construct the full-size src URL without using any props for modifiers
const fullSizeSrc = computed(() => {
    if (props.id) {
        return `${baseUrl}${fullSizeImageModifiers.join(',')}/${props.id}`;
    }
    return '';
});

// Emit the full-size src to the parent component
emit('update:src', fullSizeSrc.value);

const defaultSizes = (widthRange: string): string => `${widthRange.split(':')[0]}px`;

const normalizedImages = computed(() => (props.images?.length ? props.images : [{ id: props.id!, alt: props.alt }]));

const normalizedSources = computed(() =>
    props.sources?.length
        ? props.sources
        : [
              {
                  media: '',
                  sizes: defaultSizes(props.widths),
                  widths: props.widths,
                  modifiers: [],
                  aspectRatio: props.aspectRatio ?? '',
                  increment: props.increment ?? 200
              }
          ]
);

const mergeModifiers = (source: { modifiers?: string[]; aspectRatio?: string }): string[] => {
    const defaultModifiers = ['c_fill', 'q_auto', 'f_auto', 'dpr_1'];
    return [...defaultModifiers, ...(source.modifiers ?? []), ...(source.aspectRatio ? [`ar_${source.aspectRatio}`] : [])];
};

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

/* To use, put the image dimensions on 'picture' and use ''.overlay' to design any overlay elements. */
