<template>
    <div class="category-card">
        <card-picture v-if="cardData?.imageId || cardData?.images?.[0]?.id" :id="cardData?.imageId || cardData?.images?.[0]?.id" :name="cardData?.name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <h1 v-if="cardData?.name">{{ cardData.name }}</h1>
            <h1 v-if="cardData?.type">Type: {{ cardData.type }}</h1>
            <h1 v-if="cardData?.categoryGroup?.name">{{ cardData.categoryGroup.name }}</h1>
        </card-text-wrapper>
        <CardEditWrapper v-if="cardData" collection="categories" :data-item="cardData" @save="onEditableGroupSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { imageIdProp, nameProp, loveableProp, categoriesProp, dataItemProp } from '@/types/props';
import type { Category } from '@/types/props';
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
    dataItem: { ...dataItemProp, required: true }, // Make dataItem required
    loveable: loveableProp,
    categories: categoriesProp,
    categoryGroup: { type: Object, default: () => ({}) },
    type: { type: String, default: '' },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' }
});

const selectionStore = useSelectedStore();
const isSelected = computed(() => selectionStore.isSelected(props.id));

const modeStore = useModeStore();
const displayStore = useDisplayStore();

const emit = defineEmits(['update:data-item', 'update:categories']);

// Add default value to cardData
const cardStore = useCardStore();
const cardData = computed(() => {
    const storeData = cardStore.getCard('categories', props.id);
    return storeData || props.dataItem || {}; // Provide empty object as fallback
});

// Pass initialized data to useCard
const { getCardTextWrapperClass, onEditableGroupSubmit, handleSelection } = useCard({
    ...props,
    dataItem: cardData.value // Explicitly pass computed cardData
});

// Add debug watcher
watch(
    cardData,
    (newVal) => {
        console.log('CardData updated:', newVal);
    },
    { immediate: true, deep: true }
);
</script>

<style lang="scss">
.category-card {
}
</style>
