<template>
    <div :class="['card-list', selectedSize?.display || '', mode]">
        <div class="list-controls">
            <Toast />
            <ConfirmDialog />
            <div class="filter-controls flex flex-col lg:flex-row gap-4">
                <!-- Default Controls -->
                <FunctionControl v-model="mode" :display="functionControlDisplay" :visibleControls="visibleFunctionControls" :defaultControl="defaultFunctionControl" />

                <!-- Update slot binding to pass listings -->
                <slot name="controls" :items="listings" :selected-categories="selectedCategories" :search-query="searchQuery" :show="show" :sort="sort" @search-results="handleSearchResults" @sorted-items="handleSortedItems" />

                <!-- Default Display Control -->
                <DisplayControl v-model="selectedSize" :visibleSizes="visibleCardSizes" :defaultSize="defaultCardSize" />
                <AddControl />
            </div>

            <SelectControls :mode="mode" :selectedItems="selectedItems" :options="categoryOptions" @select-all="toggleSelectAll" @delete-selected="deleteSelectedItems" @add-selected="addSelectedItems" @update-field="handleUpdateField">
                <template #edit-controls>
                    <slot name="edit-controls" />
                </template>
            </SelectControls>
        </div>

        <fancy-box v-if="mode === 'view'" class="list-grid" :options="{ Carousel: { infinite: true } }">
            <slot v-for="(listing, index) in filteredListings" :key="listing.id" name="card" v-bind="getCardProps(listing)" @update:selected="(val: boolean) => handleItemSelection(listing.id, val)" />
        </fancy-box>

        <vue-draggable v-else-if="mode === 'order'" class="list-grid" v-model="draggableListings" @start="onStart" @end="onEnd">
            <slot v-for="(listing, index) in draggableListings" :key="listing.id" name="card" v-bind="getCardProps(listing)" @update:selected="(val: boolean) => handleItemSelection(listing.id, val)" />
        </vue-draggable>

        <div v-else class="list-grid">
            <slot v-for="(listing, index) in filteredListings" :key="listing.id" name="card" v-bind="getCardProps(listing)" @update:selected="(val: boolean) => handleItemSelection(listing.id, val)" />
        </div>
    </div>
</template>

<script setup lang="ts">
// Keep only non-Vue imports
import { VueDraggable } from 'vue-draggable-plus';
import type { Category, SortOption } from '@/composables/useListControls';

// Type definitions for update functions
type UpdateFunction = (items: any[]) => void;

// Core state management - SINGLE SOURCE OF TRUTH
const searchResults = ref<any[]>([]);
const sortedItems = ref<any[]>([]);
const showFields = ref<string[]>(['name', 'categories']);
const listings = ref<Listing[]>(useListings());
const show = ref<string[]>(['name', 'categories']);
const selectedItems = ref<string[]>([]);

// Models
const sort = defineModel<SortOption | null>('sort', { default: null });
const searchQuery = defineModel<string>('searchQuery', { default: '' });
const selectedCategories = defineModel<Category[]>('selectedCategories', { default: () => [] });

// Update functions - SINGLE DEFINITIONS
const updateSort: UpdateFunction = (items) => {
    sortedItems.value = items;
};

const updateSearch: UpdateFunction = (items) => {
    searchResults.value = items;
};

const updateShow = (fields: string[]) => {
    show.value = fields;
};

// Provide update functions once
provide('updateSort', updateSort);
provide('updateSearch', updateSearch);
provide('updateShow', updateShow);

// Single filteredListings computed property
const filteredListings = computed(() => {
    let result = listings.value;

    if (searchResults.value.length) {
        result = searchResults.value;
    }

    if (sortedItems.value.length) {
        result = sortedItems.value;
    }

    if (props.filters?.length) {
        props.filters.forEach((filter) => {
            if (filter.selected.length) {
                result = result.filter((item) => {
                    const fieldValues = item[filter.field]?.map((i: any) => i.id) || [];
                    return filter.selected.some((selected) => fieldValues.includes(selected.id));
                });
            }
        });
    }

    return result;
});

interface LocalCategory {
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
    [key: string]: any; // Add index signature
}

interface Item {
    id: number;
    name: string;
    [key: string]: any;
}

const cardSizes = ref<{ label: string; icon: string; display: string }[]>([
    { label: 'Small Cards', icon: 'cardssmall', display: 'display-small-cards' },
    { label: 'Big Cards', icon: 'cardsbig', display: 'display-big-cards' },
    { label: 'List', icon: 'list', display: 'display-list' }
]);

type FunctionMode = 'view' | 'select' | 'edit' | 'order';

// Fix duplicate emit definition by combining them
const emit = defineEmits<{
    'add-selected': [string[]];
    'update:filterUpdates': [FilterUpdate];
}>();

interface FilterConfig {
    field: string;
    options: { id: number; name: string }[];
    selected: { id: number; name: string }[];
}

// Add type definition for filter updates
interface FilterUpdate {
    selectedCategories?: any[];
    selectedTags?: any[];
    [key: string]: any[] | undefined;
}

// Add filters to props
const props = defineProps({
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
    visibleCardSizes: {
        type: Array as PropType<string[] | null>,
        default: () => ['Small Cards', 'Big Cards', 'List']
    },
    defaultCardSize: {
        type: String,
        default: 'Big Cards'
    },
    gallery: { type: String, default: 'gallery' },
    minSearchLength: { type: Number, default: 1 },
    initialSize: { type: String, default: 'Big Cards' },
    categoryOptions: {
        type: Array as PropType<Item[]>,
        default: () => []
    },
    filterUpdates: {
        type: Object as PropType<FilterUpdate>,
        default: () => ({})
    },
    filters: {
        type: Array as PropType<FilterConfig[]>,
        default: () => []
    },
    show: {
        type: Array as PropType<string[]>,
        default: () => ['name', 'categories']
    }
});

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

function deleteSelectedItems() {
    listings.value = listings.value.filter((listing) => !selectedItems.value.includes(listing.id));
    selectedItems.value = [];
}

const filters = ref<FilterConfig[]>(props.filters);
const selectedSize = ref(cardSizes.value.find((option) => option.label === props.defaultCardSize) || cardSizes.value[0]);
const mode = ref<FunctionMode>(props.defaultFunctionControl);

const draggableListings = ref([...filteredListings.value]);

watch(filteredListings, (newFilteredListings) => {
    draggableListings.value = [...newFilteredListings];
});

watch(
    () => props.show,
    (newShow) => {
        show.value = newShow;
    }
);

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

// Replace the old updateField function with this new one
function handleUpdateField(field: string, items: Item[], action: 'add' | 'remove') {
    console.log('CardList handleUpdateField started:', { field, items, action, selectedItems: selectedItems.value });

    // Update local listings
    listings.value = listings.value.map((listing) => {
        // Check if this listing is selected
        if (selectedItems.value.includes(listing.id)) {
            console.log('Updating listing:', listing.id);

            // Ensure the field exists and is an array
            if (!Array.isArray(listing[field])) {
                listing[field] = [];
            }

            if (action === 'add') {
                // Add items that don't already exist
                const existingIds = listing[field].map((item: Item) => item.id);
                const newItems = items.filter((item) => !existingIds.includes(item.id));

                console.log('Adding items:', newItems);
                return {
                    ...listing,
                    [field]: [...listing[field], ...newItems]
                };
            } else {
                // Remove specified items
                const idsToRemove = items.map((item) => item.id);
                console.log('Removing items with ids:', idsToRemove);

                return {
                    ...listing,
                    [field]: listing[field].filter((item: Item) => !idsToRemove.includes(item.id))
                };
            }
        }
        return listing;
    });

    // Force reactivity update
    listings.value = [...listings.value];
    console.log('Updated listings:', listings.value);

    // Update filters
    const filterConfig = props.filters.find((f: FilterConfig) => f.field === field);
    if (filterConfig) {
        const updatedSelected =
            action === 'add' ? [...filterConfig.selected, ...items.filter((item) => !filterConfig.selected.some((selected) => selected.id === item.id))] : filterConfig.selected.filter((selected) => !items.some((item) => item.id === selected.id));

        // Emit update for filters
        emit('update:filterUpdates', {
            ...props.filterUpdates,
            [`selected${field.charAt(0).toUpperCase() + field.slice(1)}`]: updatedSelected
        });
    }
}

// Add reactive watcher for listings
watchEffect(() => {
    console.log(
        'Current listings state:',
        listings.value.map((l) => ({
            id: l.id,
            categories: l.categories
        }))
    );
});

// Add watcher for listings changes
watch(
    listings,
    (newListings) => {
        console.log('Listings updated:', newListings);
    },
    { deep: true }
);

// Add provide for update function
type UpdateArrayFieldFn = (field: string, items: Item[], action: 'add' | 'remove') => void;

const updateArrayField: UpdateArrayFieldFn = (field, items, action) => {
    console.log('Direct update called:', { field, items, action });

    // Update local listings
    listings.value = listings.value.map((listing) => {
        if (selectedItems.value.includes(listing.id)) {
            if (action === 'add') {
                const existingIds = listing[field]?.map((item: Item) => item.id) || [];
                const newItems = items.filter((item) => !existingIds.includes(item.id));
                return {
                    ...listing,
                    [field]: [...(listing[field] || []), ...newItems]
                };
            } else {
                const idsToRemove = items.map((item) => item.id);
                return {
                    ...listing,
                    [field]: listing[field]?.filter((item: Item) => !idsToRemove.includes(item.id)) || []
                };
            }
        }
        return listing;
    });

    // Force reactivity
    listings.value = [...listings.value];
};

provide('updateArrayField', updateArrayField);

// Handle results from child components
function handleSearchResults(results: any[]) {
    searchResults.value = results;
}

function handleSortedItems(items: any[]) {
    sortedItems.value = items;
}

function getCardProps(listing: Listing) {
    const isSelected = selectedItems.value.includes(listing.id);
    return {
        listing,
        mode: unref(mode),
        selected: isSelected,
        show: show.value
    };
}

function handleItemSelection(id: string, selected: boolean): void {
    console.log('CardList handleItemSelection:', { id, selected });

    const newSelectedItems = selected ? [...new Set([...selectedItems.value, id])] : selectedItems.value.filter((item) => item !== id);

    console.log('Updating selectedItems:', { old: selectedItems.value, new: newSelectedItems });
    selectedItems.value = newSelectedItems;
}

// Watch selectedItems for changes
watch(
    () => selectedItems.value,
    (newVal) => {
        console.log('CardList selectedItems changed:', newVal);
    },
    { deep: true }
);
</script>

<style lang="scss">
.card-list {
    --grid-gap: 20px;
    border-radius: var(--border-radius);
    background-color: var(--surface-overlay);
    // padding: var(--grid-gap);
    .list-controls {
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
        + .list-grid {
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
        .list-grid {
            --grid-gap: 5px;
            --grid-item-min: 100px;
        }
    }
    &.display-big-cards {
        .list-grid {
            --grid-gap: 20px;
            --grid-item-min: 300px;
        }
    }
    &.display-list {
        .list-grid {
            --grid-gap: 20px;
            --grid-item-min: 300px;
            max-width: 600px;
        }
    }
    .list-grid {
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
