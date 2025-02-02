<template>
    <div class="search-control">
        <InputText v-model="searchValue" type="text" placeholder="Search" />
        <i v-if="searchValue" class="pi pi-times" @click="clearSearch" />
        <i v-else class="pi pi-search" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import InputText from 'primevue/inputtext';
import { useSearchStore } from '~/stores/useSearchStore';

// Use type from store
type SearchField = NonNullable<ReturnType<typeof useSearchStore>['searchFields']>[number];

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

const searchStore = useSearchStore();

// Simplified computed that updates both v-model and store
const searchValue = computed({
    get: () => props.modelValue,
    set: (value: string) => {
        emit('update:modelValue', value);
        searchStore.setSearch(value, props.searchFields);
    }
});

function clearSearch() {
    searchValue.value = '';
    searchStore.clear();
}

// Remove handleInput function as it's no longer needed since the store handles everything
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
