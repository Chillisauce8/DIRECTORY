<template>
    <BaseCard :data-item="cardData" collection="makes" :grid-id="gridId" class="make-card">
        <template #card-content>
            <h1 class="name">{{ name }}</h1>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
interface MakeCardProps {
    images?: string[];
    name: string;
    gridId: string;
}

const props = withDefaults(defineProps<MakeCardProps>(), {
    gridId: 'make-list'
});

// Create a data object that matches what BaseCard expects
const cardData = {
    _id: props.images?.[0] || 'default-id',
    name: props.name
};
</script>

<style lang="scss">
.make-card {
    width: 300px;
    figure {
        aspect-ratio: 3 / 2;
    }
    header {
        aspect-ratio: 3 / 2;
        //     min-height: 150px;
    }
    .name {
        font-family: var(--primary-font-family);
        font-size: 18px;
        font-weight: 600;
    }
    .sale-type {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
    }
    .year {
        font-size: 12px;
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
