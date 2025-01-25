<template>
    <SelectButton v-if="showSelector" :modelValue="displayStore.currentSize" @update:modelValue="updateSize" :options="filteredSizes" optionValue="display" optionLabel="label" dataKey="display" :allowEmpty="false" class="display-control">
        <template #option="slotProps">
            <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
        </template>
    </SelectButton>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useDisplayStore, type CardSize, CARD_SIZES } from '~/stores/useDisplayStore';

const props = defineProps({
    visibleSizes: {
        type: Array as PropType<string[] | null>,
        default: () => ['Small Cards', 'Big Cards', 'List']
    }
});

const displayStore = useDisplayStore();

const showSelector = computed(() => Array.isArray(props.visibleSizes) && props.visibleSizes.length > 1);

const filteredSizes = computed(() => CARD_SIZES.filter((size) => props.visibleSizes?.includes(size.label)));

function updateSize(newSize: CardSize) {
    displayStore.setSize(newSize);
}
</script>
