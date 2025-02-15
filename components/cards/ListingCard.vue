<template>
    <BaseCard 
        :data-item="dataItem" 
        collection="listings" 
        :grid-id="gridId" 
        :src="dataItem.content?.imageURLs?.[0]"
        image-id-path="" 
        class="listing-card"
    >
        <template #image>
          <!--  <SvgIcon svg="heart" class="heart" /> -->
            <div class="location">
                <span class="fi fi-gb flag"></span>
                <span class="address"> Yeovil, UK </span>
            </div>
        </template>
        <template #card-content="{ data }">
            <div class="sale-type">{{ data.sale?.saleType }}</div>
            <h1 class="name"> {{ data.content?.name }}</h1>
            <div v-if="data.sale?.price" class="price">£{{ data.sale.price }}</div>
            <div class="specs">
                <span v-if="data.spec?.engine" class="engine">{{ data.spec.engine }}</span>
                <span v-if="data.spec?.odometer" class="odometer">{{ data.spec.odometer }}</span>
                <span v-if="data.spec?.transmission" class="transmission">{{ data.spec.transmission }}</span>
                <span v-if="data.spec?.stearingSide" class="stearing-side">{{ data.spec.stearingSide }}</span>
            </div>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import type { PartialListingNode } from '~/service/cars/listings.service';

const props = defineProps<{
    dataItem: PartialListingNode;
    gridId: string;
}>();
</script>

<style lang="scss">
.listing-card {
    //  width: 300px;
    picture {
        @include aspect-ratio(3, 2);
    }
    header {
        @include aspect-ratio(3, 2);
        //     min-height: 150px;
    }
    .name {
        font-family: var(--primary-font-family);
        font-size: 15px;
        font-weight: 100;
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
        .flag {
            width: 24px;
        }
    }
}
</style>
