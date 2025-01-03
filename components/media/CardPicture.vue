<template>
    <div class="card-picture">
        <SwpPicture v-bind="$props">
            <template #default>
                <div class="overlay">
                    <slot />
                    <SvgIcon v-if="loveable" svg="heart" class="heart" :class="{ loved: isLoved }" @click="toggleLoved" />
                </div>
            </template>
        </SwpPicture>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    loveable?: boolean;
    loved?: boolean;
    selected?: boolean;
    id?: string;
    alt?: string;
    src?: string;
    images?: Array<{ id: string; alt?: string }>;
    loading?: 'eager' | 'lazy';
    widths: string;
    sizes?: string;
    increment?: number;
    aspectRatio?: string;
    sources?: Array<{
        media: string;
        sizes?: string;
        widths: string;
        modifiers?: string[];
        aspectRatio?: string;
        increment?: number;
    }>;
}>();

const emit = defineEmits(['update:src', 'update:loved']);

// Track "loved" state locally and sync with prop
const isLoved = ref(props.loved ?? false);
watch(
    () => props.loved,
    (newVal) => (isLoved.value = newVal ?? false)
);

const toggleLoved = () => {
    isLoved.value = !isLoved.value;
    emit('update:loved', isLoved.value);
};
</script>

<style lang="scss">
// ...existing styles or overrides...
</style>
