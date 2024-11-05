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
            <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :gallery :mode :show />
        </layout-grid>
    </fancybox>
    <layout-grid v-else>
        <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :mode :show />
    </layout-grid>
</template>

<script setup lang="ts">
const props = defineProps({
    mode: {
        type: String as () => 'view' | 'select',
        default: 'view'
    },
    show: {
        type: String as () => 'name' | 'albums' | null
    },
    selectedAlbumIds: {
        type: Array as () => number[] | undefined,
        default: () => []
    },
    gallery: {
        type: String,
        default: 'gallery'
    }
});

const listings = useListings();

const filteredListings = computed(() => {
    // Use an empty array if selectedAlbums is undefined
    const albums = props.selectedAlbumIds ?? [];

    // Log selectedAlbums to verify it's being passed correctly
    console.log('selectedAlbums:', albums);

    // If selectedAlbums is empty, return all listings
    if (albums.length === 0) {
        return listings;
    }

    // Filter listings based on matching album values
    return listings.filter((listing) => listing.albums.some((albumId) => albums.includes(albumId)));
});
</script>
