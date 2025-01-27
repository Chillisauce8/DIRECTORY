<template>
    <div class="task-card">
        <card-picture v-if="cardData.imageId" :id="cardData.imageId" :name="cardData.name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <h1 v-if="displayStore.currentShow.includes('name')" class="name">{{ cardData.name }}</h1>
            <h1 v-if="displayStore.currentShow.includes('categories')" class="categories">{{ categoryNames }}</h1>
            <div v-if="displayStore.currentShow.includes('start')" class="start">{{ formattedStartDate }}</div>
            <div v-if="displayStore.currentShow.includes('description') && cardData.description" class="description">{{ cardData.description }}</div>
            <div v-if="displayStore.currentShow.includes('vehicles')" class="vehicles">{{ vehicleNames }}</div>
        </card-text-wrapper>
        <CardEditWrapper collection="events" :data-item="cardData" @save="onEditableGroupSubmit" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { imageIdProp, nameProp, showProp, categoriesProp, dataItemProp } from '@/types/props';
import type { Category, Vehicle } from '@/types/props';
import CardEditWrapper from './common/CardEditWrapper.vue';
import { useCard } from '~/composables/useCard';
import { useSelectedStore } from '~/stores/useSelectedStore';
import { useModeStore } from '~/stores/useModeStore';
import { useDisplayStore } from '~/stores/useDisplayStore';
import { useCardStore } from '~/stores/useCardStore';

const props = defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    dataItem: dataItemProp,
    description: { type: String, default: '' },
    vehicles: { type: Array as PropType<Vehicle[]>, default: () => [] },
    files: { type: Array as PropType<{ id: string; alt: string; type: string }[]>, default: () => [] },
    start: { type: String },
    end: { type: String },
    duration: {
        type: Object as PropType<{ value: number; unit: string }>,
        default: () => ({ value: 0, unit: 'mins' })
    }
});

const selectionStore = useSelectedStore();
const isSelected = computed(() => selectionStore.isSelected(props.id));

const emit = defineEmits(['update:data-item']);

const modeStore = useModeStore();
const displayStore = useDisplayStore();
const cardStore = useCardStore();

// Create a computed property for the card data
const cardData = computed(() => {
    const storeData = cardStore.getCard('events', props.id);
    return storeData || props.dataItem;
});

// Computed properties
const formattedStartDate = computed(() => {
    if (!props.start) return '';
    return new Date(props.start).toLocaleDateString();
});

// Update computed properties to use cardData
const vehicleNames = computed(() => {
    return cardData.value.vehicles?.map((v) => v.name).join(', ') || '';
});

const categoryNames = computed(() => {
    return cardData.value.categories?.map((category) => category.name).join(', ') || '';
});

const { getCardTextWrapperClass, onEditableGroupSubmit } = useCard({
    ...props
});
</script>

<style lang="scss">
.task-card {
}
</style>
