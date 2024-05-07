<template>
    <div class="images">
        <figure v-for="image in imageArray" :key="image.src">
            <SWPImage :loading="loading" :src="image.src" :alt="image.alt" :width="width" :height="height" :transformToElementSize="transformToElementSize" :preloadRandom="preloadRandom"></SWPImage>
        </figure>

        <div v-if="$slots.default" class="overlay" :class="tintClass">
            <slot />
        </div>
    </div>
</template>

<script>
// import {useImageWrapperRandomisationStore} from '~/store/imageWrapperRandomisationTransfer';

export default {
    props: {
        type: String,
        src: String,
        alt: String,
        cloudinaryId: String,
        images: Array,
        width: Number,
        height: Number,
        tintClass: String,
        min: {
            type: Number,
            default: () => 1
        },
        max: {
            type: Number,
            default: () => 1
        },
        darken: {
            type: Boolean,
            default: () => false
        },
        tint: {
            type: Boolean,
            default: () => false
        },
        preloadRandom: {
            type: Boolean,
            default: () => false
        },
        random: {
            type: Boolean,
            default: () => false
        },
        c: {
            type: String,
            default: () => 'fill'
        },
        q: {
            type: String,
            default: () => 'auto'
        },
        f: {
            type: String,
            default: () => 'auto'
        },
        dpr: {
            type: String,
            default: () => '2'
        },
        loading: {
            type: String,
            default: () => 'lazy'
        },

        transformToElementSize: {
            type: Boolean,
            default: () => false
        }
    },
    watch: {
        src: function (newVal, oldVal) {
            this.onImagePropUpdated();
        },
        images: function (newVal, oldVal) {
            this.onImagePropUpdated();
        },
        cloudinaryId: function (newVal, oldVal) {
            this.onImagePropUpdated();
        }
    },
    setup() {
        return {
            // imageWrapperRandomisationStore: useImageWrapperRandomisationStore(),
            instance: getCurrentInstance()
        };
    },
    data() {
        return {
            needHydrate: false,
            hydrationDone: false,
            amount: 1,
            imageArray: [],
            cloudinaryApiPath: 'https://media.chillisauce.com/image/upload/',
            cloudinaryParams: `c_${this.c},q_${this.q},f_${this.f},dpr_${this.dpr}/`
        };
    },

    methods: {
        onImagePropUpdated() {
            this.init();
            if (!this.hydrationDone) {
                this.needHydrate = true;
            }
        },
        randomItem(array) {
            return array[Math.floor(Math.random() * array.length)];
        },
        randomNumber(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },
        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }

            return array;
        },
        hydrated() {
            this.hydrationDone = true;

            if (this.needHydrate === true) {
                this.needHydrate = false;
                this.init();
            }
        },
        init() {
            this.imageArray.length = 0;
            this.amount = 1;

            if (this.images) {
                if (this.images[0]?.cloudinaryId) {
                    this.images.forEach((element) => {
                        this.imageArray.push({
                            src: this.cloudinaryApiPath + this.cloudinaryParams + element.cloudinaryId,
                            alt: element.alt ?? this.alt ?? 'image'
                        });
                    });
                } else {
                    this.imageArray = this.images;
                }

                // if (this.random) {
                //   const arrayFromStore = this.imageWrapperRandomisationStore.getImagesList(this.getContentForRandomisationStore());
                //
                //   if (arrayFromStore) {
                //     this.imageArray = arrayFromStore;
                //     this.amount = arrayFromStore.length;
                //   } else {
                //     this.imageArray = this.shuffle(this.imageArray);
                //
                //     this.amount = this.randomNumber(this.min, this.max);
                //     this.imageArray.splice(this.amount);
                //
                //     this.imageWrapperRandomisationStore.setImagesList(this.getContentForRandomisationStore(), this.imageArray);
                //   }
                // }
            } else if (this.src) {
                this.imageArray.push({ src: this.src, alt: this.alt ?? 'image' });
            } else if (this.cloudinaryId) {
                this.imageArray.push({
                    src: this.cloudinaryApiPath + this.cloudinaryParams + this.cloudinaryId,
                    alt: this.alt ?? 'image'
                });
            }

            /*   if (this.tint) {
        this.tintClass =
          "tint-" +
          this.imageWrapperRandomisationStore.getOrGenerateTintIndex(
            this.getContentForRandomisationStore()
          );
      }
    */
        },
        getContentForRandomisationStore() {
            return {
                imageList: this.images,
                src: this.src,
                cloudinaryId: this.cloudinaryId
            };
        }
    },
    created() {
        this.init();
    }
};
</script>

<style lang="scss">
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
</style>

/* To use, put the image dimensions on 'figure' and use ''.overlay' to design any overlay elements. */
