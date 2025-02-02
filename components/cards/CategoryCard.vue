<template>
    <BaseCard :dataItem="dataItem" collection="categories">
        <template #card-content="{ data }">
            <div class="card-content">
                <h1 v-if="showStore.currentShow.includes('name')">{{ data.name }}</h1>
                <h1 v-if="showStore.currentShow.includes('type')">Type: {{ data.type }}</h1>
                <h1 v-if="showStore.currentShow.includes('categoryGroup') && data.categoryGroup">Group: {{ data.categoryGroup.title }}</h1>
            </div>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import type { Categories } from '@/types/collections/Categories';
import { useShowStore } from '~/stores/useShowStore';

defineProps<{ dataItem: Categories }>();
const showStore = useShowStore();
</script>

<style lang="scss" scoped>
.card-content {
    padding: 1rem;
}
</style>
