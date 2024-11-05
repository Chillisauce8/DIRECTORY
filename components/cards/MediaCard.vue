<template>
    <card-wrapper class="media-card" v-bind="mode === 'view' ? { 'data-fancybox': gallery, 'data-caption': name, link: src } : {}" :mode="mode">
        <swp-picture v-if="id" :id="id" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" @update:src="src = $event" :loveable="loveable" :mode="mode" />
        <card-text-wrapper :class="{ show: !!show, hide: !show }">
            <h1 class="name" :class="{ visible: show && show.includes('name'), hidden: !show || !show.includes('name') }">{{ name }}</h1>
            <h1 class="albums" :class="{ visible: show && show.includes('albums'), hidden: !show || !show.includes('albums') }">{{ albumNames }}</h1>
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
    albums: {
        type: Array as () => number[],
        default: () => []
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
    },
    show: {
        type: [Array, null] as () => string[] | null
    }
});

const albumList = useAlbums();
const src = ref<string>('');

// Computed property to transform album IDs to names
const albumNames = computed(() => {
    return props.albums
        .map((id) => albumList.find((album) => album.id === id)?.name)
        .filter(Boolean)
        .join(', ');
});
</script>

<style lang="scss">
.media-card {
    picture {
        @include aspect-ratio(3, 2);
    }

    .name,
    .albums {
        font-family: $ff2;
        font-size: 15px;
        font-weight: 100;
        transition: opacity 0.5s ease;
        opacity: 0; // Default hidden state
        position: absolute;
        top: 0;
        left: 0;
    }

    .visible {
        display: block;
    }

    .hidden {
        display: none;
    }
}
</style>
