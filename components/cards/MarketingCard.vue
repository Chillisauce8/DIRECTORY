<template>
    <BaseCard :data-item="cardData" collection="marketing" :grid-id="gridId" class="marketing-card" :class="{ 'X-Center': svg, link }">
        <template #card-content>
            <LazySvgIcon v-if="svg" :svg="svg" />
            <h1 v-if="title">{{ title }}</h1>
            <div v-if="copy" class="copy">
                {{ copy }}
            </div>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
interface MarketingCardProps {
    images?: string[];
    title?: string;
    copy?: string;
    svg?: string;
    link?: string;
    gridId?: string;
}

const props = withDefaults(defineProps<MarketingCardProps>(), {
    gridId: 'marketing'
});

const cardData = {
    _id: props.images?.[0] || 'marketing-card',
    name: props.title
};
</script>

<style lang="scss">
.marketing-card {
    width: 300px;
    cursor: auto;
    &.link {
        cursor: pointer;
    }

    & figure {
        @include aspect-ratio(2, 1);
    }
    & header {
        text-align: center;
        & h1 {
            margin: 18px 0;
            font-size: 18px;
        }
        & .copy {
            font-size: 16px;
        }

        //     min-height: 150px;
    }
    & i.icon {
        width: 72px;
        height: 72px;
        color: $C1;
    }
}
</style>
