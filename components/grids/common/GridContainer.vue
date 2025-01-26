<template>
    <div :class="containerClasses">
        <div class="grid-controls">
            <Toast />
            <ConfirmDialog />
            <div class="filter-controls">
                <!-- Default Controls -->
                <ModeControl v-model="modeStore.currentMode" @update:modelValue="onModeUpdate" :display="modeControlDisplay" :visibleControls="visibleModeControls" :defaultControl="defaultModeControl" />

                <!-- Update slot binding to pass listings -->
                <slot name="controls" :items="listings" :selected-categories="selectedCategories" :show="show" />

                <!-- Default Display Control -->
                <DisplayControl :visibleSizes="visibleCardSizes" :defaultSize="defaultCardSize" />
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
            <template v-for="(listing, index) in filteredListings" :key="listing.id">
                <CardWrapper v-bind="getCardWrapperProps(listing)" @update:selected="(val: boolean) => handleItemSelection(listing.id, val)">
                    <slot name="card" v-bind="getCardProps(listing)" />
                </CardWrapper>
            </template>
        </fancy-box>

        <vue-draggable v-else-if="modeStore.currentMode === 'order'" class="list-grid" v-model="draggableListings" @start="onStart" @end="onEnd">
            <template v-for="(listing, index) in draggableListings" :key="listing.id">
                <CardWrapper v-bind="getCardWrapperProps(listing)" @update:selected="(val: boolean) => handleItemSelection(listing.id, val)">
                    <slot name="card" v-bind="getCardProps(listing)" />
                </CardWrapper>
            </template>
        </vue-draggable>

        <div v-else class="list-grid">
            <template v-for="listing in filteredListings" :key="listing.id">
                <CardWrapper v-bind="getCardWrapperProps(listing)" @update:selected="(val: boolean) => handleItemSelection(listing.id, val)">
                    <slot name="card" v-bind="getCardProps(listing)" />
                </CardWrapper>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/useSelectionStore';
import { VueDraggable } from 'vue-draggable-plus';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type { Category, Item, Listing, SearchQueryConfig, SortOption } from '@/composables/useListControls';
import { useGridHandleCreateNodeFn, useGridHandleRemoveNodeFn, useGridHandleUpdateNodeFn } from '~/composables/grid.composables';
import { uniqBy, uniq } from '~/service/utils';
import CrudControl from '../controls/CrudControl.vue';
import { useModeStore } from '~/stores/useModeStore';
import { useDisplayStore } from '~/stores/useDisplayStore';

// --- Types ---
type UpdateFunction = (items: any[]) => void;
type ModeType = 'view' | 'select' | 'edit' | 'order'; // Renamed from FunctionMode
type UpdateArrayFieldFn = (field: string, items: Item[], action: 'add' | 'remove') => Promise<void>;

interface FilterConfig {
    field: string;
    options: Item[];
    selected: Item[];
}

interface FilterUpdate {
    selectedCategories?: any[];
    selectedTags?: any[];
    [key: string]: any[] | undefined;
}

interface CardSize {
    label: string;
    icon: string;
    display: string;
}

const handleCreateNodeFn = useGridHandleCreateNodeFn();
const handleUpdateNodeFn = useGridHandleUpdateNodeFn();
const handleDeleteNodeFn = useGridHandleRemoveNodeFn();

// --- Constants ---
const CARD_SIZES: readonly CardSize[] = [
    { label: 'Small Cards', icon: 'cardssmall', display: 'display-small-cards' },
    { label: 'Big Cards', icon: 'cardsbig', display: 'display-big-cards' },
    { label: 'List', icon: 'list', display: 'display-list' }
] as const;

// --- Models & Props ---
const sort = defineModel<SortOption | null>('sort', { default: null });
const searchQuery = defineModel<string>('searchQuery', { default: '' });

const selectedSort = ref<SortOption | null>(null);
const searchQueryConfig = ref<SearchQueryConfig | null>(null);

const props = defineProps({
    modeControlDisplay: {
        // Renamed from functionControlDisplay
        type: String as PropType<'text' | 'icon'>,
        default: 'text'
    },
    visibleModeControls: {
        // Renamed from visibleFunctionControls
        type: Array as PropType<ModeType[] | null>,
        default: () => ['view', 'select', 'edit', 'order'] as ModeType[]
    },
    defaultModeControl: {
        // Renamed from defaultFunctionControl
        type: String as PropType<ModeType>,
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
    },
    listings: {
        type: Array as PropType<Listing[]>,
        default: () => []
    },
    listingCollection: {
        type: String
    },
    onItemCreated: {
        type: Function as PropType<(item: any) => Promise<void>>,
        default: null
    }
});

const emit = defineEmits<{
    'add-selected': [string[]];
    'update:filterUpdates': [FilterUpdate];
}>();

// --- State ---
const confirm = useConfirm();
const toast = useToast();

const listings = ref<Listing[]>(props?.listings ?? useListings());
const selectedCategories = ref<Category[]>([]);

const selectionStore = useSelectionStore();
const modeStore = useModeStore();
const displayStore = useDisplayStore();

// --- Computed ---
// Rename this computed property to be more specific
const categoryFilters = computed(() => [
    {
        field: 'categories',
        options: props.categoryOptions || [],
        selected: selectedCategories.value
    }
]);

const hasSelectedCards = computed(() => selectionStore.hasSelectedItems);

const filteredListings = computed(() => {
    let result = unref(listings.value);

    if (searchQueryConfig.value) {
        result = searchItems(result, searchQueryConfig.value);
    }

    if (selectedSort.value) {
        result = sortItems(result, selectedSort.value);
    }

    if (props.filters?.length) {
        props.filters.forEach((filter) => {
            if (filter.selected.length) {
                result = result.filter((item) => {
                    const fieldValue = item[filter.field];
                    if (!fieldValue) return false;

                    // Handle array fields (like categories)
                    if (Array.isArray(fieldValue)) {
                        const fieldValues = fieldValue.map((i: any) => i.id);
                        return filter.selected.some((selected) => fieldValues.includes(selected.id));
                    }

                    // Handle non-array fields (like categoryGroup)
                    return filter.selected.some((selected) => fieldValue.id === selected.id);
                });
            }
        });
    }

    return result;
});

const draggableListings = ref([...filteredListings.value]);

// Replace selectAll computed with isAllSelected
const isAllSelected = computed(() => filteredListings.value.length > 0 && selectionStore.selectedItems.length === filteredListings.value.length);

const filters = computed(() => [
    {
        field: 'categories',
        options: props.categoryOptions || [],
        selected: selectedCategories.value
    }
]);

// Add computed property for classes
const containerClasses = computed(() => ['grid-container', displayStore.displayClass, modeStore.currentMode]);

// Initialize display size from props
onMounted(() => {
    if (props.defaultCardSize) {
        const defaultSize = CARD_SIZES.find((size) => size.label === props.defaultCardSize);
        if (defaultSize) {
            displayStore.setSize(defaultSize);
        }
    }
});

// --- Methods ---
// Selection handling
function handleItemSelection(id: string, selected: boolean): void {
    console.log('CardList handleItemSelection:', { id, selected });
    if (selected) {
        selectionStore.add(id);
    } else {
        selectionStore.remove(id);
    }
    console.log('Updated selectedItems:', selectionStore.selectedItems);
}

function toggleSelectAll(value: boolean) {
    console.log('toggleSelectAll:', value);
    if (value) {
        selectionStore.setMultiple(filteredListings.value.map((listing) => listing.id));
    } else {
        selectionStore.clear();
    }
}

// CRUD operations
async function deleteSelectedItems() {
    if (props.listingCollection) {
        for (const listingId of selectionStore.selectedItems) {
            const dbNode = listings.value.find((listing) => listing.id === listingId)?.dbNode;

            if (!dbNode) {
                continue;
            }

            await handleDeleteNodeFn(dbNode);
        }
    }

    selectionStore.clear();
}

function addSelectedItems() {
    emit('add-selected', selectionStore.selectedItems);
}

function confirmDelete() {
    confirm.require({
        header: 'Confirm Delete',
        rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
        acceptProps: { label: 'Delete', severity: 'danger' },
        accept: () => {
            deleteSelectedItems();
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Selected items have been deleted',
                life: 3000
            });
        }
    });
}

// Update handlers
const updateArrayField: UpdateArrayFieldFn = async (field, items, action) => {
    for (const selectedItemId of selectionStore.selectedItems) {
        const listing = listings.value.find((listing) => listing.id === selectedItemId);

        if (!listing) {
            continue;
        }

        const dbNode = listing.dbNode;

        let fieldValues;

        if (action === 'add') {
            fieldValues = [...dbNode[field], ...items];

            if (fieldValues.length) {
                if (fieldValues[0].id) {
                    fieldValues = uniqBy(fieldValues, 'id');
                } else {
                    fieldValues = uniq(fieldValues);
                }
            }
        } else {
            fieldValues = dbNode[field].filter((item: Item) => !items.some((toRemove) => toRemove.id === item.id));
        }

        const updatedDbNode = {
            ...dbNode,
            [field]: fieldValues
        };

        await handleUpdateNodeFn(updatedDbNode);
    }

    selectionStore.clear();
};

// function handleUpdateField(field: string, items: Item[], action: 'add' | 'remove') {
//     updateArrayField(field, items, action);
//
//     const filterConfig = props.filters.find((f) => f.field === field);
//     if (filterConfig) {
//         const updatedSelected =
//             action === 'add' ? [...filterConfig.selected, ...items.filter((item) => !filterConfig.selected.some((selected) => selected.id === item.id))] : filterConfig.selected.filter((selected) => !items.some((item) => item.id === selected.id));
//
//         emit('update:filterUpdates', {
//             ...props.filterUpdates,
//             [`selected${field.charAt(0).toUpperCase() + field.slice(1)}`]: updatedSelected
//         });
//     }
// }

function sortItems<T>(items: T[], selectedSort: SortOption): T[] {
    if (!selectedSort) {
        return items;
    }

    const { sort, order } = selectedSort;

    return [...items].sort((a: any, b: any) => {
        const aVal = a[sort];
        const bVal = b[sort];
        return order === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
}

function searchItems<T extends Record<string, any>>(items: T[], searchQueryConfig: SearchQueryConfig): T[] {
    if (!searchQueryConfig) {
        return items;
    }

    const searchTerm = searchQueryConfig.searchQuery.toLowerCase().trim();
    return items.filter((item) =>
        searchQueryConfig.searchFields.some((field) => {
            const value = item[field.field];
            return value != null && String(value).toLowerCase().includes(searchTerm);
        })
    );
}

function getCardProps(listing: Listing) {
    return {
        listing,
        mode: unref(modeStore.currentMode),
        show: displayStore.currentShow,
        dbNode: listing.dbNode,
        onNameUpdate: (newName: string) => handleNameUpdate(listing.id, newName),
        onCategoriesUpdate: (newCategories: Category[]) => handleCategoriesUpdate(listing.id, newCategories),
        onListingSelectionUpdate: (selected: boolean) => handleListingSelectionUpdate(listing.id, selected)
    };
}

function getCardWrapperProps(listing: Listing) {
    return {
        id: listing.id,
        imageId: listing?.images?.[0]?.id,
        name: listing?.name,
        mode: unref(modeStore.currentMode),
        show: displayStore.currentShow,
        listing
    };
}

// Drag handlers
function onStart(): void {
    console.log('start drag');
}

function onEnd(): void {
    console.log('end drag');
}

function onModeUpdate(newMode: ModeType) {
    modeStore.setMode(newMode);
    selectionStore.clear();
}

// --- Watchers ---
watch(filteredListings, (newListings) => {
    draggableListings.value = [...newListings];
});

watch(
    () => props.show,
    (newShow) => {
        displayStore.setShow(newShow);
    }
);

watch(
    () => selectionStore.selectedItems,
    (newVal, oldVal) => {
        console.log('selectedItems changed:', {
            old: oldVal,
            new: newVal,
            hasSelected: newVal.length > 0
        });
    },
    { deep: true }
);

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
            selectionStore.clear();
        }
    }
);

// Add these functions to handle updates
function handleNameUpdate(id: string, newName: string) {
    listings.value = listings.value.map((listing) => {
        if (listing.id === id) {
            return { ...listing, name: newName };
        }
        return listing;
    });
}

function handleCategoriesUpdate(id: string, newCategories: Category[]) {
    listings.value = listings.value.map((listing) => {
        if (listing.id === id) {
            return { ...listing, categories: newCategories };
        }
        return listing;
    });
}

function handleListingSelectionUpdate(id: string, selected: boolean) {
    if (selected) {
        selectionStore.add(id);
    } else {
        selectionStore.remove(id);
    }
}

async function handleCreateSave(savedData: any) {
    if (props.onItemCreated) {
        await props.onItemCreated(savedData);
    }
}
// --- Provides ---
provide('updateArrayField', updateArrayField);
provide('updateShow', (fields: string[]) => (displayStore.show = fields));
provide('updateSearchQueryConfig', (config: SearchQueryConfig) => (searchQueryConfig.value = config));
provide('updateItemsSorting', (sort: SortOption) => (selectedSort.value = sort));
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
