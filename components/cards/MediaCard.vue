<template>
    <div class="media-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <editable-group class="card-details" collection="files" :data="props.dataItem" :edit="modeStore.isEditMode && isSelected" @submit="onEditableGroupSubmit($event)">
                <editable field="name">
                    <h1>{{ props.name }}</h1>
                </editable>
                <editable field="categories">
                    <h1>{{ props.categories.map((category) => category.name).join(', ') }}</h1>
                </editable>
            </editable-group>
        </card-text-wrapper>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { imageIdProp, nameProp, loveableProp, showProp, categoriesProp, dataItemProp } from '@/types/props';
import type { Category } from '@/types/props';
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
    show: showProp,
    categories: categoriesProp,
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' },
    onNameUpdate: { type: Function as PropType<(name: string) => void>, required: true },
    onCategoriesUpdate: { type: Function as PropType<(categories: Category[]) => void>, required: true }
});

const selectionStore = useSelectionStore();
const isSelected = computed(() => selectionStore.isSelected(props.id));

const emit = defineEmits(['update:data-item', 'update:categories']);

const modeStore = useModeStore();
const displayStore = useDisplayStore();

const { getCardTextWrapperClass, onEditableGroupSubmit, handleSelection } = useCard({
    ...props,
    show: displayStore.currentShow
});
</script>

<style lang="scss">
.media-card {
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
