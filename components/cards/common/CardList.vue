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
            <card-wrapper
                v-for="(listing, index) in filteredListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :gallery="gallery"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            >
                <slot name="card" :listing="listing" :mode="mode" :selected="selectedItems.includes(listing.id)" :show="show" />
            </card-wrapper>
        </fancy-box>

        <!-- Draggable Grid Section (Order Mode) -->
        <vue-draggable v-else-if="mode === 'order'" class="list-grid" v-model="draggableListings" @start="onStart" @end="onEnd">
            <CardWrapper
                v-for="(listing, index) in draggableListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            >
                <slot name="card" :listing="listing" :mode="mode" :selected="selectedItems.includes(listing.id)" :show="show" />
            </CardWrapper>
        </vue-draggable>

        <!-- Default Grid Section (Non-View, Non-Order Modes) -->
        <div v-else class="list-grid">
            <CardWrapper
                v-for="(listing, index) in filteredListings"
                :key="index"
                :imageId="listing.images[0].id"
                :id="listing.id"
                :mode="mode"
                :show="show"
                :selected.sync="selectedItems.includes(listing.id)"
                @update:selected="updateSelectedItems(listing.id, $event)"
            >
                <slot name="card" :listing="listing" :mode="mode" :selected="selectedItems.includes(listing.id)" :show="show" />
            </CardWrapper>
        </div>
    </div>
</template>

<script setup lang="ts">
// Keep only non-Vue imports
import { VueDraggable } from 'vue-draggable-plus';
import type { Category, SortOption } from '@/composables/useListControls';

// Type definitions for update functions
type UpdateFunction = (items: any[]) => void;

// Only define these functions once
const updateSort: UpdateFunction = (items) => {
    sortedItems.value = items;
};

const updateSearch: UpdateFunction = (items) => {
    searchResults.value = items;
};

const updateShow = (fields: string[]) => {
    show.value = fields;
};

// Remove duplicate sort definition and consolidate state
const sort = defineModel<SortOption | null>('sort', { default: null });
const searchQuery = defineModel<string>('searchQuery', { default: '' });
const selectedCategories = defineModel<Category[]>('selectedCategories', { default: () => [] });

// Type the refs properly
const show = ref<string[]>(['name', 'categories']);
const searchResults = ref<any[]>([]);
const sortedItems = ref<any[]>([]);

// Provide the update functions
provide('updateSort', updateSort);
provide('updateSearch', updateSearch);
provide('updateShow', updateShow);

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

const filters = ref<FilterConfig[]>(props.filters);
const selectedSize = ref(cardSizes.value.find((option) => option.label === props.defaultCardSize) || cardSizes.value[0]);
const mode = ref<FunctionMode>(props.defaultFunctionControl);

const filteredListings = computed(() => {
    let result = listings.value;

    // Apply filters - generic filtering for any field
    if (props.filters?.length) {
        props.filters.forEach((filter: FilterConfig) => {
            if (filter.selected.length > 0) {
                result = result.filter((listing) => {
                    const fieldValues = listing[filter.field]?.map((item: { id: number }) => item.id) || [];
                    return filter.selected.some((selected: { id: number }) => fieldValues.includes(selected.id));
                });
            }
        });
    }

    // Apply search filter
    if (searchQuery.value) {
        result = result.filter((listing) => listing.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    }

    // Apply sort
    if (sort.value) {
        const { sort: sortField, order } = sort.value;
        result = [...result].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            return order === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
        });
    }

    // Use search results if available
    if (searchResults.value.length) {
        result = searchResults.value;
    } else if (searchQuery.value) {
        // Fallback to basic search if no results from SearchControl
        result = result.filter((listing) => listing.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    }

    // Use sorted items if available
    if (sortedItems.value.length) {
        result = sortedItems.value;
    } else if (sort.value) {
        // Fallback to basic sort if no results from SortControl
        const { sort: sortField, order } = sort.value;
        result = [...result].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            return order === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
        });
    }

    return result;
});

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
