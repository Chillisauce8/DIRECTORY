<template>
    <SelectButton
        v-if="showSelector"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :options="filteredSizes"
        optionLabel="label"
        dataKey="label"
        aria-labelledby="card-size-selector"
        :allowEmpty="false"
        class="card-size-control"
    >
        <template #option="slotProps">
            <SvgIcon :svg="slotProps.option.icon" :label="slotProps.option.label" labelPosition="hover" />
        </template>
    </SelectButton>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';

interface DisplaySize {
    label: string;
    icon: string;
    display: string;
}

const cardSizes: DisplaySize[] = [
    { label: 'Small Cards', icon: 'cardssmall', display: 'display-small-cards' },
    { label: 'Big Cards', icon: 'cardsbig', display: 'display-big-cards' },
    { label: 'List', icon: 'list', display: 'display-list' }
];

const props = defineProps({
    modelValue: {
        type: Object as PropType<DisplaySize | null>,
        required: true
    },
    visibleSizes: {
        type: Array as PropType<string[] | null>,
        default: () => ['Small Cards', 'Big Cards', 'List']
    },
    defaultSize: {
        type: String,
        default: 'Big Cards'
    }
});

const emit = defineEmits(['update:modelValue']);

const showSelector = computed(() => Array.isArray(props.visibleSizes) && props.visibleSizes.length > 1);

const filteredSizes = computed(() => {
    if (!Array.isArray(props.visibleSizes) || props.visibleSizes.length === 0) {
        const defaultSize = cardSizes.find((size) => size.label === props.defaultSize);
        return defaultSize ? [defaultSize] : [cardSizes[0]];
    }
    return cardSizes.filter((size) => props.visibleSizes?.includes(size.label));
});
</script>
