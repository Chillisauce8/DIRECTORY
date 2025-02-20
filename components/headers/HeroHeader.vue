<template>
    <div class="hero-header">
        <picture-image :images="props.images" :sources="props.sources" :widths="props.widths" loading="eager" class="darken">
            <div class="content" v-if="props.title || props.subTitle">
                <h1 class="title" v-if="props.title">{{ props.title }}</h1>
                <h2 class="sub-title" v-if="props.subTitle">
                    {{ props.subTitle }}
                </h2>
            </div>
            <slot />
        </picture-image>
    </div>
</template>

<script setup lang="ts">
interface Props {
    props: {
        title?: string;
        subTitle?: string;
        widths: string;
        images: Array<{
            _id: string;
            alt: string;
        }>;
        sources: Array<{
            media: string;
            aspectRatio: string;
            widths: string;
            sizes: string;
            increment: number;
        }>;
    }
}

defineProps<Props>();
</script>

<style lang="scss">
// No need for imports - they're available globally
.hero-header {
    position: relative;
    z-index: -1;
    figure,
    picture {
        @include parallax(3);

    }
    & .images,
    .picture-image {
        height: 120vh;
        width: auto;
    }
    .overlay {
        display: flex;
        flex-direction: row;
        justify-content: right;
        .content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 50%;
            padding-right: 5%;
            h1,
            h2 {
                color: white;
            }
            h1 {
                @include scale('font-size', 40px, 60px, 1.2);
                @include parallax(-2);
      
            }
            .make h1 {
                position: absolute;
                left: 0;
                bottom: 0;
                background-color: black;
                @include scale('font-size', 24px, 48px, 1.1);
                padding: 0 0.5em 0;
            }

            h2 {
                @include scale('font-size', 18px, 32px, 1.1);
                @include parallax(-2);

            }
        }
    }
}
</style>
