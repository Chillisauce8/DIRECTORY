<template>
    <BaseCard :dataItem="dataItem" collection="categories">
        <template #card-content="{ data }">
            <h1>{{ data.name }}</h1>
            <h1>Type: {{ data.type }}</h1>
            <h1>Group: {{ data.categoryGroup?.title || 'No Group' }}</h1>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import type { Categories } from '~/types/collections/categories';

defineProps<{ dataItem: Categories }>();
</script>

<style lang="scss"></style>
