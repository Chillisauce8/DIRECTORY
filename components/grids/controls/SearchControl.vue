<template>
    <div class="search-control">
        <span class="p-input-icon-left p-input-icon-right">
            <InputText v-model="searchValue" @input="handleInput" type="text" placeholder="Search" />
            <i v-if="searchValue" class="pi pi-times" @click="clearSearch" />
            <i v-else class="pi pi-search" />
        </span>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PropType } from 'vue';
import InputText from 'primevue/inputtext';
import type { SearchField, UpdateSearchQueryConfigFn } from '~/composables/useListControls';

const props = defineProps({
    searchFields: {
        type: Array as PropType<SearchField[]>,
        default: () => [{ field: 'name', label: 'Name' }]
    },
    minSearchLength: {
        type: Number,
        default: 1
    }
});

const searchValue = ref('');

const updateSearchQueryConfig = inject<UpdateSearchQueryConfigFn>('updateSearchQueryConfig', () => {});

// Modify handleInput to be more robust
function handleInput() {
    if (!props.searchFields?.length) {
        return;
    }

    if (props?.minSearchLength && searchValue.value.length < props?.minSearchLength) {
        return;
    }

    updateSearchQueryConfig({
        searchFields: props.searchFields,
        searchQuery: searchValue.value
    });
}

function clearSearch() {
    searchValue.value = '';

    updateSearchQueryConfig({
        searchFields: props.searchFields,
        searchQuery: ''
    });
}
</script>

<style lang="scss" scoped>
.search-control {
    width: 100%;
    display: inline-flex;
    position: relative;

    .p-inputtext {
        width: 100%;
        padding-left: 2.5rem;
        padding-right: 2.5rem;
    }

    i {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-color-secondary);
        right: 0.75rem;
    }

    @media (min-width: 768px) {
        width: 150px;
    }
}
</style>
