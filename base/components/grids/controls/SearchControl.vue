<template>
    <div class="search-control">
        <InputText v-model="searchValue" type="text" placeholder="Search" />
        <i v-if="searchStore.searchQuery" class="pi pi-times" @click="clearSearch" />
        <i v-else class="pi pi-search" />
    </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted } from 'vue';
import type { PropType } from 'vue';
import InputText from 'primevue/inputtext';
import { createSearchStore } from '~/stores/useSearchStore';

// Use type from store
type SearchField = Parameters<ReturnType<typeof createSearchStore>['setSearch']>[1][number];

const props = defineProps({
    searchFields: {
        type: Array as PropType<SearchField[]>,
        default: () => [{ field: 'name', label: 'Name' }]
    },
    modelValue: {
        type: String,
        default: ''
    }
});

const emit = defineEmits<{
    'update:modelValue': (value: string) => void;
}>();

// Try to inject the grid-specific search store provided by GridContainer
const injectedSearchStore = inject('searchStore');

// Use the injected store or fall back to a global store instance
const searchStore = injectedSearchStore || createSearchStore('global')();

// Update computed to use store directly
const searchValue = computed({
    get: () => searchStore.searchQuery,
    set: (value: string) => {
        emit('update:modelValue', value);
        searchStore.setSearch(value, props.searchFields);
    }
});

function clearSearch() {
    searchValue.value = '';
    searchStore.clear();
}

onMounted(() => {
    // Initialize input value from store state if it exists
    if (searchStore.searchQuery) {
        emit('update:modelValue', searchStore.searchQuery);
    }
});
</script>

<style lang="scss">
.search-control {
    // width: 100%;
    //  display: inline-flex;
    position: relative;

    .p-inputtext {
        //  width: 100%;
        // padding-left: 2.5rem;
        font-size: 1em;
        padding-right: 2rem;
    }

    i {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-color-secondary);
        right: 0.75rem;
    }
}
</style>
