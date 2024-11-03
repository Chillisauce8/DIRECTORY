<template>
    <section class="content-block">
        <div class="content" :class="layoutClass">
            <div class="left">
                <swp-picture :images="images" :class="imageClass" loading="lazy" widths="400:1200" sizes="40vw" />
            </div>
            <div class="right">
                <h2 :class="titleClass">{{ title }}</h2>
                <p v-for="(paragraph, index) in text" :key="index">{{ paragraph }}</p>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
const props = defineProps<{
    title: string;
    text: string[];
    images: { id: string; alt: string }[];
}>();

const imageCount = props.images.length;
const titleLength = props.title.length;
const textLength = props.text.length;

console.log(imageCount);
console.log(titleLength);
console.log(textLength);

const getTitleClass = (titleLength: number) => {
    return titleLength >= 100 ? 'xl' : 'xxl';
};
const titleClass = getTitleClass(titleLength);

const getImageClass = (imageCount: number) => {
    return imageCount < 10 ? `images-${imageCount}` : 'images-10-plus';
};
const imageClass = getImageClass(imageCount);

const getLayoutClass = (imageCount: number) => {
    if (imageCount > 1) {
        return 'layout-column';
    } else if (imageCount === 1) {
        return 'layout-row';
    } else if (imageCount === 0) {
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
        display: flex;
        margin: 0 auto;
        width: clamp(300px, 95%, 1600px);
        @include mobile {
            flex-direction: column;
            .left {
                margin-bottom: 4rem;
            }
        }
        @include desktop {
            &.layout-row {
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
            &.layout-column {
                flex-direction: column;
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
                }
                h2 {
                    font-size: 2.5rem;
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
            width: 100%;
            display: flex;
            overflow-x: visible;

            .image-1 {
                width: 55%;
                @include aspect-ratio(3, 4);
                margin-right: 2%;
            }
            .image-2 {
                width: 63%;
                @include aspect-ratio(3, 2);
            }
        }
    }
}
</style>
