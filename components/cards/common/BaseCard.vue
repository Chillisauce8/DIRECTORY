<template>
    <component
        :is="modeStore.currentMode === 'view' ? 'a' : 'div'"
        :href="modeStore.currentMode === 'view' ? fullSizeSrc : undefined"
        :data-fancybox="modeStore.currentMode === 'view' ? gallery : undefined"
        class="base-card"
        :class="cardClasses"
        :id="props.dataItem._id"
        @click="handleClick"
    >
        <card-picture v-if="hasValidImage" :_id="imageId" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" />

        <header class="card-details" v-if="!showEditWrapper">
            <slot name="card-content" :data="cardData" />
        </header>
        <CardEditWrapper v-if="showEditWrapper" :collection="collection" :data-item="cardData" :grid-id="gridId" @save="handleEditSave" />

        <div v-if="modeStore.currentMode" class="mode-icons">
            <SvgIcon :svg="modeIcon" :class="modeStore.currentMode" />
        </div>
    </component>
</template>

<script setup lang="ts">
// Import required dependencies
import { computed, ref, watch } from 'vue';
import { useCardStore } from '~/stores/useCardStore';
import { createSelectedStore } from '~/stores/useSelectedStore';
import { createModeStore } from '~/stores/useModeStore';

// Define component props with their types and defaults
const props = defineProps({
    dataItem: { type: Object, required: true },
    collection: { type: String, required: true },
    clickable: { type: Boolean, default: true },
    loveable: { type: Boolean, default: false },
    gallery: { type: String, default: 'gallery' },
    imageIdPath: { type: String, required: false }, // path to find image ID in dataItem
    gridId: { type: String, required: true }
});

// Function to get nested value from object using dot notation
const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Compute all card properties from dataItem directly
const cardProperties = computed(() => ({
    _id: props.dataItem._id,
    name: props.dataItem.name
}));

// Define emitted events
const emit = defineEmits(['update:data-item']);

// Initialize store instances
const cardStore = useCardStore();
const selectionStore = createSelectedStore(props.gridId)();
const modeStore = createModeStore(props.gridId)();

// Computed properties
// Get card data from store or props
const cardData = computed(() => {
    const storeData = cardStore.getCard(props.collection, cardProperties.value._id);
    return storeData || props.dataItem;
});

// Check if card is selected
const isSelected = computed(() => selectionStore.isSelected(cardProperties.value._id));

// Add computed properties for image handling
const imageId = computed(() => (props.imageIdPath ? getNestedValue(props.dataItem, props.imageIdPath) : undefined));
const hasValidImage = computed(() => typeof imageId.value === 'string' && imageId.value.length > 0);
const fullSizeSrc = computed(() => (hasValidImage.value ? `/api/images/${imageId.value}` : undefined));

// Determine which mode icon to display
const modeIcon = computed(() => {
    const baseIcons = {
        select: 'check-circle',
        edit: 'edit',
        view: 'eye',
        order: 'move'
    };

    if (isSelected.value && modeStore.isEditMode) {
        return 'check-circle';
    }

    return modeStore.currentMode ? baseIcons[modeStore.currentMode] : '';
});

// Generate CSS classes for the card
const cardClasses = computed(() => ({
    selected: isSelected.value,
    [modeStore.currentMode]: true,
    'is-dragging': isDragging.value
}));

// Add new computed property to control wrapper visibility
const showEditWrapper = computed(() => modeStore.isEditMode && isSelected.value);

// Event handlers
const handleEditSave = (event: any) => {
    cardStore.updateCard(props.collection, cardProperties.value._id, event);
    emit('update:data-item', event);
    selectionStore.deselect(cardProperties.value._id);
};

const handleClick = (event: MouseEvent) => {
    if (props.clickable && !event.defaultPrevented) {
        selectionStore.toggle(cardProperties.value._id);
    }
};

// Remove console.log watcher and keep simple selection state watcher
watch(
    () => selectionStore.isSelected(cardProperties.value._id),
    () => {}
);

// State for drag support
const isDragging = ref(false);
</script>

<style lang="scss">
.base-card {
    position: relative;
    background: var(--surface-card);
    border: var(--card-border);
    border-radius: var(--corner-outer);
    box-shadow: var(--box-shadow);
    transition: all 1s ease;
    .card-details {
        position: relative;
        padding: 5%;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: stretch;
        overflow: hidden;
    }

    &:has(.card-details.hide) {
        .swp-picture img {
            border-radius: var(--corner-outer);
        }
    }
    .swp-picture {
        img {
            transition: all 0.7s ease;
            border-top-left-radius: var (--corner-outer);
            border-top-right-radius: var (--corner-outer);
        }

        picture {
            @include aspect-ratio(3, 2);
        }
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
            justify-content: flex-end;
            padding: 5px;
            opacity: 0;
            transition: all 1s ease;

            .icon {
                border-radius: 50%;
                width: 24px;
                height: 24px;
                svg {
                    stroke: var(--primary-color);
                }
            }
        }
        &:hover {
            img {
                filter: brightness(80%);
            }
            .mode-icons {
                opacity: 1;
            }
        }
    }
    &.selected {
        &.select,
        &.edit {
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
        img {
            filter: brightness(40%);
        }
    }

    &.order {
        cursor: move;
    }
}
</style>
