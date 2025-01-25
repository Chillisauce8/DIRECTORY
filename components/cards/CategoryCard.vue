<template>
    <div class="category-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <!--         <editable-group class="card-details" collection="categories" :data="props.dataItem" :edit="props.mode === 'edit' && selected" @submit="onEditableGroupSubmit($event)">
                <editable field="name">
                    <h1>{{ props.name }}</h1>
                </editable>
                <editable field="type">
                    <h1>Type: {{ props.type }}</h1>
                </editable>
                <editable field="categoryGroup">
                    <h1>{{ props.categoryGroup.name }}</h1>
                </editable>
                    </editable-group>
                -->
            <h1>{{ props.name }}</h1>
            <h1>Type: {{ props.type }}</h1>
            <h1>{{ props.categoryGroup.name }}</h1>
        </card-text-wrapper>
        <CardEditWrapper collection="categories" :data-item="props.dataItem" @save="onEditableGroupSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { imageIdProp, nameProp, loveableProp, categoriesProp, dataItemProp } from '@/types/props';
import type { Category } from '@/types/props';
import CardEditWrapper from './common/CardEditWrapper.vue';
import { useCard } from '~/composables/useCard';
import { useSelectionStore } from '~/stores/useSelectionStore';
import { useModeStore } from '~/stores/useModeStore';
import { useDisplayStore } from '~/stores/useDisplayStore';

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

const selectionStore = useSelectionStore();
const isSelected = computed(() => selectionStore.isSelected(props.id));

const modeStore = useModeStore();
const displayStore = useDisplayStore();

const emit = defineEmits(['update:data-item', 'update:categories']);

const { getCardTextWrapperClass, onEditableGroupSubmit, handleSelection } = useCard({
    ...props,
    show: displayStore.currentShow
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
