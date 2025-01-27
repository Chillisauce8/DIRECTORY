<template>
    <BaseCard :id="id" collection="events" :image-id="imageId" :name="name" :data-item="dataItem" :clickable="clickable" :search-terms="searchTerms" @update:data-item="$emit('update:data-item', $event)">
        <template #card-content="{ data }">
            <h1 v-if="displayStore.currentShow.includes('name')" class="name">{{ data.name }}</h1>
            <h1 v-if="displayStore.currentShow.includes('categories')" class="categories">
                {{ data.categories?.map((category) => category.name).join(', ') }}
            </h1>
            <div v-if="displayStore.currentShow.includes('start')" class="start">
                {{ formatDate(data.start) }}
            </div>
            <div v-if="displayStore.currentShow.includes('description') && data.description" class="description">
                {{ data.description }}
            </div>
            <div v-if="displayStore.currentShow.includes('vehicles')" class="vehicles">
                {{ data.vehicles?.map((v) => v.name).join(', ') }}
            </div>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import { imageIdProp, nameProp, dataItemProp } from '@/types/props';
import type { Vehicle } from '@/types/props';
import { useDisplayStore } from '~/stores/useDisplayStore';

const displayStore = useDisplayStore();

defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    dataItem: dataItemProp,
    description: { type: String, default: '' },
    vehicles: { type: Array as PropType<Vehicle[]>, default: () => [] },
    start: { type: String },
    end: { type: String },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' }
});

defineEmits(['update:data-item']);

const formatDate = (date: string) => {
    return date ? new Date(date).toLocaleDateString() : '';
};
</script>
