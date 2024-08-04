<template>
    <card-wrapper class="model-card standard-card">
        <image-wrapper v-if="images" :images="images" :max="1" :width="290" :height="145" loading="lazy"> </image-wrapper>
        <card-text-wrapper>
            <h1 class="name">
                <div class="make">{{ make }}</div>
                <div class="name">{{ name }}</div>
            </h1>
            <div class="years">{{ years[0] }} to {{ years[years.length - 1] }}</div>
        </card-text-wrapper>
    </card-wrapper>
</template>

<script setup lang="ts">
const props = defineProps(['images', 'name', 'make', 'years']);
</script>

<style lang="scss">
.model-card {
    width: 300px;
    figure {
        @include aspect-ratio(3, 2);
    }
    header {
        @include aspect-ratio(3, 2);
        //     min-height: 150px;
    }

    .make {
        font-family: $ff2;
        font-size: 12px;
        font-weight: 600;
    }
    .name {
        font-family: $ff2;
        font-size: 16px;
        font-weight: 100;
    }

    .years {
        font-family: $ff2;
        font-size: 14px;
        font-weight: 100;
    }
    .price {
        font-size: 14px;
        font-weight: 400;
    }
    .heart {
        width: 24px;
        height: 24px;
        position: absolute;
        bottom: 5px;
        right: 5px;
        & svg {
            fill: rgba(150, 150, 150, 0.5);
        }
        &:hover svg {
            fill: red;
            stroke: grey;
        }
    }
    .specs span:not(:last-child):after {
        content: ' · ';
    }
    .location {
        padding: 0 5px 0;
        background: rgba(0, 0, 0, 0.5);
        position: absolute;
        bottom: 0px;
        left: 0px;
    }
}
</style>
