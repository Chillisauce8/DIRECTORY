<template>
    <BaseCard :id="id" collection="files" :image-id="imageId" :name="name" :loveable="loveable" :data-item="dataItem" :clickable="clickable" :search-terms="searchTerms" @update:data-item="$emit('update:data-item', $event)">
        <template #card-content="{ data }">
            <h1 v-if="showStore.currentShow.includes('name')" class="name">{{ data.name }}</h1>
            <h1 v-if="showStore.currentShow.includes('categories')" class="categories">
                {{ data.categories?.map((category) => category.name).join(', ') }}
            </h1>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import { imageIdProp, nameProp, loveableProp, categoriesProp, dataItemProp } from '@/types/props';
import { useShowStore } from '~/stores/useShowStore';

const showStore = useShowStore();

defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    dataItem: dataItemProp,
    loveable: loveableProp,
    categories: categoriesProp,
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' }
});

defineEmits(['update:data-item']);
</script>
