<template>
    <div class="media-gallery">
        <div class="media-gallery-controls">
            <SelectButton v-model="mode" :options="modeOptions" />
            <MultiSelect v-model="selectedAlbums" display="chip" :options="albums" optionLabel="name" filter placeholder="Select an Album" :maxSelectedLabels="2" class="w-full md:w-80" />
            <SelectButton v-model="show" :options="showOptions" multiple />
        </div>
        <div class="media-gallery-display">
            <fancybox
                v-if="mode === 'view'"
                :options="{
                    Carousel: {
                        infinite: true
                    }
                }"
            >
                <layout-grid>
                    <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :gallery :mode :show="show" />
                </layout-grid>
            </fancybox>
            <layout-grid v-else>
                <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :mode :show="show" />
            </layout-grid>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    gallery: {
        type: String,
        default: 'gallery'
    }
});

interface Album {
    name: string;
    id: number;
}
const albums = useAlbums();

// Define mode with a strict union type
const mode = ref<'view' | 'select'>('view');
const modeOptions = ref(['view', 'select']);

const show = ref<string[] | null>(null);
const showOptions = ref(['name', 'albums']);
const selectedAlbums = ref<Album[]>([]); // Explicitly define the type of selectedAlbums

// Computed property to extract only the IDs from the selected albums
const selectedAlbumIds = computed(() => selectedAlbums.value.map((album) => album.id));

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
<style lang="scss">
.p-togglebutton-label {
    text-transform: capitalize;
}
</style>
