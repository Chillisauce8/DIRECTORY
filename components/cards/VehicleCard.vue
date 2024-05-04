<template>
    <card-wrapper class="vehicle-card standard-card">
        <image-wrapper v-if="images" :images="images" :max="1" :width="290" :height="145" loading="lazy"> </image-wrapper>
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
@container main(min-width: 800px ) {
    .vehicle-card {
        width: 300px;
        background-color: red;
    }
}
@container main(max-width: 800px ) {
    .vehicle-card {
        width: 500px;
        background-color: blue;
    }
}

.vehicle-card {
    @container main (min-width: 800px ) {
        width: clamp(300px, 50%, 500px);
        background-color: red;
    }
    @container main (max-width: 800px ) {
        width: clamp(300px, 100%, 400px);
        background-color: blue;
    }

    //   width: clamp(300px, 25%, 500px);
    figure {
        @include aspect-ratio(3, 2);
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
