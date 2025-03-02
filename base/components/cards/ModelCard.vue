<template>
    <BaseCard :data-item="cardData" collection="models" :grid-id="gridId" image-id-path="" class="model-card">
        <template #card-content>
            <h1 class="name">
                <div class="make">{{ make }}</div>
                <div class="name">{{ name }}</div>
            </h1>
            <div class="years">{{ years[0] }} to {{ years[years.length - 1] }}</div>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
const props = defineProps(['images', 'name', 'make', 'years', 'gridId']);

// Create a data object that matches what BaseCard expects
const cardData = {
    _id: props.images?.[0] || 'default-id',
    name: props.name
    // Add any other properties BaseCard needs
};
</script>

<style lang="scss">
.model-card {
    width: 300px;
    figure {
        aspect-ratio: 3 / 2;
    }
    header {
        aspect-ratio: 3 / 2;
        //     min-height: 150px;
    }

    .make {
        font-family: var(--primary-font-family);
        font-size: 12px;
        font-weight: 600;
    }
    .name {
        font-family: var(--primary-font-family);
        font-size: 16px;
        font-weight: 100;
    }

    .years {
        font-family: var(--primary-font-family);
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
