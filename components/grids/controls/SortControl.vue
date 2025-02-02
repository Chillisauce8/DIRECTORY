<template>
    <div class="sort-control">
        <Dropdown v-model="selectedSort" :options="props.sortOptions" optionLabel="label" placeholder="Sort by..." />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSortStore, type SortOption } from '~/stores/useSortStore';

const props = defineProps({
    sortOptions: { type: Array as () => SortOption[], default: () => [] }
});

const sortStore = useSortStore();

// Use computed getter/setter to work with the store
const selectedSort = computed({
    get: () => sortStore.currentSort || props.sortOptions[0] || null,
    set: (value: SortOption | null) => {
        if (value) sortStore.setSort(value);
    }
});
</script>
