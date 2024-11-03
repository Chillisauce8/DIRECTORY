<script setup lang="ts">
interface MarketListCardProps {
    header: string;
    marketList: { name: string; path: { name: string; slug: string }[] }[];
}

const props = withDefaults(defineProps<MarketListCardProps>(), { marketList: [] });
</script>

<template>
    <card-wrapper class="market-list-card">
        <!--    <card-text-wrapper>-->
        <h1 class="header">{{ header }}</h1>
        <div class="market-list">
            <template v-for="market in marketList">
                <nuxt-link :href="`/market/${market.path.map((i) => i.slug).join('/')}`"> {{ market.name }} </nuxt-link>
            </template>
        </div>
        <!--    </card-text-wrapper>-->
    </card-wrapper>
</template>

<style lang="scss">
.market-list-card {
    max-width: 300px;

    figure {
        //@include aspect-ratio(1, 5);
    }
    header {
        //@include aspect-ratio(5, 1);
        //     min-height: 150px;
    }
    .header {
        text-align: center;
    }

    .market-list {
        display: flex;
        flex-direction: column;
    }
}
</style>
