<template>
    <figure class="hero-header">
        <image-wrapper :images="props.images" loading="eager" :width="props.width" :height="props.height" dpr="2" class="darken">
            <div class="content">
                <h1 class="text-1">{{ props.title }}</h1>
                <h2 class="text-2">
                    {{ props.subTitle }}
                </h2>
            </div>
        </image-wrapper>
        <!--<PageNav></PageNav> -->
    </figure>
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
    figure {
        @include parallax(3);
    }
    & .images {
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
