<template>
    <component
        :is="modeStore.currentMode === 'view' ? 'a' : 'div'"
        :href="modeStore.currentMode === 'view' ? fullSizeSrc : undefined"
        :data-fancybox="modeStore.currentMode === 'view' ? gallery : undefined"
        class="base-card"
        :class="cardClasses"
        :id="id"
        :data-search="searchTerms"
        @click="handleClick"
    >
        <card-picture v-if="imageId || cardData?.images?.[0]?.id" :id="imageId || cardData?.images?.[0]?.id" :name="cardData?.name" :loveable="loveable" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <slot name="card-content" :data="cardData" />
        </card-text-wrapper>
        <CardEditWrapper v-if="cardData" :collection="collection" :data-item="cardData" @save="handleEditSave" />
        <div v-if="modeStore.currentMode" class="mode-icons">
            <SvgIcon :svg="modeIcon" :class="modeStore.currentMode" />
        </div>
    </component>
</template>

<script setup lang="ts">
// Import required dependencies
import { computed, ref } from 'vue';
import { imageIdProp, nameProp, loveableProp, dataItemProp } from '@/types/props';
import { useCardStore } from '~/stores/useCardStore';
import { useSelectedStore } from '~/stores/useSelectedStore';
import { useModeStore } from '~/stores/useModeStore';
import { useShowStore } from '~/stores/useShowStore';

// Define component props with their types and defaults
const props = defineProps({
    id: { type: String, required: true }, // Unique identifier for the card
    collection: { type: String, required: true }, // Collection name the card belongs to
    imageId: imageIdProp, // ID of the card's image
    name: nameProp, // Name of the card
    loveable: loveableProp, // Whether the card can be marked as favorite
    dataItem: dataItemProp, // Data object for the card
    clickable: { type: Boolean, default: true }, // Whether the card is clickable
    searchTerms: { type: String, default: '' }, // Terms for searching
    gallery: { type: String, default: 'gallery' } // Gallery identifier
});

// Define emitted events
const emit = defineEmits(['update:data-item']);

// Initialize store instances
const cardStore = useCardStore();
const selectionStore = useSelectedStore();
const modeStore = useModeStore();
const showStore = useShowStore();

// Computed properties
// Get card data from store or props
const cardData = computed(() => {
    const storeData = cardStore.getCard(props.collection, props.id);
    return storeData || props.dataItem;
});

// Check if card is selected
const isSelected = computed(() => selectionStore.isSelected(props.id));

// Generate full size image source URL
const fullSizeSrc = computed(() => (props.imageId ? `/api/images/${props.imageId}` : undefined));

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
    [`${props.collection}-card`]: true,
    'is-dragging': isDragging.value
}));

// Moved from useCard
const getCardTextWrapperClass = computed(() => {
    return (modeStore.currentMode === 'edit' && isSelected.value) || showStore.currentShow.length > 0 ? 'show' : 'hide';
});

// Event handlers
// Handle save events from card editor
const handleEditSave = (event: any) => {
    cardStore.updateCard(props.collection, props.id, event);
    emit('update:data-item', event);
};

// Handle click events on the card
const handleClick = (event: MouseEvent) => {
    if (props.clickable && !event.defaultPrevented) {
        selectionStore.toggle(props.id);
    }
};

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

    &:has(.card-text-wrapper.hide) {
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

    &.selected {
        img {
            filter: brightness(40%);
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
            }
        }

        &:hover {
            img {
                filter: brightness(80%);
            }
            .mode-icons {
                opacity: 1;
                .icon svg {
                    stroke: var(--primary-color);
                }
            }
        }
    }

    &.order {
        cursor: move;
    }
}
</style>
