<template>
    <div v-if="showControls" class="gallery-controls">
        <Toast />
        <ConfirmDialog />
        <div class="filter-controls flex flex-col md:flex-row gap-4">
            <!-- Function Control -->
            <SelectButton v-if="showFunctionSelector" v-model="modelMode" :options="filteredFunctionControls" optionValue="value" optionLabel="label" dataKey="value" :allowEmpty="false" class="function-control">
                <template v-if="functionControlDisplay === 'icon'" #option="slotProps">
                    <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
                </template>
            </SelectButton>

            <!-- Category Control -->
            <MultiSelectFilter
                v-if="showCategoryControl"
                v-model="modelSelectedCategories"
                display="chip"
                :options="categoryOptions"
                optionLabel="name"
                filter
                placeholder="Filter by Category"
                :maxSelectedLabels="2"
                className="category-control w-full md:w-80"
            />

            <!-- Show Control -->
            <SelectButton v-if="showShowControl" v-model="modelShow" :options="['name', 'categories']" multiple class="show-control" />

            <!-- Sort Control -->
            <ListSort
                v-model="modelSort"
                :sortOptions="[
                    { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
                    { label: 'Name (Z-A)', sort: 'name', order: 'desc' },
                    { label: 'Newest First', sort: 'created', order: 'desc' },
                    { label: 'Oldest First', sort: 'created', order: 'asc' }
                ]"
                ref="gridSort"
            />

            <!-- Search Control -->
            <ListSearch v-if="showSearchControl" v-model:searchQuery="modelSearchQuery" :searchFields="searchFields" :minSearchLength="minSearchLength" ref="gridSearch" />

            <!-- Card Size Control -->
            <select-button v-if="showCardSizeSelector" v-model="modelSelectedSize" :options="filteredCardSizes" optionLabel="label" dataKey="label" aria-labelledby="card-size-selector" :allowEmpty="false" class="card-size-control">
                <template #option="slotProps">
                    <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
                </template>
            </select-button>

            <Button label="Add" icon="pi pi-plus" outlined raised />
        </div>
        <div v-if="mode === 'edit' || mode === 'select'" class="select-controls">
            <ToggleButton v-model="selectAll" class="select-all" onLabel="Deselect All" offLabel="Select All" onIcon="pi pi-check-circle" offIcon="pi pi-circle" aria-label="Do you confirm" />
            <!-- Conditionally display these components if there is at least one selected card -->
            <template v-if="hasSelectedCards">
                <Button v-if="mode === 'select'" label="Add Selected" class="add-selected" icon="pi pi-plus-circle" outlined raised @click="emit('add-selected')" />
                <template v-if="mode === 'edit'">
                    <Button label="Delete Selected" class="delete-selected" icon="pi pi-trash" outlined raised @click="confirmDelete" />

                    <multi-select v-if="editCategoryControl" v-model="editCategories" display="chip" :options="categoryOptions" optionLabel="name" filter placeholder="Edit Categories" :maxSelectedLabels="2" class="edit-categories w-full md:w-80">
                        <template #footer>
                            <div class="p-3 flex justify-between">
                                <Button label="Add To Selected" class="add-to-selected" severity="secondary" text size="small" icon="pi pi-plus" @click="confirmAddCategories" />
                                <Button label="Remove From Selected" class="remove-from-selected" severity="danger" text size="small" icon="pi pi-times" @click="confirmRemoveCategories" />
                            </div>
                        </template>
                    </multi-select>
                </template>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineEmits, defineModel, type PropType } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import MultiSelectFilter from '../controls/MultiSelectFilter.vue';
import GridSearch from '../controls/ListSearch.vue';
import GridSort from '../controls/ListSort.vue';

const confirm = useConfirm();
const toast = useToast();

// Update confirmDelete function to show toast after deletion
const confirmDelete = () => {
    confirm.require({
        header: 'Confirm Delete',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger'
        },
        accept: () => {
            emit('delete-selected');
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Selected items have been deleted',
                life: 3000
            });
        }
    });
};

// Add confirmRemoveCategories function
const confirmRemoveCategories = () => {
    confirm.require({
        header: 'Remove Categories',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Remove',
            severity: 'danger'
        },
        accept: () => {
            removeFromSelected();
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Categories have been removed from selected items',
                life: 3000
            });
        }
    });
};

// Add confirmAddCategories function
const confirmAddCategories = () => {
    confirm.require({
        header: 'Add Categories',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Add',
            severity: 'secondary'
        },
        accept: () => {
            addCategoriesToSelected();
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Categories have been added to selected items',
                life: 3000
            });
        }
    });
};

type FunctionMode = 'view' | 'select' | 'edit' | 'order';

// Update the function controls definition with correct icon names
const functionControls = ref([
    { label: 'View', icon: 'eye', value: 'view' as FunctionMode },
    { label: 'Select', icon: 'check-circle', value: 'select' as FunctionMode }, // Changed from 'checkbox'
    { label: 'Edit', icon: 'edit', value: 'edit' as FunctionMode }, // Changed from 'pencil'
    { label: 'Order', icon: 'move', value: 'order' as FunctionMode } // Changed from 'bars'
]);

// Add interfaces
interface Category {
    name: string;
    id: number;
}

interface Listing {
    id: string;
    categories: Category[];
    [key: string]: any; // For other potential listing properties
}

// Update props definition
const props = defineProps({
    showControls: { type: Boolean, default: true },
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
    categoryOptions: { type: Array as PropType<{ name: string; id: number }[]>, default: () => [] },
    visibleCardSizes: {
        type: Array as PropType<string[] | null>,
        default: () => ['Small Cards', 'Big Cards', 'List'] as string[]
    },
    defaultCardSize: {
        type: String,
        default: 'Big Cards'
    },
    selectedItems: { type: Array as PropType<string[]>, default: () => [] },
    searchFields: {
        type: Array as PropType<{ field: string; label: string }[]>,
        default: () => [{ field: 'name', label: 'Name' }]
    },
    minSearchLength: { type: Number, default: 1 },
    listings: {
        type: Array as PropType<Listing[]>,
        default: () => []
    }
});

// Add missing selectedCategoryIds computed property
const selectedCategoryIds = computed(() => modelSelectedCategories.value.map((category) => category.id));

// Update emit type definition with proper types
const emit = defineEmits<{
    'select-all': [boolean];
    'delete-selected': [];
    'add-selected': [];
    'add-categories-to-selected': [Category[]];
    'remove-categories-from-selected': [Category[]];
}>();

// Define models for two-way binding using defineModel
const modelMode = defineModel<FunctionMode>('mode', { default: 'view' });
const modelSelectedCategories = defineModel<{ name: string; id: number }[]>('selectedCategories', { default: () => [] });
const modelShow = defineModel<string[]>('show', { default: () => ['name'] });
const modelSearchQuery = defineModel<string | undefined>('searchQuery', { default: undefined });
const modelSelectedSize = defineModel<{ label: string; icon: string; display: string } | null>('selectedSize', { default: null });
const modelSort = defineModel<{ label: string; sort: string; order: 'asc' | 'desc' } | null>('sort', { default: null });

const cardSizes = ref([
    { label: 'Small Cards', icon: 'cardssmall', display: 'display-small-cards' },
    { label: 'Big Cards', icon: 'cardsbig', display: 'display-big-cards' },
    { label: 'List', icon: 'list', display: 'display-list' }
]);

const selectAll = ref(false);

watch(selectAll, (newValue) => {
    emit('select-all', newValue); // Emit select-all event with the new value
});
/*
const categoryFunction = ref();
const categoryFunctionOptions = ref([
    { label: 'Add To Selected Categories', function: 'addToSelectedCategories' },
    { label: 'Remove From Selected Categories', function: 'removeFromSelectedCategories' }
]);
*/
// Add computed properties for function controls
const showFunctionSelector = computed(() => Array.isArray(props.visibleFunctionControls) && props.visibleFunctionControls.length > 1);

const filteredFunctionControls = computed(() => {
    if (!Array.isArray(props.visibleFunctionControls) || props.visibleFunctionControls.length === 0) {
        const defaultFunction = functionControls.value.find((func) => func.value === props.defaultFunctionControl);
        return defaultFunction ? [defaultFunction] : [functionControls.value[0]];
    }
    return functionControls.value.filter((func) => props.visibleFunctionControls?.includes(func.value) ?? false);
});

// Update modelMode initialization
const defaultFunction = computed(() => {
    const availableFunctions = filteredFunctionControls.value;
    if (availableFunctions.length === 1) return availableFunctions[0].value;
    return availableFunctions.find((func) => func.value === props.defaultFunctionControl)?.value || availableFunctions[0].value;
});

// Initialize modelMode with computed default
watch(
    () => defaultFunction.value,
    (newValue) => {
        if (!modelMode.value && newValue) {
            modelMode.value = newValue as FunctionMode;
        }
    },
    { immediate: true }
);

// Update computed properties to handle null case and defaults
const showCardSizeSelector = computed(() => Array.isArray(props.visibleCardSizes) && props.visibleCardSizes.length > 1);

const filteredCardSizes = computed(() => {
    if (!Array.isArray(props.visibleCardSizes) || props.visibleCardSizes.length === 0) {
        const defaultSize = cardSizes.value.find((size) => size.label === props.defaultCardSize);
        return defaultSize ? [defaultSize] : [cardSizes.value[0]];
    }
    return cardSizes.value.filter((size) => props.visibleCardSizes?.includes(size.label) ?? false);
});

// Set initial selected size
const defaultSelectedSize = computed(() => {
    const availableSizes = filteredCardSizes.value;
    if (availableSizes.length === 1) return availableSizes[0];
    return availableSizes.find((size) => size.label === props.defaultCardSize) || availableSizes[0];
});

// Initialize modelSelectedSize with computed default
watch(
    () => defaultSelectedSize.value,
    (newValue) => {
        if (!modelSelectedSize.value) {
            modelSelectedSize.value = newValue;
        }
    },
    { immediate: true }
);

// Computed property to check if there are selected cards
const hasSelectedCards = computed(() => props.selectedItems.length > 0);

// Add ref for edit categories
const editCategories = ref<{ name: string; id: number }[]>([]);

// Add handlers for category management
function addCategoriesToSelected() {
    emit('add-categories-to-selected', editCategories.value);
}

// Update removeFromSelected function
function removeFromSelected() {
    emit('remove-categories-from-selected', editCategories.value);
}

// Add computed for edit control visibility
const editCategoryControl = computed(() => modelMode.value === 'edit' && hasSelectedCards.value);

// Add ref for GridSearch component
const gridSearch = ref();
const gridSort = ref();
</script>
