<template>
    <card-wrapper class="vehicle-card standard-card">
        <swp-picture v-if="images" :images="images" widths="290:870" :increment="145" aspectRatio="3:2" loading="lazy"> </swp-picture>
        <card-text-wrapper>
            <div v-if="nickname" class="nickname">"{{ nickname }}"</div>
            <h1 class="name">{{ year }} {{ make }} {{ name }}</h1>
        </card-text-wrapper>
    </card-wrapper>
</template>

<script setup lang="ts">
const props = defineProps(['images', 'name', 'nickname', 'make', 'year']);
</script>

<style lang="scss">
.vehicle-card {
    figure,
    picture {
        @include aspect-ratio(3, 2);
    }
    .overlay-testing {
        background-color: pink;
    }
    header {
        @include aspect-ratio(3, 1);
        //     min-height: 150px;
    }

    .name {
        font-family: $ff2;
        font-size: 14px;
        font-weight: 100;
    }
    .nickname {
        font-size: 16px;
        font-family: $ff2;
        font-weight: 600;
        letter-spacing: 0.3rem;
        text-transform: uppercase;
    }
}
</style>
