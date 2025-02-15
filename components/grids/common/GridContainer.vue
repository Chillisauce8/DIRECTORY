<template>
    <div class="grid-container" :class="containerClasses">
        <div class="grid-controls">
            <Toast />
            <ConfirmDialog />
            <div class="filter-controls">
                <slot name="controls" :items="listings" />
                <slot name="add-controls">
                    <template v-if="props.listingCollection">
                        <CrudControl :collection="listingCollection" function="create" @save="handleCreateSave">
                            <template #default="{ onClick }">
                                <Button class="font-semibold" outlined icon="pi pi-plus" label="Add New" @click="onClick" />
                            </template>
                        </CrudControl>
                    </template>
                </slot>
            </div>

            <!-- Replace SelectControls with direct implementation -->
            <div v-if="modeStore.currentMode === 'edit' || modeStore.currentMode === 'select'" class="select-controls">
                <ToggleButton :modelValue="isAllSelected" @update:modelValue="toggleSelectAll" class="select-all" onLabel="Deselect All" offLabel="Select All" onIcon="pi pi-check-circle" offIcon="pi pi-circle" />
                <template v-if="hasSelectedCards">
                    <Button v-if="modeStore.currentMode === 'select'" label="Add Selected" class="add-selected" icon="pi pi-plus-circle" outlined raised @click="addSelectedItems" />
                    <template v-if="modeStore.currentMode === 'edit'">
                        <Button label="Delete Selected" class="delete-selected" icon="pi pi-trash" outlined raised @click="confirmDelete" />
                        <slot name="edit-controls" />
                    </template>
                </template>
            </div>
        </div>

        <fancy-box v-if="modeStore.currentMode === 'view'" class="list-grid" :options="{ Carousel: { infinite: true } }">
            <template v-for="listing in filteredListings" :key="listing._id">
                <slot name="card" :listing="listing" />
            </template>
        </fancy-box>

        <vue-draggable v-else-if="modeStore.currentMode === 'order'" class="list-grid" v-model="draggableListings" @start="onStart" @end="onEnd">
            <template v-for="listing in draggableListings" :key="listing._id">
                <slot name="card" :listing="listing" />
            </template>
        </vue-draggable>

        <div v-else class="list-grid">
            <template v-for="listing in paginatedListings" :key="listing._id">
                <slot name="card" :listing="listing" />
            </template>
        </div>

        <!-- Add Paginator -->
        <Paginator
            v-model:first="first"
            v-model:rows="rows"
            :total-records="totalRecords"
            :rows-per-page-options="[12, 24, 48, 96]"
            template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
            class="grid-paginator"
        />
    </div>
</template>

<script setup lang="ts">
// ==========================================================
// Imports: External Libraries, Composables and Components
// ==========================================================
import { ref, computed, watch, onMounted, inject, unref } from 'vue';
import { getNestedValue } from '~/composables/useFilters';
import { createSelectedStore } from '~/stores/useSelectedStore';
import { createModeStore } from '~/stores/useModeStore';
import { createSortStore } from '~/stores/useSortStore';
import { createShowStore } from '~/stores/useShowStore';
import { createSearchStore } from '~/stores/useSearchStore';
import { createFilterStore } from '~/stores/useFilterStore';
import { VueDraggable } from 'vue-draggable-plus';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import CrudControl from '../controls/CrudControl.vue';
import { uniqBy, uniq } from '~/service/utils';
import { createDisplayStore } from '~/stores/useDisplayStore';

import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import { get, set, debounce } from 'lodash-es'; // Add 'set' to the import

import { createGridDataStore } from '~/stores/useGridDataStore';
import { useDebouncedRef } from '~/composables/useDebounce';
import Paginator from 'primevue/paginator';

// ...other component imports (ModeControl, DisplayControl, Toast, ConfirmDialog, etc.)

// ==========================================================
// Type Definitions & Interfaces
// ==========================================================
type ModeType = 'view' | 'select' | 'edit' | 'order';
type UpdateArrayFieldFn = (field: string, items: Item[], action: 'add' | 'remove') => Promise<void>;

interface DbNode {
    _id: string;
    [key: string]: any;
}

interface Item {
    id?: string;
    name?: string;
    value?: any;
    [key: string]: any;
}

interface Listing {
    _id: string;
    name: string;
    images?: any[];
    dbNode?: any;
    [key: string]: any;
}

import { useSortStore, type SortOption } from '~/stores/useSortStore';

// ==========================================================
// Injected Functions (CRUD Handlers)
// ==========================================================
import { GridCreateNodeFn, GridRemoveNodeFn, GridUpdateNodeFn, type GridCreateNodeFn as GridCreateNodeType, type GridModifyNodeFn } from '~/composables/useGrid';

// Fix the injections to use proper typing
const handleCreateNodeFn = inject(GridCreateNodeFn) as typeof GridCreateNodeType;
const handleUpdateNodeFn = inject(GridUpdateNodeFn) as GridModifyNodeFn;
const handleDeleteNodeFn = inject(GridRemoveNodeFn) as GridModifyNodeFn;

// ==========================================================
// Constants
// ==========================================================

// ==========================================================
// Models, Props and Emits
// ==========================================================
const props = defineProps({
    gridId: { type: String, required: true },
    // Remove display-related props
    visibleCardSizes: { type: Array as PropType<string[] | null>, default: () => ['Small Cards', 'Big Cards', 'List'] },
    defaultCardSize: { type: String, default: 'Big Cards' },
    gallery: { type: String, default: 'gallery' },
    minSearchLength: { type: Number, default: 1 },
    initialSize: { type: String, default: 'Big Cards' },
    categoryOptions: { type: Array as PropType<Item[]>, default: () => [] },
    filterUpdates: { type: Object as PropType<FilterUpdate>, default: () => ({}) },
    filters: { type: Array as PropType<FilterConfig[]>, default: () => [] },
    listings: { type: Array as PropType<Listing[]>, default: () => [] },
    listingCollection: { type: String },
    onItemCreated: { type: Function as PropType<(item: any) => Promise<void>>, default: null },
    sortOptions: {
        type: Array as PropType<SortOption[]>,
        default: () => []
    },
    searchQuery: { type: String, default: '' },
    showSelectedOptions: {
        type: Array as PropType<string[]>,
        default: () => []
    }
});
const emit = defineEmits<{
    'add-selected': [string[]];
    'update:data-item': [DbNode];
}>();

// ==========================================================
// State: Third-party Instances, Reactivity and Stores
// ==========================================================
const confirm = useConfirm();
const toast = useToast();

const listings = ref<Listing[]>(props?.listings ?? useListings());
const selectedStore = createSelectedStore(props.gridId)();
const modeStore = createModeStore(props.gridId)();
const showStore = createShowStore(props.gridId)();
const searchStore = createSearchStore(props.gridId)();
const filterStore = createFilterStore(props.gridId)();
const sortStore = createSortStore(props.gridId)();
const displayStore = createDisplayStore(props.gridId)();

// Initialize GridDataStore
const gridDataStore = createGridDataStore(props.gridId)();

// ==========================================================
// Computed Properties
// ==========================================================
// Change this computed property to use the store's getter
const hasSelectedCards = computed(() => selectedStore.hasSelectedItems);

// Remove the first filteredListings computed and keep only the simplified version
// Add memoized sort values
const sortedItemsCache = new Map<string, {value: string, item: any}[]>();

// Split computed properties for better reactivity
const filteredResults = computed(() => gridDataStore.filteredByFilters);

const sortKey = computed(() => {
    const sort = sortStore.currentSort;
    return sort ? `${sort.sort}-${sort.order}` : '';
});

const sortedItems = computed(() => {
    const result = filteredResults.value;
    const key = sortKey.value;
    
    if (!key) return result;
    
    // Check cache
    if (!sortedItemsCache.has(key)) {
        const items = result.map(item => ({
            item,
            value: String(get(item, sortStore.currentSort?.sort || '') || '')
        }));
        sortedItemsCache.set(key, items);
    }
    
    const cached = sortedItemsCache.get(key)!;
    return cached
        .sort((a, b) => 
            sortStore.currentSort?.order === 'asc' 
                ? a.value.localeCompare(b.value)
                : b.value.localeCompare(a.value))
        .map(({ item }) => item);
});

// Final computed property combines everything
const filteredListings = computed(() => sortedItems.value);

// Track draggable version of listings
const draggableListings = ref([...filteredListings.value]);

// Check if all visible listings are selected
const isAllSelected = computed(() => {
    const filteredIds = filteredListings.value.map((listing) => listing._id);
    const selectedSet = selectedStore.selectedItemsSet;
    return filteredIds.length > 0 && filteredIds.every((id) => selectedSet.has(id));
});

// Manage container CSS classes based on display and mode
const containerClasses = computed(() => [
    modeStore.currentMode,
    displayStore.displayClass // Add this back to include display classes
]);

// Add pagination state
const first = ref(0);
const rows = ref(24);

// Add computed properties for pagination
const totalRecords = computed(() => filteredListings.value.length);
const paginatedListings = computed(() => {
    const start = first.value;
    const end = start + rows.value;
    return filteredListings.value.slice(start, end);
});

// ==========================================================
// Methods: CRUD Operations, Selections, Drag Handlers, etc.
// ==========================================================
function toggleSelectAll(value: boolean) {
    const filteredIds = filteredListings.value.map((listing) => listing._id);
    if (value) {
        selectedStore.setMultiple(filteredIds);
    } else {
        selectedStore.clear();
    }
}

// Update the delete function with better error handling and logging
async function deleteSelectedItems() {
    if (props.listingCollection) {
        try {
            console.debug('Starting deletion of items:', selectedStore.selectedItems);

            for (const listingId of selectedStore.selectedItems) {
                const listing = listings.value.find((listing) => listing._id === listingId);
                if (!listing?.dbNode) {
                    console.error('No dbNode found for listing:', listingId);
                    continue;
                }

                console.debug('Deleting item:', listing.dbNode);
                await handleDeleteNodeFn(listing.dbNode);
                console.debug('Successfully deleted item:', listingId);

                // Remove from local listings after successful delete
                listings.value = listings.value.filter((item) => item._id !== listingId);
            }

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Selected items have been deleted',
                life: 3000
            });

            selectedStore.clear();
        } catch (error) {
            console.error('Delete operation failed:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to delete selected items: ${error.message}`,
                life: 3000
            });
        }
    }
}

function addSelectedItems() {
    emit('add-selected', selectedStore.selectedItems);
}

function confirmDelete() {
    confirm.require({
        header: 'Confirm Delete',
        message: 'Are you sure you want to delete the selected items?',
        rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
        acceptProps: { label: 'Delete', severity: 'danger' },
        accept: async () => {
            await deleteSelectedItems();
            confirm.close(); // Close the dialog after deletion completes
        },
        reject: () => {
            confirm.close(); // Also close on reject
        }
    });
}

// Updates a particular field in a listing by applying add or remove actions
const updateArrayField: UpdateArrayFieldFn = async (field, items, action) => {
    for (const selectedItemId of selectedStore.selectedItems) {
        const listing = listings.value.find((listing) => listing.id === selectedItemId);
        if (!listing) continue;
        const dbNode = listing.dbNode;
        let fieldValues;
        
        // Use get for nested path access
        const currentValues = get(dbNode, field, []);
        
        if (action === 'add') {
            fieldValues = [...currentValues, ...items];
            if (fieldValues.length) {
                fieldValues = fieldValues[0].id ? uniqBy(fieldValues, 'id') : uniq(fieldValues);
            }
        } else {
            fieldValues = currentValues.filter((item: Item) => !items.some((toRemove) => toRemove.id === item.id));
        }

        // Use set for nested path updates
        const updatedDbNode = { ...dbNode };
        set(updatedDbNode, field, fieldValues);
        
        await handleUpdateNodeFn(updatedDbNode);
    }
    selectedStore.clear();
};

// Drag event handlers
function onStart(): void {
    console.log('start drag');
}
function onEnd(): void {
    console.log('end drag');
}

// Handles mode changes; clears selection if switching away from edit/select modes

// ==========================================================
// Watchers: React to Changes in Listings, Mode, etc.
// ==========================================================
watch(filteredListings, (newListings) => {
    draggableListings.value = [...newListings];
});

watch(
    () => props.listings,
    (newListings) => {
        listings.value = newListings;
    }
);

watch(
    () => modeStore.currentMode,
    (newMode) => {
        if (newMode === 'view' || newMode === 'order') {
            selectedStore.clear();
        }
    }
);

// Update watchers
watch(() => props.listings, (newListings) => {
    gridDataStore.originalData = newListings;
    // Clear sort cache when data changes
    sortedItemsCache.clear();
}, { immediate: true });

// Clear sort cache when sort changes
watch(sortKey, () => {
    sortedItemsCache.clear();
});

// Use debounce for search/filter updates
const updateFilters = debounce((selectedFilters) => {
    if (selectedFilters.length) {
        gridDataStore.addFilter('filters', (items) => 
            items.filter(item => 
                selectedFilters.every(([field, selectedValues]) => {
                    if (!selectedValues?.length) return true;
                    const fieldValue = get(item, field);
                    if (!fieldValue) return false;
                    const itemValues = Array.isArray(fieldValue) 
                        ? fieldValue.map(v => typeof v === 'object' ? v.name : v)
                        : [typeof fieldValue === 'object' ? fieldValue.name : fieldValue];
                    return selectedValues.some(selected => 
                        itemValues.includes(typeof selected === 'object' ? selected.value : selected)
                    );
                })
            )
        );
    } else {
        gridDataStore.removeFilter('filters');
    }
}, 100);

// Watch for filter changes
watch(
    () => [...Object.entries(filterStore.$state.selectedFilters)],
    (selectedFilters) => {
        if (selectedFilters.length) {
            gridDataStore.addFilter('filters', (items) => 
                items.filter(item => 
                    selectedFilters.every(([field, selectedValues]) => {
                        if (!selectedValues?.length) return true;
                        
                        const fieldValue = get(item, field);
                        if (!fieldValue) return false;
                        
                        const itemValues = Array.isArray(fieldValue) 
                            ? fieldValue.map(v => typeof v === 'object' ? v.name : v)
                            : [typeof fieldValue === 'object' ? fieldValue.name : fieldValue];
                            
                        return selectedValues.some(selected => 
                            itemValues.includes(typeof selected === 'object' ? selected.value : selected)
                        );
                    })
                )
            );
        } else {
            gridDataStore.removeFilter('filters');
        }
    },
    { deep: true }
);

// Watch for search changes - replace the existing watch with this optimized version
watch(
    () => searchStore.searchQuery,
    (query) => {
        if (query) {
            const searchRegex = new RegExp(escapeRegExp(query), 'i');
            
            gridDataStore.addFilter('search', (items) => 
                items.filter(item => 
                    searchStore.searchFields.some(field => {
                        const value = get(item, field.field);
                        return value && searchRegex.test(String(value));
                    })
                )
            );
        } else {
            gridDataStore.removeFilter('search');
        }
    }
);

// Add utility function
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Combine the duplicate watchers into one efficient watcher
watch(
    filteredListings,
    (newItems) => {
        // Check for auto-update filters once
        const hasAutoUpdateFilters = document.querySelector('[auto-update="true"]');
        
        // Only update filter options if needed
        if (hasAutoUpdateFilters) {
            updateFilterOptions(newItems);
        }

        // Always update selections visibility
        const visibleIds = new Set(newItems.map(l => l._id));
        selectedStore.filterSelections(visibleIds);
    },
    { immediate: true }
);

// Add debounced update function
const updateFilterOptions = debounce((items: any[]) => {
    filterStore.updateFilterOptionsFromItems(items);
}, 300);

// Remove registration system and simplify
watch(
    filteredListings,
    (newItems) => {
        const filterControls = document.querySelectorAll('filter-control');
        const hasAutoUpdateFilters = Array.from(filterControls).some(control => 
            control.getAttribute(':auto-update') === 'true' || 
            control.getAttribute('auto-update') === 'true'
        );
        
        if (hasAutoUpdateFilters) {
            updateFilterOptions(newItems);
        }
    },
    { immediate: true }
);

// Add this watcher for filtered results
watch(
    filteredListings,
    (newItems) => {
        // Only update store if there are auto-update filters
        const filterControls = document.querySelectorAll('[auto-update="true"]');
        if (filterControls.length > 0) {
            filterStore.updateFilterOptionsFromItems(newItems);
        }
    },
    { immediate: true }
);

// Single, efficient watcher for filtered results
watch(
    filteredListings,
    (newItems) => {
        // For filter updates - using proper attribute check
        const hasAutoUpdateFilters = document.querySelector('[auto-update="true"]');
        if (hasAutoUpdateFilters) {
            filterStore.updateFilterOptionsFromItems(newItems);
        }

        // For selection tracking
        const visibleIds = new Set(newItems.map(l => l._id));
        selectedStore.filterSelections(visibleIds);

        // For draggable updates
        draggableListings.value = [...newItems];
    },
    { immediate: true }
);

// Remove all other filteredListings watchers

// ==========================================================
// Lifecycle: onMounted Initialization
// ==========================================================
onMounted(() => {
    if (props.sort) {
        sortStore.setSort(props.sort);
    }
    // Add this initialization
    const showSelectedOptions = props.showSelectedOptions ?? [];
    showStore.initialize(showSelectedOptions);
    // Remove mode initialization since it's now handled by ModeControl
});

// ==========================================================
// Update Handlers and Provides: Handling external updates to listings
// ==========================================================
async function handleCreateSave(savedData: any) {
    // First update internal listings
    await handleItemCreated(savedData);

    // Then call the optional callback if provided
    if (props.onItemCreated) {
        await props.onItemCreated(savedData);
    }
}

function handleDbNodeUpdate(dbNode: DbNode) {
    updateDbNodeInListingList(dbNode);
    emit('update:data-item', dbNode);
}

async function handleItemCreated(newItem: DbNode) {
    listings.value = [...listings.value, { ...newItem, dbNode: newItem }];
    emit('item-created', newItem);
}

// Add the missing function
function updateDbNodeInListingList(dbNode: DbNode) {
    const index = listings.value.findIndex((listing) => listing._id === dbNode._id);
    if (index !== -1) {
        listings.value[index] = { ...listings.value[index], dbNode };
    }
}

// Provide functions for external usage

provide('handleDbNodeUpdate', handleDbNodeUpdate);
provide('handleItemCreated', handleItemCreated);
provide('updateArrayField', updateArrayField);

provide('updateItemsSorting', (sort: SortOption) => sortStore.setSort(sort));

provide('filterStore', filterStore);
provide('showStore', showStore);
provide('searchStore', searchStore);
provide('selectedStore', selectedStore);
provide('displayStore', displayStore);
provide('modeStore', modeStore);
provide('sortStore', sortStore);
</script>

<style lang="scss">
.grid-container {
    --grid-gap: 20px;
    border-radius: var(--border-radius);
    background-color: var(--surface-overlay);

    background-color: var(--surface-semi-transparent);
    // padding: var(--grid-gap);
    .grid-controls {
        animation: fill-background linear;
        animation-timeline: scroll();
        background-color: transparent;
        backdrop-filter: none;
        box-shadow: none;
        padding: calc(var(--grid-gap) / 2) var(--grid-gap);
        position: sticky;
        top: 0px;
        z-index: 1;
        font-size: 14px;
        .filter-controls {
            display: flex;
            gap: 10px;
            align-items: center;
            //     background-color: aquamarine;
            //   height: 60px;
            .p-button {
                margin: 0;
            }
        }
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
            width: 1.36em;
            height: 1.36em;
        }
        .p-togglebutton-label {
            text-transform: capitalize;
        }
        .p-togglebutton {
            font-size: 1em;
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

    .grid-paginator {
        padding: var(--grid-gap);
        background: var(--surface-card);
        border-top: var(--surface-border);
        
        .p-paginator-current {
            min-width: 120px;
        }
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
