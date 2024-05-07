<template>
    <section class="content-block">
        <div class="content">
            <div class="left">
                <image-wrapper :images="images" loading="lazy" :width="props.width" :height="props.height" dpr="2" />
            </div>
            <div class="right">
                <h2>{{ title }}</h2>
                <p v-for="(paragragh, index) in text" :key="index">{{ paragragh }}</p>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
const props = defineProps(['title', 'text', 'images']);
</script>

<style lang="scss">
.content-block {
    background: var(--surface-ground);
    width: 100%;
    padding-top: clamp(10vw, 10vw, 200px);
    .content {
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin-bottom: 4rem;
        }
        p {
            margin-bottom: 2rem;
        }

        .images {
            width: 60%;
            @include aspect-ratio(5, 6);
        }
        margin: 0 auto;
        width: clamp(300px, 95%, 1600px);
        display: flex;
        @include desktop {
            flex-direction: row;
        }
        @include mobile {
            flex-direction: column;
        }
        .left,
        .right {
            @include desktop {
                width: 50%;
            }
        }
        .left {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
    }
}
</style>
