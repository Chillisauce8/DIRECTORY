<template>
    <picture class="picture-image">
        <template v-if="sizes" v-for="(size, index) in sizes" :key="index">
            <source :media="`(max-width:${size.screen})`" :srcset="basesrc + ',' + size.image + '/' + id" />
        </template>
        <img :src :alt :loading />
    </picture>
    <div v-if="$slots.default" class="overlay" :class="tintClass">
        <slot />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    propIndex: Number,
    alt: String,
    id: String,
    params: String,
    tintClass: String,
    darken: Boolean,
    sizes: Array<Object>,
    loading: {
        type: String || undefined,
        default: 'lazy'
    }
});
const basesrc = 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2';

const src = basesrc + ',' + props.params + '/' + props.id;

if (props.params) {
    const formattedParms = ',' + props.params;
}
</script>

<style lang="scss">
.picture-image {
    padding: 0;
}
/*
$image-border: 5px;

.images.darken img {
    filter: brightness(50%);
}
.images.grayscale img {
    filter: grayscale(70%);
}
.images.darken.grayscale img {
    filter: brightness(50%) grayscale(70%);
}

.images {
    position: relative;
    figure {
        position: relative;
        background-size: cover;
        background-position: center;
        // display: flex; // Needed in some cases can be display: grid as well.
        color: white; // Default white text over image
        height: 100%;
        //  @include aspect-ratio(1, 1); //default square
        > img,
        > div {
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

    > .overlay {
        position: absolute;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        color: white;
    }
    .random-tint {
        background-color: rgba(0, 0, 0, 0.1);
    }
    &.random-tint .tint-1 {
        background-image: radial-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5) 30%, rgba(0, 0, 0, 1) 100%);
    }
    &.random-tint .tint-2 {
        background-image: linear-gradient(to right, rgba(255, 153, 102, 0.6), rgba(255, 94, 98, 0.7));
    }
    &.random-tint .tint-3 {
        background-image: radial-gradient(circle, rgba(4, 171, 191, 0.7) 0%, rgba(0, 74, 83, 0.8) 100%);
    }
    &.random-tint .tint-4 {
        background-image: linear-gradient(to right, rgba(20, 30, 48, 0.7), rgba(36, 59, 85, 0.8));
    }
    &.random-tint .tint-5 {
        background-image: linear-gradient(to right, rgba(44, 62, 80, 0.5), rgba(76, 161, 175, 0.9));
    }
    &.random-tint .tint-6 {
        background-image: linear-gradient(to right, rgba(222, 203, 164, 0.5), rgba(62, 81, 81, 0.9));
    }
    &.random-tint .tint-7 {
        background-image: linear-gradient(to right, rgba(0, 180, 219, 0.5), rgba(0, 131, 176, 0.9));
    }
    &.random-tint .tint-8 {
        background-image: linear-gradient(-20deg, rgba(0, 205, 172, 0.6), rgba(141, 218, 213, 0.95));
    }
    &.random-tint .tint-9 {
        background-image: linear-gradient(to right, rgba(135, 0, 0, 0.7), rgba(25, 10, 5, 0.9));
    }
    &.random-tint .tint-10 {
        background-image: linear-gradient(to right, rgba(255, 81, 47, 0.6), rgba(240, 152, 25, 0.8));
    }
    &.image-row {
        display: flex;
        & figure {
            flex-grow: 1;
        }
    }
    &.image-grid {
        //min-height: 193px; // Needed to fix issue in IOS and Mac Safari
        display: grid;
        grid-gap: $image-border;
        grid-template-columns: repeat(12, 1fr);
        figure {
            //Block of 1
            &:nth-of-type(1):nth-last-of-type(1) {
                grid-column: span 12;
                grid-row: span 1;
            }
            //Block of 2
            &:nth-of-type(1):nth-last-of-type(2) {
                grid-column: span 7;
                grid-row: span 1;
                //     @include aspect-ratio(7, 8);
                //   height: 100%;
            }
            &:nth-of-type(2):nth-last-of-type(1) {
                grid-column: span 5;
                grid-row: span 1;
            }
            //Block of 3
            &:nth-of-type(1):nth-last-of-type(3) {
                //    @include aspect-ratio(1, 1);
                grid-column: span 8;
                grid-row: span 2;
            }
            &:nth-of-type(2):nth-last-of-type(2),
            &:nth-of-type(3):nth-last-of-type(1) {
                grid-column: span 4;
                grid-row: span 1;
            }
            //Block of 4
            &:nth-of-type(1):nth-last-of-type(4) {
                //    @include aspect-ratio(1, 1.15);
                grid-column: span 7;
                grid-row: span 3;
            }
            &:nth-of-type(2):nth-last-of-type(3) {
                grid-column: span 5;
                grid-row: span 2;
            }
            &:nth-of-type(3):nth-last-of-type(2) {
                grid-column: span 3;
                grid-row: span 1;
            }
            &:nth-of-type(4):nth-last-of-type(1) {
                grid-column: span 2;
                grid-row: span 1;
            }
            //Block of 5
            &:nth-of-type(1):nth-last-of-type(5) {
                grid-column: span 7;
                grid-row: span 2;
            }
            &:nth-of-type(2):nth-last-of-type(4) {
                grid-column: span 5;
                grid-row: span 2;
            }
            &:nth-of-type(3):nth-last-of-type(3),
            &:nth-of-type(4):nth-last-of-type(2),
            &:nth-of-type(5):nth-last-of-type(1) {
                //   @include aspect-ratio(3, 2.5);
                grid-column: span 4;
                grid-row: span 1;
            }
            //Block of 6
            &:nth-of-type(1):nth-last-of-type(6) {
                grid-column: span 8;
                grid-row: span 2;
            }
            &:nth-of-type(2):nth-last-of-type(5),
            &:nth-of-type(3):nth-last-of-type(4) {
                grid-column: span 4;
                grid-row: span 1;
            }

            &:nth-of-type(4):nth-last-of-type(3),
            &:nth-of-type(5):nth-last-of-type(2),
            &:nth-of-type(6):nth-last-of-type(1) {
                grid-column: span 4;
                grid-row: span 1;
            }
        }
    }
}
*/
</style>

/* To use, put the image dimensions on 'figure' and use ''.overlay' to design any overlay elements. */
