<template>
    <SelectButton v-if="showSelector" :modelValue="currentSize" @update:modelValue="updateSize" :options="filteredSizes" optionLabel="label" :allowEmpty="false" class="display-control">
        <template #option="slotProps">
            <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
        </template>
    </SelectButton>
</template>

<script setup lang="ts">
import { computed, type PropType, watch, onMounted } from 'vue';
import { useDisplayStore, type CardSize, CARD_SIZES } from '~/stores/useDisplayStore';

const props = defineProps({
    visibleSizes: {
        type: Array as PropType<string[] | null>,
        default: () => ['Small Cards', 'Big Cards', 'List']
    },
    defaultSize: {
        type: String,
        default: 'Big Cards'
    }
});

const displayStore = useDisplayStore();

const showSelector = computed(() => Array.isArray(props.visibleSizes) && props.visibleSizes.length > 1);

const filteredSizes = computed(() => CARD_SIZES.filter((size) => props.visibleSizes?.includes(size.label)));

// Add computed for current size to ensure reactivity
const currentSize = computed(() => displayStore.currentSize);

// Initialize on component mount
onMounted(() => {
    const defaultSize = CARD_SIZES.find((size) => size.label === props.defaultSize);
    if (defaultSize) {
        displayStore.setSize(defaultSize);
    }
});

// Update the updateSize function to ensure proper reactivity
function updateSize(newSize: CardSize) {
    displayStore.setSize(newSize);
}
</script>
