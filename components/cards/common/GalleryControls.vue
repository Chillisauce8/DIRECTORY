<template>
    <div v-if="showControls" class="gallery-controls">
        <div class="filter-controls flex flex-col md:flex-row gap-4">
            <!-- Function Control -->
            <SelectButton v-if="showFunctionControl" v-model="modelMode" :options="functionControlOptions" :allowEmpty="false" class="function-control" />

            <!-- Category Control -->
            <MultiSelect
                v-if="showCategoryControl"
                v-model="modelSelectedCategories"
                display="chip"
                :options="categoryOptions"
                optionLabel="name"
                filter
                placeholder="Select a Category"
                :maxSelectedLabels="2"
                class="category-control w-full md:w-80"
            />

            <!-- Show Control -->
            <SelectButton v-if="showShowControl" v-model="modelShow" :options="['name', 'albums']" multiple class="show-control" />

            <!-- Search Control -->
            <icon-field v-if="showSearchControl" class="search-control">
                <InputText type="text" class="search" placeholder="Search" v-model="modelSearchQuery" />
                <InputIcon class="pi pi-search" />
            </icon-field>

            <!-- Card Size Control -->
            <select-button v-if="showCardSizeControl" v-model="modelSelectedSize" :options="filteredCardSizes" optionLabel="label" dataKey="label" aria-labelledby="card-size-selector" :allowEmpty="false" class="card-size-control">
                <template #option="slotProps">
                    <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
                </template>
            </select-button>

            <Button label="Add" icon="pi pi-plus" outlined raised />
        </div>
        <div v-if="mode === 'select'" class="select-controls">
            <ToggleButton v-model="selectAll" class="select-all" onLabel="Deselect All" offLabel="Select All" onIcon="pi pi-check-circle" offIcon="pi pi-circle" aria-label="Do you confirm" />

            <!-- Conditionally display these components if there is at least one selected card -->
            <template v-if="hasSelectedCards">
                <Select v-model="categoryFunction" class="category-function" :options="categoryFunctionOptions" showClear optionLabel="label" placeholder="Choose Category Function" />
                <Button label="Delete Selected" class="delete-selected" icon="pi pi-trash" outlined raised @click="emit('delete-selected')" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineEmits, defineModel, type PropType } from 'vue';

const props = defineProps({
    showControls: { type: Boolean, default: true },
    showFunctionControl: { type: Boolean, default: true },
    showCategoryControl: { type: Boolean, default: true },
    showShowControl: { type: Boolean, default: true },
    showSearchControl: { type: Boolean, default: true },
    showCardSizeControl: { type: Boolean, default: true },
    functionControlOptions: { type: Array as PropType<string[]>, default: () => ['view', 'select', 'edit', 'order'] },
    categoryOptions: { type: Array as PropType<{ name: string; id: number }[]>, default: () => [] },
    cardSizeIcons: { type: Array as PropType<string[]>, default: () => ['cardssmall', 'cardsbig', 'list'] },
    selectedItems: { type: Array as PropType<string[]>, default: () => [] }
});

// Define emits with both "select-all" and "delete-selected"
const emit = defineEmits(['select-all', 'delete-selected']);

// Define models for two-way binding using defineModel
const modelMode = defineModel<'view' | 'select' | 'edit' | 'order'>('mode', { default: 'view' });
const modelSelectedCategories = defineModel<{ name: string; id: number }[]>('selectedCategories', { default: () => [] });
const modelShow = defineModel<string[]>('show', { default: () => ['name'] });
const modelSearchQuery = defineModel<string | null>('searchQuery', { default: '' });
const modelSelectedSize = defineModel<{ label: string; icon: string; display: string } | null>('selectedSize', { default: null });

const cardSizes = ref([
    { label: 'Small Cards', icon: 'cardssmall', display: 'display-small-cards' },
    { label: 'Big Cards', icon: 'cardsbig', display: 'display-big-cards' },
    { label: 'List', icon: 'list', display: 'display-list' }
]);

const selectAll = ref(false);

watch(selectAll, (newValue) => {
    emit('select-all', newValue); // Emit select-all event with the new value
});

const categoryFunction = ref();
const categoryFunctionOptions = ref([
    { label: 'Add To Selected Categories', function: 'addToSelectedCategories' },
    { label: 'Remove From Selected Categories', function: 'removeFromSelectedCategories' }
]);

const filteredCardSizes = computed(() => cardSizes.value.filter((size) => props.cardSizeIcons.includes(size.icon)));

// Computed property to check if there are selected cards
const hasSelectedCards = computed(() => props.selectedItems.length > 0);
</script>
