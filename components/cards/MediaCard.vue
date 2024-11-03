<template>
    <card-wrapper class="media-card" v-bind="mode === 'view' ? { 'data-fancybox': gallery, 'data-caption': name, link: src } : {}" :mode="mode">
        <swp-picture v-if="id" :id="id" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" @update:src="src = $event" :loveable="loveable" :mode="mode" />
        <card-text-wrapper>
            <h1 class="name">{{ name }}</h1>
        </card-text-wrapper>
    </card-wrapper>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ''
    },
    gallery: {
        type: String,
        default: 'gallery'
    },
    mode: {
        type: String as () => 'view' | 'select', // Restrict type to 'view' or 'select'
        default: 'view'
    },
    selectable: {
        type: Boolean,
        default: false
    },
    selected: {
        type: Boolean,
        default: false
    },
    loveable: {
        type: Boolean,
        default: false
    },
    loved: {
        type: Boolean,
        default: false
    }
});

const src = ref<string>('');
</script>

<style lang="scss">
.media-card {
    //  width: 300px;
    picture {
        @include aspect-ratio(3, 2);
    }
    header {
        @include aspect-ratio(5, 1);
        //     min-height: 150px;
    }
    .name {
        font-family: $ff2;
        font-size: 15px;
        font-weight: 100;
    }
}
</style>
