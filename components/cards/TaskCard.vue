<template>
    <BaseCard v-bind="cardProps" @update:data-item="$emit('update:data-item', $event)">
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
import { commonCardProps } from '@/types/props';
import { computed } from 'vue';
import { useDisplayStore } from '~/stores/useDisplayStore';

const displayStore = useDisplayStore();

const props = defineProps({
    ...commonCardProps,
    description: { type: String, default: '' },
    vehicles: { type: Array, default: () => [] },
    status: { type: String, default: '' },
    files: { type: Array, default: () => [] },
    start: { type: String },
    end: { type: String },
    duration: { type: String }
});

const cardProps = computed(() => ({
    ...props,
    collection: 'events'
}));

defineEmits(['update:data-item']);

const formatDate = (date: string) => {
    return date ? new Date(date).toLocaleDateString() : '';
};
</script>
