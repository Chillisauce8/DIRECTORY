<template>
    <!-- Dynamic root element with classes and click event -->
    <component
        :is="modeStore.currentMode === 'view' ? 'a' : 'article'"
        :href="modeStore.currentMode === 'view' ? fullSizeSrc : undefined"
        :data-fancybox="modeStore.currentMode === 'view' ? gallery : undefined"
        class="card-wrapper"
        :class="computedClasses"
        :id="id"
        :data-search="searchTerms"
        @click="toggleSelected($event)"
    >
        <slot />
        <div v-if="modeStore.currentMode" class="mode-icons">
            <SvgIcon :svg="modeIcon" :class="modeStore.currentMode" />
        </div>
    </component>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSelectionStore } from '~/stores/useSelectionStore';
import { useModeStore } from '~/stores/useModeStore';
import { useDisplayStore } from '~/stores/useDisplayStore';

/* Define component props */
const props = defineProps({
    id: { type: String, required: true },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    imageId: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' }
});

/* Remove emit since we're using the store */
const emit = defineEmits([]);

/* Use store for selection state */
const selectionStore = useSelectionStore();
const modeStore = useModeStore();
const displayStore = useDisplayStore();

/* Replace isSelected ref with computed */
const isSelected = computed(() => selectionStore.isSelected(props.id));

/* Toggle selected state on click */
const toggleSelected = ($event) => {
    if (props.clickable && !$event.defaultPrevented) {
        selectionStore.toggle(props.id);
    }
};

const modeIcon = computed(() => {
    const baseIcons: Record<string, string> = {
        select: 'check-circle',
        edit: 'edit',
        view: 'eye',
        order: 'move'
    };

    // If selected and in edit mode, always show check-circle
    if (isSelected.value && modeStore.isEditMode) {
        return 'check-circle';
    }

    // Otherwise use the base icon
    return modeStore.currentMode ? baseIcons[modeStore.currentMode] : '';
});

/* Computed classes */
const computedClasses = computed(() => ({
    selected: isSelected.value,
    [modeStore.currentMode]: true,
    ...Object.fromEntries(displayStore.currentShow.map((item) => [item, true]))
}));
</script>

<style lang="scss">
.card-wrapper {
    position: relative; // For smooth Vue transition-group https://www.youtube.com/watch?v=DGI_aKld0Jg
    background: var(--surface-card);
    border: var(--card-border);
    font-size: 12px;
    transition: all 1s ease;
    border-radius: var(--corner-outer);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    img {
        transition: all 0.7s ease;
    }
    &.order {
        cursor: move;
    }
    &.select,
    &.view,
    &.edit,
    &.order {
        .mode-icons {
            position: absolute;
            top: 0px;
            right: 0px;
            display: flex;
            //   width: 100%;
            //  height: 100%;
            justify-content: flex-end;
            padding: 5px;
            opacity: 0;
            transition: all 1s ease;
            .icon {
                border-radius: 50%;
                width: 24px;
                height: 24px;
            }
        }
        &:hover {
            img {
                filter: brightness(80%);
            }
            .mode-icons {
                opacity: 1;
                .icon {
                    svg {
                        stroke: var(--primary-color);
                    }
                }
            }
        }
    }
    &.select.selected,
    &.edit.selected {
        img {
            filter: brightness(40%);
        }
        .mode-icons {
            opacity: 1;
            .icon {
                background-color: var(--primary-color);
                svg {
                    stroke: white;
                }
            }
        }
    }
    &:has(.card-text-wrapper.hide) {
        .swp-picture img {
            border-radius: var(--corner-outer);
        }
    }
    & .swp-picture img {
        border-top-left-radius: var(--corner-outer);
        border-top-right-radius: var(--corner-outer);
    }
}
</style>
