<template>
    <div class="category-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" :mode="mode" :selected="selected" />
        <card-text-wrapper :class="getCardTextWrapperClass" :mode="props.mode" :selected="selected">
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
        <CardEditWrapper :mode="props.mode" :selected="selected" collection="categories"
                         :dataItem="props.dataItem" @save="onEditableGroupSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { imageIdProp, nameProp, modeProp, loveableProp, showProp, categoriesProp, dataItemProp } from '@/types/props';
import type { Category } from '@/types/props';
import CardEditWrapper from './common/CardEditWrapper.vue';

const props = defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    dataItem: dataItemProp,
    mode: modeProp,
    loveable: loveableProp,
    show: showProp,
    categories: categoriesProp,
    categoryGroup: { type: Object, default: () => ({}) },
    type: { type: String, default: '' },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' },
    selected: { type: Boolean, required: true },
    onNameUpdate: { type: Function as PropType<(name: string) => void>, required: true },
    onCategoriesUpdate: { type: Function as PropType<(categories: Category[]) => void>, required: true }
});

const emit = defineEmits(['update:selected', 'update:data-item', 'update:categories']);

// Remove localSelected and direct binding to ensure reactivity
function handleSelection(value: boolean) {
    emit('update:selected', value);
}

// Dynamic class logic for card text wrapper
const getCardTextWrapperClass = computed(() => {
    return (props.mode === 'edit' && props.selected) || props.show.length > 0 ? 'show' : 'hide';
});

function onEditableGroupSubmit($event) {
    emit('update:data-item', $event);
}
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
