<template>
    <BaseCard :data-item="dataItem" collection="events" :grid-id="gridId" image-id-path="" class="task-card">
        <template #card-content="{ data }">
            <h1 v-if="showStore.currentShow.includes('name')" class="name">{{ data.name }}</h1>
            <h1 v-if="showStore.currentShow.includes('categories') && data.categories" class="categories">
                {{ data.categories?.name }}
            </h1>
            <div v-if="showStore.currentShow.includes('start')" class="start">
                {{ formatDate(data.start) }}
            </div>
            <div v-if="showStore.currentShow.includes('description')" class="description">
                {{ data.description }}
            </div>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import type { Event } from '@/types/collections/Events';
import { createShowStore } from '~/stores/useShowStore';

const props = defineProps<{
    dataItem: Event;
    gridId: string;
}>();

const showStore = createShowStore(props.gridId)();

const formatDate = (date: string) => (date ? new Date(date).toLocaleDateString() : '');
</script>
