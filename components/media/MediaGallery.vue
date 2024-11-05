<template>
    <div class="media-gallery">
        <div class="media-gallery-controls">
            <SelectButton v-model="mode" :options="['view', 'select', 'edit']" :allowEmpty="false" />
            <MultiSelect v-model="selectedAlbums" display="chip" :options="albums" optionLabel="name" filter placeholder="Select an Album" :maxSelectedLabels="2" class="w-full md:w-80" />
            <SelectButton v-model="show" :options="['name', 'albums']" multiple />
        </div>
        <div class="media-gallery-display">
            <fancybox v-if="mode === 'view'" :options="{ Carousel: { infinite: true } }">
                <layout-grid>
                    <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :gallery="gallery" :mode="mode" :show="show" />
                </layout-grid>
            </fancybox>
            <layout-grid v-else>
                <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :mode="mode" :show="show" />
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
const mode = ref<'view' | 'select' | 'edit'>('view');
const show = ref<string[] | null>(null);
const selectedAlbums = ref<Album[]>([]);
const selectedAlbumIds = computed(() => selectedAlbums.value.map((album) => album.id));
const listings = useListings();

const filteredListings = computed(() => {
    return selectedAlbumIds.value.length === 0 ? listings : listings.filter((listing) => listing.albums.some((albumId) => selectedAlbumIds.value.includes(albumId)));
});
</script>

<style lang="scss">
.p-togglebutton-label {
    text-transform: capitalize;
}
</style>
