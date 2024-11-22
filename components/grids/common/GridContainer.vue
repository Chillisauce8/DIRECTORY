<template>
    <div :class="['card-list', selectedSize?.display || '', mode]">
        <div class="list-controls">
            <Toast />
            <ConfirmDialog />
            <div class="filter-controls flex flex-col lg:flex-row gap-4">
                <!-- Default Controls -->
                <FunctionControl v-model="mode" @update:modelValue="onModeUpdate" :display="functionControlDisplay" :visibleControls="visibleFunctionControls" :defaultControl="defaultFunctionControl" />

                <!-- Update slot binding to pass listings -->
                <slot name="controls" :items="listings" :selected-categories="selectedCategories" :show="show"/>

                <!-- Default Display Control -->
                <DisplayControl v-model="selectedSize" :visibleSizes="visibleCardSizes" :defaultSize="defaultCardSize" />
                <AddControl />
            </div>

            <!-- Replace SelectControls with direct implementation -->
            <div v-if="mode === 'edit' || mode === 'select'" class="select-controls">
                <ToggleButton :modelValue="isAllSelected" @update:modelValue="toggleSelectAll" class="select-all" onLabel="Deselect All" offLabel="Select All" onIcon="pi pi-check-circle" offIcon="pi pi-circle" />
                <template v-if="hasSelectedCards">
                    <Button v-if="mode === 'select'" label="Add Selected" class="add-selected" icon="pi pi-plus-circle" outlined raised @click="addSelectedItems" />
                    <template v-if="mode === 'edit'">
                        <Button label="Delete Selected" class="delete-selected" icon="pi pi-trash" outlined raised @click="confirmDelete" />
                        <slot name="edit-controls" />
                    </template>
                </template>
            </div>
        </div>

        <fancy-box v-if="mode === 'view'" class="list-grid" :options="{ Carousel: { infinite: true } }">
            <template v-for="(listing, index) in filteredListings" :key="listing.id">
                <CardWrapper v-bind="getCardWrapperProps(listing)"
                             @update:selected="(val: boolean) => handleItemSelection(listing.id, val)">
                    <slot name="card" v-bind="getCardProps(listing)"/>
                </CardWrapper>
            </template>
        </fancy-box>

        <vue-draggable v-else-if="mode === 'order'" class="list-grid" v-model="draggableListings" @start="onStart" @end="onEnd">
            <template v-for="(listing, index) in draggableListings" :key="listing.id">
                <CardWrapper v-bind="getCardWrapperProps(listing)"
                             @update:selected="(val: boolean) => handleItemSelection(listing.id, val)">
                  <slot name="card" v-bind="getCardProps(listing)"/>
                </CardWrapper>
            </template>
        </vue-draggable>

        <div v-else class="list-grid">
            <template v-for="listing in filteredListings" :key="listing.id">
                <CardWrapper v-bind="getCardWrapperProps(listing)"
                             @update:selected="(val: boolean) => handleItemSelection(listing.id, val)">
                    <slot name="card"
                          v-bind="getCardProps(listing)"/>
                </CardWrapper>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
// --- Imports ---
import { VueDraggable } from 'vue-draggable-plus';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type {Category, SearchQueryConfig, SortOption} from '@/composables/useListControls';

// --- Types ---
type UpdateFunction = (items: any[]) => void;
type FunctionMode = 'view' | 'select' | 'edit' | 'order';
type UpdateArrayFieldFn = (field: string, items: Item[], action: 'add' | 'remove') => void;

interface Item {
    id: number;
    name: string;
    [key: string]: any;
}

interface Listing {
    id: string;
    images: { id: string; alt: string }[];
    name: string;
    categories: Category[];
    [key: string]: any;
}

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

// --- Constants ---
const CARD_SIZES: readonly CardSize[] = [
    { label: 'Small Cards', icon: 'cardssmall', display: 'display-small-cards' },
    { label: 'Big Cards', icon: 'cardsbig', display: 'display-big-cards' },
    { label: 'List', icon: 'list', display: 'display-list' }
] as const;

// --- Models & Props ---
const sort = defineModel<SortOption | null>('sort', { default: null });
const searchQuery = defineModel<string>('searchQuery', { default: '' });
const selectedCategories = defineModel<Category[]>('selectedCategories', { default: () => [] });

const selectedSort = ref<SortOption | null>(null);
const searchQueryConfig = ref<SearchQueryConfig | null>(null);

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

const emit = defineEmits<{
    'add-selected': [string[]];
    'update:filterUpdates': [FilterUpdate];
}>();

// --- State ---
const confirm = useConfirm();
const toast = useToast();

const listings = ref<Listing[]>(useListings());
const selectedItems = ref<string[]>([]);
const mode = ref<FunctionMode>(props.defaultFunctionControl);
const show = ref<string[]>(props?.show ?? ['name', 'categories']);
const filters = ref<FilterConfig[]>(props.filters);
const selectedSize = ref(CARD_SIZES.find((option: CardSize) => option.label === props.defaultCardSize) || CARD_SIZES[0]);

// --- Computed ---
const hasSelectedCards = computed(() => {
    const hasSelected = selectedItems.value.length > 0;
    console.log('hasSelectedCards computed:', { hasSelected, items: selectedItems.value });
    return hasSelected;
});

const filteredListings = computed(() => {
    let result = unref(listings.value)

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
                    const fieldValues = item[filter.field]?.map((i: any) => i.id) || [];
                    return filter.selected.some((selected) => fieldValues.includes(selected.id));
                });
            }
        });
    }

    return result;
});

const draggableListings = ref([...filteredListings.value]);

// Replace selectAll computed with isAllSelected
const isAllSelected = computed(() => filteredListings.value.length > 0 && selectedItems.value.length === filteredListings.value.length);

// --- Methods ---
// Selection handling
function handleItemSelection(id: string, selected: boolean): void {
    console.log('CardList handleItemSelection:', { id, selected });
    if (selected) {
        selectedItems.value = [...new Set([...selectedItems.value, id])];
    } else {
        selectedItems.value = selectedItems.value.filter((item) => item !== id);
    }
    console.log('Updated selectedItems:', selectedItems.value);
}

function toggleSelectAll(value: boolean) {
    console.log('toggleSelectAll:', value);
    selectedItems.value = value ? filteredListings.value.map((listing) => listing.id) : [];
}

// CRUD operations
function deleteSelectedItems() {
    listings.value = listings.value.filter((listing) => !selectedItems.value.includes(listing.id));
    selectedItems.value = [];
}

function addSelectedItems() {
    emit('add-selected', selectedItems.value);
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
const updateArrayField: UpdateArrayFieldFn = (field, items, action) => {
    listings.value = listings.value.map((listing) => {
        if (selectedItems.value.includes(listing.id)) {
            const currentField = listing[field] || [];
            return {
                ...listing,
                [field]: action === 'add' ? [...currentField, ...items.filter((item) => !currentField.some((existing: Item) => existing.id === item.id))] : currentField.filter((item: Item) => !items.some((toRemove) => toRemove.id === item.id))
            };
        }
        return listing;
    });
};

function handleUpdateField(field: string, items: Item[], action: 'add' | 'remove') {
    updateArrayField(field, items, action);

    const filterConfig = props.filters.find((f) => f.field === field);
    if (filterConfig) {
        const updatedSelected =
            action === 'add' ? [...filterConfig.selected, ...items.filter((item) => !filterConfig.selected.some((selected) => selected.id === item.id))] : filterConfig.selected.filter((selected) => !items.some((item) => item.id === selected.id));

        emit('update:filterUpdates', {
            ...props.filterUpdates,
            [`selected${field.charAt(0).toUpperCase() + field.slice(1)}`]: updatedSelected
        });
    }
}

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
    const isSelected = selectedItems.value.includes(listing.id);
    console.log('getCardProps:', { listingId: listing.id, isSelected });

    return {
        listing,
        mode: unref(mode),
        selected: isSelected,
        show: show.value
    };
}


function getCardWrapperProps(listing: Listing) {
    const isSelected = selectedItems.value.includes(listing.id);

    return {
        id: listing.id,
        imageId: listing.images[0].id,
        name: listing?.name,
        mode: unref(mode),
        selected: isSelected,
        show: show.value,
        categories: listing.categories,
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


function onModeUpdate(mode: FunctionMode) {
    selectedItems.value = [];
}

// --- Watchers ---
watch(filteredListings, (newListings) => {
    draggableListings.value = [...newListings];
});

watch(
    () => props.show,
    (newShow) => {
        show.value = newShow;
    }
);

watch(
    selectedItems,
    (newVal, oldVal) => {
        console.log('selectedItems changed:', {
            old: oldVal,
            new: newVal,
            hasSelected: newVal.length > 0
        });
    },
    { deep: true }
);

// --- Provides ---
provide('updateArrayField', updateArrayField);
provide('updateShow', (fields: string[]) => (show.value = fields));
provide('updateSearchQueryConfig', (config: SearchQueryConfig) => searchQueryConfig.value = config);
provide('updateItemsSorting', (sort: SortOption) => selectedSort.value = sort);
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
