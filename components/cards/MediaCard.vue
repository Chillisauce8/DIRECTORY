<template>
    <BaseCard :dataItem="dataItem" collection="files" :grid-id="gridId" class="media-card" :image-id-path="imageIdPath">
        <template #card-content="{ data }">
            <h1 v-if="showStore.currentShow.includes('name')" class="name">{{ data.name }}</h1>
            <h1 v-if="showStore.currentShow.includes('categories')" class="categories">
                {{ data.categories?.map((category) => category.name).join(', ') }}
            </h1>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import type { Files } from '@/types/collections/Files';
import { createShowStore } from '~/stores/useShowStore';

const imageIdPath = '_id';

const props = defineProps<{
    dataItem: Files;
    gridId: string;
}>();
const showStore = createShowStore(props.gridId)();
</script>
