<template>
    <card-wrapper class="make-card">
        <swp-picture v-if="images" :images="images" :max="1" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy">
            <!--
      <SvgIcon svg="heart" class="heart" />
      <div class="location">
        <span class="fi fi-gb flag"></span>
        <span class="address"> Yeovil, UK </span>
      </div>
    -->
        </swp-picture>
        <card-text-wrapper>
            <!--     <div class="sale-type">{{ saleType }}</div> -->
            <h1 class="name">{{ name }}</h1>

            <!--  <div class="price">{{ price }}</div>

      <div class="specs">
        <span v-if="engine" class="engine">{{ engine }}</span>
        <span v-if="odometer" class="odometer">{{ odometer }}</span>
        <span v-if="transmission" class="transmission">{{ transmission }}</span>
        <span v-if="stearingSide" class="stearing-side">{{
          stearingSide
        }}</span>
      </div>
    -->
        </card-text-wrapper>
    </card-wrapper>
</template>

<script setup lang="ts">
const props = defineProps(['images', 'name']);
</script>

<style lang="scss">
.make-card {
    width: 300px;
    figure {
        @include aspect-ratio(3, 2);
    }
    header {
        @include aspect-ratio(3, 1);
        //     min-height: 150px;
    }
    .name {
        font-family: $ff2;
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
