<template>
    <BaseCard v-bind="cardProps" @update:data-item="$emit('update:data-item', $event)">
        <template #card-content="{ data }">
            <h1 v-if="showStore.currentShow.includes('name')" class="name">{{ data.name }}</h1>
            <h1 v-if="showStore.currentShow.includes('categories')" class="categories">
                {{ data.categories?.map((category) => category.name).join(', ') }}
            </h1>
        </template>
    </BaseCard>
</template>

<script setup lang="ts">
import { commonCardProps } from '@/types/props';
import { useShowStore } from '~/stores/useShowStore';
import { computed } from 'vue';

const props = defineProps(commonCardProps);

const showStore = useShowStore();

const cardProps = computed(() => ({
    ...props,
    collection: 'files'
}));

defineEmits(['update:data-item']);
</script>
