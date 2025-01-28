<template>
    <BaseCard v-bind="cardProps" @update:data-item="$emit('update:data-item', $event)">
        <template #card-content="{ data }">
            <h1 v-if="data?.name">{{ data.name }}</h1>
            <h1 v-if="data?.type">Type: {{ data.type }}</h1>
            <h1 v-if="data?.categoryGroup?.name">{{ data.categoryGroup.name }}</h1>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import { commonCardProps } from '@/types/props';
import { computed } from 'vue';

const props = defineProps({
    ...commonCardProps,
    categoryGroup: { type: Object, default: () => ({}) },
    type: { type: String, default: '' }
});

const cardProps = computed(() => ({
    ...props,
    collection: 'categories'
}));

defineEmits(['update:data-item']);
</script>
