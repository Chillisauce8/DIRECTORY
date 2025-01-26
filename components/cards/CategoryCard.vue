<template>
    <div class="category-card">
        <card-picture v-if="cardData.imageId" :id="cardData.imageId" :name="cardData.name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <h1>{{ cardData.name }}</h1>
            <h1>Type: {{ cardData.type }}</h1>
            <h1>{{ cardData.categoryGroup?.name }}</h1>
        </card-text-wrapper>
        <CardEditWrapper collection="categories" :data-item="cardData" @save="onEditableGroupSubmit" />
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
    dataItem: dataItemProp,
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

const { getCardTextWrapperClass, onEditableGroupSubmit, handleSelection } = useCard({
    ...props,
    show: displayStore.currentShow
});

const cardStore = useCardStore();

// Create a computed property for the card data
const cardData = computed(() => {
    const storeData = cardStore.getCard('categories', props.id);
    return storeData || props.dataItem;
});
</script>

<style lang="scss">
.category-card {
    picture {
        @include aspect-ratio(3, 2);
    }
    &.edit.selected {
        .card-details {
            display: none;
        }
    }
    .card-details {
        &:not(.categories) .categories,
        &:not(.name) .name {
            display: none;
        }
        .name {
            font-family: var(--primary-font-family);
            font-size: 15px;
            font-weight: 100;
            margin: 5px 0;
        }
        .categories {
            font-family: var(--primary-font-family);
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
        }
    }
}
</style>
