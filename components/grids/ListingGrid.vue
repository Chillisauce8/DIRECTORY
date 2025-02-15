<template>
    <grid-container 
        :grid-id="gridId" 
        :filters="filters" 
        :listings="props.listings" 
        :listing-collection="collectionName" 
        :sort-options="sortOptions" 
        :show-selected-options="showSelectedOptions"
    >
        <template #controls>
            <ModeControl :display="modeControlDisplay" :visible-controls="visibleModeControls" :default-control="defaultModeControl" :grid-id="gridId" />
            <FilterControl 
                :options="props.listings" 
                :filter-field="filterField" 
                :filter-id="'yearFilter'"
                :placeholder="filterPlaceholder" 
                v-model="selectedFilters" 
                :auto-update="true" 
            />
            <FilterControl 
                :options="props.listings" 
                :filter-field="filterField2" 
                :filter-id="'steeringFilter'"
                :placeholder="filterPlaceholder2" 
                v-model="selectedFilters2" 
            />
    <!--        <ShowControl :show-all-options="showAllOptions" :grid-id="gridId" /> -->
            <SortControl :sort-options="sortOptions" />
            <SearchControl :search-fields="searchFields" />
            <DisplayControl :visible-sizes="visibleCardSizes" :default-size="defaultCardSize" :grid-id="gridId" />
        </template>

        <template #edit-controls>
            <EditArrayControl :options="categoryOptions" :edit-field="editField" />
        </template>

        <template #card="{ listing }">
            <ListingCard 
                v-if="listing"
                :data-item="listing" 
                :grid-id="gridId" 
            />
        </template>
    </grid-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PartialListingNode } from '~/service/cars/listings.service';
import { useListingsService } from '~/service/cars/listings.service';

const props = defineProps<{
    listings?: PartialListingNode[];
}>();

// Initialize grid service with listings
const listingsService = useListingsService();

// Grid Configuration
const gridId = 'listingGrid';
const collectionName = 'listings';

// Mode Control Configuration
const modeControlDisplay = 'icon';
const visibleModeControls = ['view', 'select', 'edit', 'order'] as const;
const defaultModeControl = 'select';

// Display Control Configuration
const defaultCardSize = 'Big Cards';
const visibleCardSizes = ['Small Cards', 'Big Cards', 'List'] as const;

// Filter Control Configuration
const filterPlaceholder = 'Filter by Year';
const filterField = 'spec.year';

// Filter Control Configuration
const filterPlaceholder2 = 'Filter by Stearing';
const filterField2 = 'spec.stearingSide';


// Add definition for selectedFilters, used with v-model on <FilterControl>
const selectedFilters = ref([]);
const selectedFilters2 = ref([]);

// Simplify filters computation
const filters = computed(() => [
    {
        field: filterField,
        selected: [] // GridContainer will handle the selected state
    }
]);

// Show Control Configuration
//const showAllOptions = ['content.name', 'spec.year', 'sale.price', 'spec.engine'];
//const showSelectedOptions = ['content.name', 'sale.price'];

// Sort Control Configuration
const sortOptions = [
    { label: 'Name (A-Z)', sort: 'content.name', order: 'asc' },
    { label: 'Name (Z-A)', sort: 'content.name', order: 'desc' },
    { label: 'Price (Low-High)', sort: 'sale.price', order: 'asc' },
    { label: 'Price (High-Low)', sort: 'sale.price', order: 'desc' },
    { label: 'Year (Newest)', sort: 'spec.year', order: 'desc' },
    { label: 'Year (Oldest)', sort: 'spec.year', order: 'asc' }
] as const;

// Search Control Configuration
const searchFields = [
    { field: 'content.name', label: 'Name' },
] as const;

// Edit Control Configuration // Currently not working
const editField = 'categories';
</script>

<style>
</style>
