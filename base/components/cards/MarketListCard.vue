<script setup lang="ts">
interface MarketListCardProps {
    header: string;
    marketList: { name: string; path: { name: string; slug: string }[] }[];
    gridId: string; // Added for BaseCard
}

const props = withDefaults(defineProps<MarketListCardProps>(), {
    marketList: [],
    gridId: 'market-list'
});

// Create a data object that matches what BaseCard expects
const cardData = {
    _id: 'market-list',
    name: props.header
};
</script>

<template>
    <BaseCard :data-item="cardData" collection="markets" :grid-id="gridId" class="market-list-card">
        <template #card-content>
            <h1 class="header">{{ header }}</h1>
            <div class="market-list">
                <template v-for="market in marketList">
                    <nuxt-link :href="`/market/${market.path.map((i) => i.slug).join('/')}`">
                        {{ market.name }}
                    </nuxt-link>
                </template>
            </div>
        </template>
    </BaseCard>
</template>

<style lang="scss">
.market-list-card {
    max-width: 300px;

    figure {
       
    }
    header {
    
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
