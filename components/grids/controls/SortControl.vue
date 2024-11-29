<template>
    <div class="sort-control">
        <Dropdown v-model="selectedSort" @update:modelValue="processSelectedSortUpdate" :options="sortOptions" optionLabel="label" placeholder="Sort by..." />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PropType } from 'vue';
import type { SortOption, UpdateItemsSortingFn } from '~/composables/useListControls';

const props = defineProps({
    sortOptions: {
        type: Array as PropType<SortOption[]>,
        default: () => []
    }
});

const selectedSort = ref<SortOption>(props?.sortOptions?.[0] ?? null);

const updateItemSorting = inject<UpdateItemsSortingFn>('updateItemsSorting', () => {});

if (selectedSort?.value) {
    processSelectedSortUpdate(selectedSort.value);
}

function processSelectedSortUpdate(sort: SortOption) {
    updateItemSorting(sort);
}
</script>
