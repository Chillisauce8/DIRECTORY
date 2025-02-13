<template>
    <MultiSelect 
        v-model="selected" 
        :options="computedOptions" 
        optionLabel="label" 
        :placeholder="placeholder" 
        class="w-full" 
        display="chip" 
        :maxSelectedLabels="2"
        :auto-update="autoUpdate"
    />
</template>

<script setup lang="ts">
import { onMounted, computed, inject, ref, nextTick, onUnmounted } from 'vue';
import { createFilterStore } from '~/stores/useFilterStore';
import { get } from 'lodash-es';  // Add this import

// --- Internal Types ---
interface FilterOption {
    value: string | number; // The actual value extracted from the document
    label: string; // Display label (value + count)
    count: number; // How many documents contain this value
}

/**
 * FilterControl: Displays a MultiSelect dropdown for filtering data
 * 
 * autoUpdate modes:
 * - false (default): Computes options from direct props, maintains its own counts
 * - true: Uses store options that reflect current filtered dataset
 */

// --- Props ---
// Note: We now expect `options` to be an array of full documents,
// and we require a `filterField` that tells us which nested property to use.
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    options: {
        type: Array,
        default: () => []
    },
    filterField: {
        type: String,
        required: true
    },
    placeholder: {
        type: String,
        default: ''
    },
    autoUpdate: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

// Try to inject the grid-specific filter store provided by GridContainer
const injectedFilterStore = inject('filterStore');

// Use the injected store or fall back to a global store instance
const filterStore = injectedFilterStore || createFilterStore('global')();

// Move selectedFilters here since it handles the v-model binding
const selected = computed({
    get: () => filterStore.getSelectedFilters(props.filterField),
    set: (value) => {
        emit('update:modelValue', value);
        filterStore.setFilter(props.filterField, value);
    }
});

// Simplified computedOptions - cleaner logic flow
const computedOptions = computed(() => {
    if (!props.autoUpdate) {
        return computeOptionsFromData(props.options);
    }

    const storeOptions = filterStore.getFilterOptions(props.filterField);
    // Always return store options when in auto-update mode
    // This ensures we stay reactive to store updates
    return storeOptions?.length ? storeOptions : computeOptionsFromData(props.options);
});

// Extract the computation logic to a reusable function
function computeOptionsFromData(data: any[]) {
    const counts = new Map<string | number, number>();
    data.forEach((doc) => {
        const extracted = get(doc, props.filterField);
        if (Array.isArray(extracted)) {
            extracted.forEach((val) => {
                const actualValue = typeof val === 'object' ? val.name : val;
                counts.set(actualValue, (counts.get(actualValue) || 0) + 1);
            });
        } else if (extracted !== undefined && extracted !== null) {
            const actualValue = typeof extracted === 'object' ? extracted.name : extracted;
            counts.set(actualValue, (counts.get(actualValue) || 0) + 1);
        }
    });

    return Array.from(counts.entries())
        .map(([value, count]) => ({
            value,
            label: `${value} (${count})`,
            count
        }))
        .sort((a, b) => String(a.value).localeCompare(String(b.value)));
}

/**
 * Emit the updated selection when the MultiSelect changes.
 */
const handleChange = (event: { value: any[] }) => {
    console.debug('FilterControl selected values', event.value);
    emit('update:modelValue', event.value);
};

// onMounted simplified - only sets store when needed
onMounted(() => {
    // Always set initial options in store
    const initialOptions = computeOptionsFromData(props.options);
    filterStore.setFilterField(props.filterField, initialOptions);
    
    if (!props.modelValue) {
        emit('update:modelValue', []);
    }
});
</script>
