<template>
    <div :class="['card-gallery', selectedSize?.display || '', mode]">
        <GalleryControls
            :showControls="showGalleryControls"
            :showFunctionControl="showFunctionControl"
            :showCategoryControl="showCategoryControl"
            :showShowControl="showShowControl"
            :showSearchControl="showSearchControl"
            :showCardSizeControl="showCardSizeControl"
            :functionControlOptions="functionControlOptions"
            :categoryOptions="categories"
            :cardSizeIcons="cardSizeIcons"
            v-model:mode="mode"
            v-model:selectedCategories="selectedCategories"
            v-model:show="show"
            v-model:searchQuery="searchQuery"
            v-model:selectedSize="selectedSize"
            :selectedItems="selectedItems"
            @select-all="toggleSelectAll"
            @delete-selected="deleteSelectedItems"
        />
        <fancybox v-if="mode === 'view'" class="gallery-grid" :options="{ Carousel: { infinite: true } }">
            <MediaCard
                v-for="(listing, index) in filteredListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :name="listing.images[0].alt"
                :categories="listing.categories"
                :gallery="gallery"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            />
        </fancybox>
        <vue-draggable v-else-if="mode === 'order'" class="gallery-grid" v-model="draggableListings" @start="onStart" @end="onEnd">
            <MediaCard
                v-for="(listing, index) in draggableListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :name="listing.images[0].alt"
                :categories="listing.categories"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            />
        </vue-draggable>
        <div v-else class="gallery-grid">
            <MediaCard
                v-for="(listing, index) in filteredListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :name="listing.images[0].alt"
                :categories="listing.categories"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

// Define Category interface for type safety
interface Category {
    name: string;
    id: number;
}

interface Listing {
    id: string;
    images: { id: string; alt: string }[];
    saleType: string;
    name: string;
    year: string;
    price: string;
    engine: string;
    odometer: string;
    transmission: string;
    stearingSide: string;
    yearFrom: number;
    yearToo: number;
    categories: Category[];
}

const cardSizes = ref<{ label: string; icon: string; display: string }[]>([
    { label: 'Small Cards', icon: 'cardssmall', display: 'display-small-cards' },
    { label: 'Big Cards', icon: 'cardsbig', display: 'display-big-cards' },
    { label: 'List', icon: 'list', display: 'display-list' }
]);

const props = defineProps({
    showGalleryControls: { type: Boolean, default: true },
    showFunctionControl: { type: Boolean, default: true },
    showCategoryControl: { type: Boolean, default: true },
    showShowControl: { type: Boolean, default: true },
    showSearchControl: { type: Boolean, default: true },
    showCardSizeControl: { type: Boolean, default: true },
    functionControlOptions: { type: Array as PropType<string[]>, default: () => ['view', 'select', 'edit', 'order'] },
    defaultFunctionControl: { type: String as () => 'view' | 'select' | 'edit' | 'order', default: 'view' },
    defaultShowControl: { type: Array as PropType<string[]>, default: () => ['name'] },
    cardSizeIcons: { type: Array as PropType<string[]>, default: () => ['cardssmall', 'cardsbig', 'list'] },
    defaultCardSizeControl: { type: String, default: 'Big Cards' },
    categoryControlOptions: { type: Array as PropType<Category[]>, default: () => [] },
    gallery: { type: String, default: 'gallery' },
    minSearchLength: { type: Number, default: 1 },
    initialSize: { type: String, default: 'Big Cards' }
});

const selectedItems = ref<string[]>([]);

function updateSelectedItems(id: string, isSelected: boolean) {
    if (isSelected) {
        if (!selectedItems.value.includes(id)) selectedItems.value.push(id);
    } else {
        selectedItems.value = selectedItems.value.filter((item) => item !== id);
    }
}

function toggleSelectAll(selectAll: boolean) {
    if (selectAll) {
        selectedItems.value = filteredListings.value.map((listing) => listing.id);
    } else {
        selectedItems.value = selectedItems.value.filter((id) => !filteredListings.value.some((listing) => listing.id === id));
    }
}

// Initialize listings directly using categories
const listings = ref<Listing[]>(useListings());

function deleteSelectedItems() {
    listings.value = listings.value.filter((listing) => !selectedItems.value.includes(listing.id));
    selectedItems.value = []; // Clear selected items after deletion
}

const selectedSize = ref(cardSizes.value.find((option) => option.label === props.defaultCardSizeControl) || cardSizes.value[0]);
const mode = ref<'view' | 'select' | 'edit' | 'order'>(props.defaultFunctionControl);
const show = ref<string[]>(props.defaultShowControl);

const categories = ref<Category[]>(props.categoryControlOptions.length ? props.categoryControlOptions : useCategories());
const selectedCategories = ref<Category[]>([]);
const selectedCategoryIds = computed(() => selectedCategories.value.map((category: Category) => category.id));

const searchQuery = ref('');

const filteredListings = computed(() => {
    let result = listings.value;

    if (selectedCategoryIds.value.length > 0) {
        result = result.filter((listing) => listing.categories.some((category) => selectedCategoryIds.value.includes(category.id)));
    }

    if (searchQuery.value.length >= props.minSearchLength) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter((listing) => listing.images[0].alt.toLowerCase().includes(query));
    }

    return result;
});

const draggableListings = ref([...filteredListings.value]);
const filteredCardSizes = computed(() => cardSizes.value.filter((size) => props.cardSizeIcons.includes(size.icon)));

watch(filteredListings, (newFilteredListings) => {
    draggableListings.value = [...newFilteredListings];
});

function onStart() {
    console.log('start drag');
}

function onEnd() {
    console.log('end drag');
}
</script>

<style lang="scss">
.card-gallery {
    --grid-gap: 20px;
    border-radius: var(--border-radius);
    background-color: var(--surface-overlay);
    // padding: var(--grid-gap);
    .gallery-controls {
        animation: fill-background linear;
        animation-timeline: scroll();
        background-color: transparent;
        backdrop-filter: none;
        box-shadow: none;
        padding: calc(var(--grid-gap) / 2) var(--grid-gap);
        position: sticky;
        top: 0px;
        z-index: 1;
        .select-controls {
            padding-top: calc(var(--grid-gap) / 2);
            display: flex;
            gap: 10px;
            margin-left: auto;
        }
        + .gallery-grid {
            padding-top: calc(var(--grid-gap) / 2);
        }
        .icon {
            width: 24px;
            height: 24px;
        }
        .p-togglebutton-label {
            text-transform: capitalize;
        }
        .p-iconfield .p-inputtext:not(:last-child) {
            width: 100%; // NEEDED FOR BUG IN PRIME VUE???
        }
        .p-selectbutton {
            &:has(.icon) {
                button {
                    padding: 8px;
                }
            }
        }
    }
    &.display-small-cards {
        .gallery-grid {
            --grid-gap: 5px;
            --grid-item-min: 100px;
        }
    }
    &.display-big-cards {
        .gallery-grid {
            --grid-gap: 20px;
            --grid-item-min: 300px;
        }
    }
    .gallery-grid {
        transition: all 0.4s ease-in-out;
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
    .p-selectbutton button {
        overflow: visible;
    }
}

@keyframes fill-background {
    0% {
        backdrop-filter: none;
        background-color: none;
    }
    10% {
        backdrop-filter: blur(5px);
        background-color: var(--background-glass);
    }
    100% {
        backdrop-filter: blur(5px);
        background-color: var(--background-glass);
    }
}
</style>
