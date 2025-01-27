<template>
    <BaseCard :id="id" collection="categories" :image-id="imageId" :name="name" :loveable="loveable" :data-item="dataItem" :clickable="clickable" :search-terms="searchTerms" @update:data-item="$emit('update:data-item', $event)">
        <template #card-content="{ data }">
            <h1 v-if="data?.name">{{ data.name }}</h1>
            <h1 v-if="data?.type">Type: {{ data.type }}</h1>
            <h1 v-if="data?.categoryGroup?.name">{{ data.categoryGroup.name }}</h1>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import { imageIdProp, nameProp, loveableProp, dataItemProp } from '@/types/props';

defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    dataItem: { ...dataItemProp, required: true },
    loveable: loveableProp,
    categoryGroup: { type: Object, default: () => ({}) },
    type: { type: String, default: '' },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' }
});

defineEmits(['update:data-item']);
</script>
