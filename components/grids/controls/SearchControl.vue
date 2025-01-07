<template>
    <div class="search-control">
        <InputText v-model="searchValue" @input="handleInput" type="text" placeholder="Search" />
        <i v-if="searchValue" class="pi pi-times" @click="clearSearch" />
        <i v-else class="pi pi-search" />
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
