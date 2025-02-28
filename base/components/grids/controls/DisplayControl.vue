<template>
    <SelectButton v-if="showSelector" :modelValue="currentSize" @update:modelValue="updateSize" :options="filteredSizes" optionLabel="label" :allowEmpty="false" class="display-control">
        <template #option="slotProps">
            <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
        </template>
    </SelectButton>
</template>

<script setup lang="ts">
import { computed, type PropType, inject, onMounted } from 'vue';
import { createDisplayStore, type CardSize, CARD_SIZES } from '~/stores/useDisplayStore';

const props = defineProps({
    visibleSizes: {
        type: Array as PropType<string[] | null>,
        default: () => ['Small Cards', 'Big Cards', 'List']
    },
    defaultSize: {
        type: String,
        default: 'Big Cards'
    },
    gridId: {
        type: String,
        required: true
    }
});

// Try to inject the grid-specific display store provided by GridContainer
const injectedDisplayStore = inject('displayStore');

// Use the injected store or fall back to a grid-specific store instance
const displayStore = injectedDisplayStore || createDisplayStore(props.gridId)();

const showSelector = computed(() => Array.isArray(props.visibleSizes) && props.visibleSizes.length > 1);

const filteredSizes = computed(() => {
    if (!Array.isArray(props.visibleSizes) || props.visibleSizes.length === 0) {
        const defaultSize = CARD_SIZES.find((size) => size.label === props.defaultSize);
        return defaultSize ? [defaultSize] : [CARD_SIZES[1]];
    }
    return CARD_SIZES.filter((size) => props.visibleSizes?.includes(size.label));
});

const currentSize = computed(() => displayStore.currentSize);

function updateSize(newSize: CardSize) {
    displayStore.setSize(newSize);
}

onMounted(() => {
    // Initialize with default size
    if (props.defaultSize) {
        displayStore.initialize(props.defaultSize);
    }
});
</script>
