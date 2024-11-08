<template>
    <div class="media-gallery">
        <div>{{ selectedSize }}</div>
        <div class="media-gallery-controls">
            <div class="flex flex-col md:flex-row gap-4">
                <SelectButton v-model="mode" :options="['view', 'select', 'edit', 'move']" :allowEmpty="false" />
                <MultiSelect v-model="selectedAlbums" display="chip" :options="albums" optionLabel="name" filter placeholder="Select an Album" :maxSelectedLabels="2" class="w-full md:w-80" />
                <SelectButton v-model="show" :options="['name', 'albums']" multiple />
                <IconField>
                    <InputText type="text" class="search" placeholder="Search" v-model="searchQuery" />
                    <InputIcon class="pi pi-search" />
                </IconField>
                <SelectButton v-model="selectedSize" :options="cardSizes" optionLabel="label" dataKey="label" aria-labelledby="card-size-selector">
                    <template #option="slotProps">
                        <SvgIcon :svg="slotProps.option.icon" />
                    </template>
                </SelectButton>
            </div>
        </div>
        <div class="media-gallery-display">
            <fancybox v-if="mode === 'view'" :options="{ Carousel: { infinite: true } }">
                <layout-grid>
                    <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :gallery="gallery" :mode="mode" :show="show" />
                </layout-grid>
            </fancybox>

            <vue-draggable class="draggable" v-else-if="mode === 'move'" v-model="draggableListings" @start="onStart" @end="onEnd">
                <MediaCard v-for="(listing, index) in draggableListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :mode="mode" :show="show" />
            </vue-draggable>

            <layout-grid v-else>
                <MediaCard v-for="(listing, index) in filteredListings" :key="index" :id="listing.images[0].id" :name="listing.images[0].alt" :albums="listing.albums" :mode="mode" :show="show" />
            </layout-grid>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

const props = defineProps({
    gallery: {
        type: String,
        default: 'gallery'
    },
    minSearchLength: {
        type: Number,
        default: 1
    }
});

interface Album {
    name: string;
    id: number;
}

const selectedSize = ref(null);
const cardSizes = ref([
    { label: 'Small', icon: 'cardsmall', class: 'cards-small' },
    { label: 'Big', icon: 'cardsbig', class: 'cards-big' }
]);

const albums = useAlbums();
const mode = ref<'view' | 'select' | 'edit' | 'move'>('view');
const show = ref<string[] | null>(null);
const selectedAlbums = ref<Album[]>([]);
const selectedAlbumIds = computed(() => selectedAlbums.value.map((album) => album.id));
const listings = useListings();

const searchQuery = ref('');
const filteredListings = computed(() => {
    let result = listings;

    if (selectedAlbumIds.value.length > 0) {
        result = result.filter((listing) => listing.albums.some((albumId) => selectedAlbumIds.value.includes(albumId)));
    }

    if (searchQuery.value.length >= props.minSearchLength) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter((listing) => listing.images[0].alt.toLowerCase().includes(query));
    }

    return result;
});

// Separate ref for draggable listings, initially populated with filteredListings
const draggableListings = ref([...filteredListings.value]);

// Sync draggableListings with filteredListings when filtering changes
watch(filteredListings, (newFilteredListings) => {
    draggableListings.value = [...newFilteredListings];
});

// Drag event handlers
function onStart() {
    console.log('start drag');
}

function onEnd() {
    console.log('end drag');
}
</script>

<style lang="scss">
.media-gallery {
    background-color: var(--surface-overlay);
    padding: 10px;
    .media-gallery-controls {
        padding: 10px;
        background-color: var(--surface-card);
        .icon {
            width: 24px;
            height: 24px;
        }
    }
    .p-togglebutton-label {
        text-transform: capitalize;
    }
    .p-iconfield .p-inputtext:not(:last-child) {
        width: 100%; // NEEDED FOR BUG IN PRIME VUE???
    }
    .card-sizes {
        .icon {
            width: 24px;
            height: 24px;
        }
    }
    .draggable {
        --grid-gap: 5px;
        // --grid-background-color: var(--color-light);
        --grid-item-min: 100px;
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
