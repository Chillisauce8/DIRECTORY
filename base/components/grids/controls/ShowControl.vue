<template>
    <div class="show-control">
        <MultiSelect v-model="selectedOptions" :options="allOptions" display="chip" placeholder="Show Fields" />
    </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { createShowStore } from '~/stores/useShowStore';

const props = defineProps({
    showAllOptions: {
        type: Array as PropType<string[]>,
        required: true
    },
    gridId: {
        type: String,
        required: true
    }
    // Remove showSelectedOptions prop as it's handled by GridContainer
});

// Try to inject the grid-specific show store provided by GridContainer
const injectedShowStore = inject('showStore');

// Use the injected store or fall back to a grid-specific store instance
const showStore = injectedShowStore || createShowStore(props.gridId)();

// Remove onMounted initialization since it's handled by GridContainer

const selectedOptions = computed({
    get: () => showStore.currentShow,
    set: (value: string[]) => showStore.setShow(value)
});

const allOptions = computed(() => props.showAllOptions);
</script>
