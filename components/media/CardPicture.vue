<template>
    <div class="card-picture">
        <SwpPicture v-bind="$props">
            <template #default>
                <div class="overlay">
                    <slot />
                    <div v-if="mode" class="mode-icons">
                        <SvgIcon :svg="modeIcon" :class="mode" />
                    </div>
                    <SvgIcon v-if="loveable" svg="heart" class="heart" :class="{ loved: isLoved }" @click="toggleLoved" />
                </div>
            </template>
        </SwpPicture>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
    loveable?: boolean;
    loved?: boolean;
    mode?: 'view' | 'select' | 'edit' | 'order';
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

// Computed property for selecting the icon based on mode and selected
const modeIcon = computed(() => {
    const baseIcons: Record<string, string> = {
        select: 'check-circle',
        edit: 'edit',
        view: 'eye',
        order: 'move'
    };

    // If selected and in edit mode, always show check-circle
    if (props.selected && props.mode === 'edit') {
        return 'check-circle';
    }

    // Otherwise use the base icon
    return props.mode ? baseIcons[props.mode] : '';
});
</script>

<style lang="scss">
// ...existing styles or overrides...
</style>
