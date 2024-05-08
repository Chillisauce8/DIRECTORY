<template>
    <section class="content-block">
        <div class="content" :class="layoutClass">
            <div class="left">
                <image-wrapper :images="images" :class="imageClass" loading="lazy" :width="props.width" :height="props.height" dpr="2" />
            </div>
            <div class="right">
                <h2 :class="titleClass">{{ title }}</h2>
                <p v-for="(paragragh, index) in text" :key="index">{{ paragragh }}</p>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
const props = defineProps(['title', 'text', 'images']);
const imageCount = props.images.length;
const titleLength = props.title.length;
const textLength = props.text.length;
console.log(imageCount);
console.log(titleLength);
console.log(textLength);

const getTitleClass = (titleLength) => {
    if (titleLength >= 100) {
        return 'xl';
    } else {
        return 'xxl';
    }
};
const titleClass = getTitleClass(titleLength);

const getImageClass = (imageCount) => {
    if (imageCount < 10) {
        return 'images-' + imageCount;
    } else {
        return 'images-10-plus';
    }
};
const imageClass = getImageClass(imageCount);

const getLayoutClass = (imageCount) => {
    if (imageCount > 1) {
        return 'layout-column';
    } else if ((imageCount = 1)) {
        return 'layout-row';
    } else if ((imageCount = 0)) {
        return 'layout-text';
    }
};
const layoutClass = getLayoutClass(imageCount);
</script>

<style lang="scss">
.content-block {
    background: var(--surface-ground);
    width: 100%;
    padding-top: clamp(10vw, 10vw, 200px);
    .content {
        margin: 0 auto;
        width: clamp(300px, 95%, 1600px);
        display: flex;
        @include mobile {
            flex-direction: column;
            .left {
                margin-bottom: 4rem;
            }
        }
        &.layout-row {
            @include desktop {
                .left,
                .right {
                    width: 50%;
                }
                .left {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
            }
        }
        &.layout-column {
            flex-direction: column;
            @include desktop {
                align-items: flex-end;
                .left,
                .right {
                    width: 75%;
                    p {
                        width: 80%;
                    }
                }
                .left {
                    margin-bottom: 4rem;
                    display: flex;
                }
            }
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin-bottom: 4rem;
        }
        p {
            margin-bottom: 2rem;
        }
        .images-1 {
            .image-1 {
                width: 60%;
                @include aspect-ratio(5, 6);
            }
        }
        .images-2 {
            .image-1 {
                width: 60%;
                @include aspect-ratio(5, 6);
            }
            .image-2 {
                width: 70%;
                @include aspect-ratio(6, 4);
            }
        }
    }
}
</style>
