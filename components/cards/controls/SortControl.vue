<template>
    <div class="grid-sort">
        <Dropdown v-model="selectedSort" :options="sortOptions" optionLabel="label" placeholder="Sort by..." class="w-full md:w-[200px]" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
    }
});

const selectedSort = defineModel<SortOption | null>('modelValue', { default: null });

// Expose sort method for parent components
const sortItems = <T>(items: T[]): T[] => {
    if (!selectedSort.value) return items;

    const { sort, order } = selectedSort.value;
    return [...items].sort((a: any, b: any) => {
        const aVal = a[sort];
        const bVal = b[sort];

        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
    });
};

defineExpose({
    sortItems
});
</script>
