<template>
    <div :class="['card-gallery', selectedSize?.display || '', mode]">
        <ListControls
            :showControls="showGalleryControls"
            :functionControlDisplay="functionControlDisplay"
            :visibleFunctionControls="visibleFunctionControls"
            :defaultFunctionControl="defaultFunctionControl"
            :showCategoryControl="showCategoryControl"
            :showShowControl="showShowControl"
            :showSearchControl="showSearchControl"
            :functionControlOptions="functionControlOptions"
            :categoryOptions="categories"
            :visibleCardSizes="visibleCardSizes"
            v-model:mode="mode"
            v-model:selectedCategories="selectedCategories"
            v-model:show="show"
            v-model:searchQuery="searchQuery"
            v-model:selectedSize="selectedSize"
            v-model:sort="sort"
            :ref:gridSearch="gridSearch"
            :ref:gridSort="gridSort"
            :selectedItems="selectedItems"
            @select-all="toggleSelectAll"
            @delete-selected="deleteSelectedItems"
            @add-selected="addSelectedItems"
            @add-categories-to-selected="addCategoriesToSelected"
            @remove-categories-from-selected="removeFromSelected"
        />
        <fancy-box v-if="mode === 'view'" class="gallery-grid" :options="{ Carousel: { infinite: true } }">
            <CardContainer
                v-for="(listing, index) in filteredListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :name="listing.name"
                :categories="listing.categories"
                :gallery="gallery"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            >
                <slot name="card" :listing="listing" :mode="mode" :selected="selectedItems.includes(listing.id)" :show="show" />
            </CardContainer>
        </fancy-box>

        <!-- Draggable Grid Section (Order Mode) -->
        <vue-draggable v-else-if="mode === 'order'" class="gallery-grid" v-model="draggableListings" @start="onStart" @end="onEnd">
            <CardContainer
                v-for="(listing, index) in draggableListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :name="listing.name"
                :categories="listing.categories"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            >
                <slot name="card" :listing="listing" :mode="mode" :selected="selectedItems.includes(listing.id)" :show="show" />
            </CardContainer>
        </vue-draggable>

        <!-- Default Grid Section (Non-View, Non-Order Modes) -->
        <div v-else class="gallery-grid">
            <CardContainer
                v-for="(listing, index) in filteredListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :name="listing.name"
                :categories="listing.categories"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            >
                <slot name="card" :listing="listing" :mode="mode" :selected="selectedItems.includes(listing.id)" :show="show" />
            </CardContainer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

// Add refs for grid components
const gridSearch = ref();
const gridSort = ref();

// Add sort model
const sort = ref<{ label: string; sort: string; order: 'asc' | 'desc' } | null>(null);

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

type FunctionMode = 'view' | 'select' | 'edit' | 'order';

const props = defineProps({
    showGalleryControls: { type: Boolean, default: true },
    functionControlDisplay: {
        type: String as PropType<'text' | 'icon'>,
        default: 'text'
    },
    visibleFunctionControls: {
        type: Array as PropType<FunctionMode[] | null>,
        default: () => ['view', 'select', 'edit', 'order'] as FunctionMode[]
    },
    defaultFunctionControl: {
        type: String as PropType<FunctionMode>,
        default: 'view'
    },
    showCategoryControl: { type: Boolean, default: true },
    showShowControl: { type: Boolean, default: true },
    showSearchControl: { type: Boolean, default: true },
    functionControlOptions: { type: Array as PropType<string[]>, default: () => ['view', 'select', 'edit', 'order'] },
    defaultShowControl: { type: Array as PropType<string[]>, default: () => ['name'] },
    visibleCardSizes: {
        type: Array as PropType<string[] | null>,
        default: () => ['Small Cards', 'Big Cards', 'List']
    },
    defaultCardSize: {
        type: String,
        default: 'Big Cards'
    },
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

const listings = ref<Listing[]>(useListings());

function deleteSelectedItems() {
    listings.value = listings.value.filter((listing) => !selectedItems.value.includes(listing.id));
    selectedItems.value = [];
}

const selectedSize = ref(cardSizes.value.find((option) => option.label === props.defaultCardSize) || cardSizes.value[0]);
const mode = ref<FunctionMode>(props.defaultFunctionControl);
const show = ref<string[]>(props.defaultShowControl);

const categories = ref<Category[]>(props.categoryControlOptions.length ? props.categoryControlOptions : useCategories());
const selectedCategories = ref<Category[]>([]);
const selectedCategoryIds = computed(() => selectedCategories.value.map((category) => category.id));

const searchQuery = ref('');

const filteredListings = computed(() => {
    let result = listings.value;

    if (selectedCategoryIds.value.length > 0) {
        result = result.filter((listing) => listing.categories.some((category) => selectedCategoryIds.value.includes(category.id)));
    }

    // Apply search if GridSearch ref exists
    if (gridSearch.value) {
        result = gridSearch.value.searchItems(result);
    }

    // Apply sort if sort value exists
    if (sort.value) {
        const { sort: sortField, order } = sort.value as { sort: keyof Listing; order: 'asc' | 'desc' };
        result = [...result].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });
    }

    // Apply sort if GridSort ref exists
    if (gridSort.value) {
        result = gridSort.value.sortItems(result);
    }

    return result;
});

const draggableListings = ref([...filteredListings.value]);

watch(filteredListings, (newFilteredListings) => {
    draggableListings.value = [...newFilteredListings];
});

function onStart() {
    console.log('start drag');
}

function onEnd() {
    console.log('end drag');
}

function addSelectedItems() {
    // Pass the array of selected items to parent component
    emit('add-selected', selectedItems.value);
}

// Add category management functions
function addCategoriesToSelected(categoriesToAdd: Category[]) {
    listings.value = listings.value.map((listing) => {
        if (selectedItems.value.includes(listing.id)) {
            const existingCategoryIds = listing.categories.map((c) => c.id);
            const newCategories = categoriesToAdd.filter((c) => !existingCategoryIds.includes(c.id));
            return {
                ...listing,
                categories: [...listing.categories, ...newCategories]
            };
        }
        return listing;
    });
}

function removeFromSelected(categoriesToRemove: Category[]) {
    const categoryIdsToRemove = categoriesToRemove.map((c) => c.id);
    listings.value = listings.value.map((listing) => {
        if (selectedItems.value.includes(listing.id)) {
            return {
                ...listing,
                categories: listing.categories.filter((c) => !categoryIdsToRemove.includes(c.id))
            };
        }
        return listing;
    });
}

// Add emit definition at the top level
const emit = defineEmits(['add-selected']);
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
    &.display-list {
        .gallery-grid {
            --grid-gap: 20px;
            --grid-item-min: 300px;
            max-width: 600px;
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
    2% {
        backdrop-filter: blur(5px);
        background-color: var(--background-glass);
    }
    100% {
        backdrop-filter: blur(5px);
        background-color: var(--background-glass);
    }
}
</style>
