<template>
    <MultiSelect v-model="selected" :options="computedOptions" optionLabel="label" :placeholder="placeholder" class="w-full" display="chip" :maxSelectedLabels="2" />
</template>

<script setup lang="ts">
import { onMounted, computed, watch, inject } from 'vue';
import { getNestedValue } from '~/composables/useFilters';
import { createFilterStore } from '~/stores/useFilterStore';

// --- Internal Types ---
interface FilterOption {
    value: string | number; // The actual value extracted from the document
    label: string; // Display label (value + count)
    count: number; // How many documents contain this value
}

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

/**
 * computedOptions: Process the full list of documents (props.options) to extract
 * the values for the given filterField (which can be a nested path) and count their occurrences.
 */
const computedOptions = computed<FilterOption[]>(() => {
    const counts = new Map<string | number, number>();

    props.options.forEach((doc) => {
        let values: (string | number)[] = [];
        const extracted = getNestedValue(doc, props.filterField);
        if (Array.isArray(extracted)) {
            extracted.forEach((val) => {
                // If the value is an object with a name property, use that
                const actualValue = typeof val === 'object' ? val.name : val;
                values.push(actualValue);
            });
        } else if (extracted !== undefined && extracted !== null) {
            const actualValue = typeof extracted === 'object' ? extracted.name : extracted;
            values = [actualValue];
        }
        values.forEach((val) => {
            counts.set(val, (counts.get(val) || 0) + 1);
        });
    });

    // Now separate the actual value from its display label
    return Array.from(counts.entries())
        .map(([value, count]) => ({
            value: value, // The actual value to be used for filtering
            label: `${value} (${count})`, // Only used for display
            count
        }))
        .sort((a, b) => String(a.value).localeCompare(String(b.value)));
});

/**
 * Emit the updated selection when the MultiSelect changes.
 */
const handleChange = (event: { value: any[] }) => {
    console.debug('FilterControl selected values', event.value);
    emit('update:modelValue', event.value);
};

/**
 * onMounted hook: Ensure modelValue is defined as an array.
 */
onMounted(() => {
    filterStore.setFilterField(props.filterField, computedOptions.value);
    if (!props.modelValue) {
        emit('update:modelValue', []);
    }
});

/**
 * Watch for changes in the documents. If the available options change,
 * validate the current selection to ensure it only contains valid values.
 */
watch(
    () => props.options,
    (newOptions) => {
        if (props.modelValue?.length) {
            // Build a set of valid values from the updated options
            const validValues = new Set<string | number>();
            newOptions.forEach((doc) => {
                const extracted = getNestedValue(doc, props.filterField);
                if (Array.isArray(extracted)) {
                    extracted.forEach((val) => validValues.add(val));
                } else if (extracted !== undefined && extracted !== null) {
                    validValues.add(extracted);
                }
            });
            // Filter out any selected values that are no longer valid.

            const validSelection = props.modelValue.filter((item: any) => validValues.has(item));
            if (validSelection.length !== props.modelValue.length) {
                emit('update:modelValue', validSelection);
            }
        }
    },
    { deep: true }
);
</script>
