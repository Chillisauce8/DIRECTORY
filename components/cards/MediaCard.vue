<template>
    <BaseCard :dataItem="dataItem" collection="files">
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
import { useShowStore } from '~/stores/useShowStore';

defineProps<{ dataItem: Files }>();
const showStore = useShowStore();
</script>
