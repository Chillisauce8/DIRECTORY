<template>
    <div class="hero-header">
        <picture-image :images="props.images" :sources="props.sources" :widths="props.widths" loading="eager" class="darken">
            <div class="content">
                <h1 class="text-1">{{ props.title }}</h1>
                <h2 class="text-2">
                    {{ props.subTitle }}
                </h2>
            </div>
        </picture-image>

        <!--<PageNav></PageNav> -->
    </div>
</template>

<script>
export default {
    props: ['props']
};
</script>

<style lang="scss">
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
                // color: white;
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
                @include font-size(0);
                @include parallax(-2);
            }
        }
    }
}
</style>
