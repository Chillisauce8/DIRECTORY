<template>
    <div class="media-gallery">
        <div class="media-gallery-controls">
            <div class="flex flex-col md:flex-row gap-4">
                <SelectButton v-model="mode" :options="['view', 'select', 'edit', 'move']" :allowEmpty="false" />
                <MultiSelect v-model="selectedAlbums" display="chip" :options="albums" optionLabel="name" filter placeholder="Select an Album" :maxSelectedLabels="2" class="w-full md:w-80" />
                <SelectButton v-model="show" :options="['name', 'albums']" multiple />
                <IconField>
                    <InputText type="text" class="search" placeholder="Search" v-model="searchQuery" />
                    <InputIcon class="pi pi-search" />
                </IconField>
            </div>
        </div>
        <div class="media-gallery-display">
            <fancybox v-if="mode === 'view'" :options="{ Carousel: { infinite: true } }">
                <layout-grid>
                    <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :gallery="gallery" :mode="mode" :show="show" />
                </layout-grid>
            </fancybox>

            <vue-draggable class="draggable" v-else-if="mode === 'move'" v-model="filteredListings">
                <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :mode="mode" :show="show" />
            </vue-draggable>

            <layout-grid v-else>
                <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :mode="mode" :show="show" />
            </layout-grid>
        </div>
    </div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
const props = defineProps({
    gallery: {
        type: String,
        default: 'gallery'
    },
    minSearchLength: {
        type: Number,
        default: 1 // Default minimum characters needed to start search
    }
});

interface Album {
    name: string;
    id: number;
}

const albums = useAlbums();
const mode = ref<'view' | 'select' | 'edit'>('view');
const show = ref<string[] | null>(null);
const selectedAlbums = ref<Album[]>([]);
const selectedAlbumIds = computed(() => selectedAlbums.value.map((album) => album.id));
const listings = useListings();

const searchQuery = ref(''); // Reactive variable for search input

const filteredListings = computed(() => {
    let result = listings;

    // Filter by selected albums if any are selected
    if (selectedAlbumIds.value.length > 0) {
        result = result.filter((listing) => listing.albums.some((albumId) => selectedAlbumIds.value.includes(albumId)));
    }

    // Filter by search query if it meets the minimum length
    if (searchQuery.value.length >= props.minSearchLength) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter((listing) => listing.images[0].alt.toLowerCase().includes(query));
    }

    return result;
});
</script>

<style lang="scss">
.media-gallery {
    .p-togglebutton-label {
        text-transform: capitalize;
    }
    .p-iconfield .p-inputtext:not(:last-child) {
        width: 100%; // NEEDED FOR BUG IN PRIME VUE???
    }
    .draggable {
        --grid-gap: 20px;
        // --grid-background-color: var(--color-light);
        --grid-item-min: 300px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min), 1fr));
        padding: var(--grid-gap);
        gap: var(--grid-gap);
        grid-auto-flow: dense; // https://www.w3schools.com/cssref/tryit.php?filename=trycss_grid-auto-flow2
        //   background-color: var(--grid-background-color);

        > * {
            grid-column: span 1;
            grid-row: span 1;
        }
    }
}
</style>
