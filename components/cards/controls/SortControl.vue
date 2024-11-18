<template>
    <div class="grid-sort">
        <Dropdown v-model="selectedSort" :options="sortOptions" optionLabel="label" placeholder="Sort by..." />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect, inject } from 'vue';
import type { PropType } from 'vue';

interface SortOption {
    label: string;
    sort: string;
    order: 'asc' | 'desc';
}

const props = defineProps({
    sortOptions: {
        type: Array as PropType<SortOption[]>,
        default: () => []
    },
    items: {
        type: Array as PropType<Record<string, any>[]>,
        default: () => []
    }
});

// Single state source
const selectedSort = ref(null);

// Type the injected function
type UpdateSortFn = (items: any[]) => void;
const updateSort = inject<UpdateSortFn>('updateSort', () => {});

// Emit results, not state
const emit = defineEmits<{
    'sorted-items': [Record<string, any>[]];
}>();

watch(selectedSort, (newSort) => {
    if (props.items?.length && newSort) {
        const sortedItems = sortItems(props.items);
        updateSort(sortedItems);
    }
});

const sortItems = <T>(items: T[]): T[] => {
    if (!selectedSort.value) return items;

    const { sort, order } = selectedSort.value;
    return [...items].sort((a: any, b: any) => {
        const aVal = a[sort];
        const bVal = b[sort];
        return order === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
};

defineExpose({
    sortItems
});
</script>
