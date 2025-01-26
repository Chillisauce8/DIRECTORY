<template>
    <div class="media-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" />
        <card-text-wrapper :class="getCardTextWrapperClass" :selected="isSelected">
            <div class="card-details">
                <h1 v-if="showStore.currentShow.includes('name')" class="name">{{ name }}</h1>
                <h1 v-if="showStore.currentShow.includes('categories')" class="categories">{{ categories.map((category) => category.name).join(', ') }}</h1>
            </div>
        </card-text-wrapper>
        <CardEditWrapper collection="files" :data-item="dataItem" @save="onEditableGroupSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { imageIdProp, nameProp, loveableProp, categoriesProp, dataItemProp } from '@/types/props';
import type { Category } from '@/types/props';
import { useCard } from '~/composables/useCard';
import { useSelectedStore } from '~/stores/useSelectedStore';
import { useModeStore } from '~/stores/useModeStore';
import { useDisplayStore } from '~/stores/useDisplayStore';
import CardEditWrapper from './common/CardEditWrapper.vue';
import { useShowStore } from '~/stores/useShowStore';

const props = defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    dataItem: dataItemProp,
    loveable: loveableProp,
    categories: categoriesProp,
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' }
});

const selectionStore = useSelectedStore();
const isSelected = computed(() => selectionStore.isSelected(props.id));

const emit = defineEmits(['update:data-item', 'update:categories']);

const modeStore = useModeStore();
const displayStore = useDisplayStore();
const showStore = useShowStore();

// Add debug watcher for showStore
watch(
    () => showStore.currentShow,
    (newValue) => {
        console.log('MediaCard: showStore.currentShow changed:', newValue);
    },
    { immediate: true, deep: true }
);

// Add debug computed
const showDebug = computed(() => {
    console.log('MediaCard: Computing show values:', {
        name: showStore.currentShow.includes('name'),
        categories: showStore.currentShow.includes('categories'),
        currentShow: showStore.currentShow
    });
    return showStore.currentShow;
});

const { getCardTextWrapperClass, onEditableGroupSubmit, handleSelection } = useCard({
    ...props,
    show: showDebug.value // Use debug computed to track updates
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
