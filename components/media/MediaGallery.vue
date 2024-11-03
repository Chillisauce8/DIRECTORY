<template>
    <fancybox
        v-if="mode === 'view'"
        :options="{
            Carousel: {
                infinite: true
            }
        }"
    >
        <layout-grid>
            <MediaCard v-for="(listing, index) in listings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :gallery :mode />
        </layout-grid>
    </fancybox>
    <layout-grid v-else>
        <MediaCard v-for="(listing, index) in listings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :mode />
    </layout-grid>
</template>

<script setup lang="ts">
const props = defineProps({
    gallery: {
        type: String,
        default: 'gallery'
    },
    mode: {
        type: String as () => 'view' | 'select', // Restrict type to 'view' or 'select'
        default: 'view'
    }
});

const listings = useListings();
</script>
