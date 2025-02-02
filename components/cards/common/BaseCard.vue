<template>
    <component
        :is="modeStore.currentMode === 'view' ? 'a' : 'div'"
        :href="modeStore.currentMode === 'view' ? fullSizeSrc : undefined"
        :data-fancybox="modeStore.currentMode === 'view' ? gallery : undefined"
        class="base-card"
        :class="cardClasses"
        :id="props.dataItem._id"
        :data-search="searchTerms"
        @click="handleClick"
    >
        <!--
        <card-picture
            v-if="hasValidImage"
            :_id="cardProperties.value.imageId || cardData?.images?.[0]?._id"
            :name="cardProperties.value.name"
            :loveable="cardProperties.value.loveable"
            widths="290:870"
            :increment="290"
            aspectRatio="3:2"
            loading="lazy"
        />
-->
        <!-- Show CardTextWrapper only when not in edit mode or card not selected -->
        <card-text-wrapper v-if="!showEditWrapper" :class="getCardTextWrapperClass">
            <slot name="card-content" :data="cardData" />
        </card-text-wrapper>

        <!-- Show CardEditWrapper only when in edit mode and card is selected -->
        <CardEditWrapper v-if="showEditWrapper" :collection="collection" :data-item="cardData" @save="handleEditSave" />

        <div v-if="modeStore.currentMode" class="mode-icons">
            <SvgIcon :svg="modeIcon" :class="modeStore.currentMode" />
        </div>
    </component>
</template>

<script setup lang="ts">
// Import required dependencies
import { computed, ref, watch } from 'vue';
import { imageIdProp, nameProp, loveableProp, dataItemProp } from '@/types/props';
import { useCardStore } from '~/stores/useCardStore';
import { useSelectedStore } from '~/stores/useSelectedStore';
import { useModeStore } from '~/stores/useModeStore';
import { useShowStore } from '~/stores/useShowStore';

// Define component props with their types and defaults
const props = defineProps({
    dataItem: { type: Object, required: true },
    collection: { type: String, required: true },
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' }
});

// Compute all card properties from dataItem directly
const cardProperties = computed(() => ({
    _id: props.dataItem._id,
    imageId: props.dataItem.imageId,
    name: props.dataItem.name,
    loveable: props.dataItem.loveable
}));

// Add debug logging
console.log('BaseCard props on mount:', {
    _id: cardProperties.value._id,
    clickable: props.clickable,
    propsRaw: props
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
    const storeData = cardStore.getCard(props.collection, cardProperties.value._id);
    return storeData || props.dataItem;
});

// Check if card is selected
const isSelected = computed(() => selectionStore.isSelected(cardProperties.value._id));

// Generate full size image source URL
const fullSizeSrc = computed(() => (cardProperties.value.imageId ? `/api/images/${cardProperties.value.imageId}` : undefined));

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

// Add new computed property to control wrapper visibility
const showEditWrapper = computed(() => modeStore.isEditMode && isSelected.value);

// Add computed property for image check
const hasValidImage = computed(() => {
    return Boolean(imageId || cardData.value?.images?.[0]?._id);
});

// Event handlers
// Handle save events from card editor
const handleEditSave = (event: any) => {
    console.log('BaseCard - handleEditSave', { id: cardProperties.value._id });
    cardStore.updateCard(props.collection, cardProperties.value._id, event);
    emit('update:data-item', event);
    selectionStore.deselect(cardProperties.value._id); // This should be sufficient to update selection state
};

// Handle click events on the card
const handleClick = (event: MouseEvent) => {
    console.log('BaseCard - Click handler:', {
        id: cardProperties.value._id,
        clickable: props.clickable,
        defaultPrevented: event.defaultPrevented
    });

    if (props.clickable && !event.defaultPrevented) {
        console.log('BaseCard - Before selection toggle:', {
            id: cardProperties.value._id,
            currentlySelected: selectionStore.isSelected(cardProperties.value._id)
        });
        selectionStore.toggle(cardProperties.value._id);
    }
};

// Add a watcher for selection state changes
watch(
    () => selectionStore.isSelected(cardProperties.value._id),
    (newValue) => {
        console.log('BaseCard - Selection state changed:', {
            id: cardProperties.value._id,
            isSelected: newValue
        });
    }
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
        .icon {
            background-color: red;
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
