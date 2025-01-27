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
import { computed, ref } from 'vue';
import { imageIdProp, nameProp, loveableProp, dataItemProp } from '@/types/props';
import { useCard } from '~/composables/useCard';
import { useCardStore } from '~/stores/useCardStore';
import { useSelectedStore } from '~/stores/useSelectedStore';
import { useModeStore } from '~/stores/useModeStore';

const props = defineProps({
    id: { type: String, required: true },
    collection: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    loveable: loveableProp,
    dataItem: dataItemProp,
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' }
});

const emit = defineEmits(['update:data-item']);

// Store instances
const cardStore = useCardStore();
const selectionStore = useSelectedStore();
const modeStore = useModeStore();

// Computed properties
const cardData = computed(() => {
    const storeData = cardStore.getCard(props.collection, props.id);
    return storeData || props.dataItem;
});

const isSelected = computed(() => selectionStore.isSelected(props.id));

const fullSizeSrc = computed(() => (props.imageId ? `/api/images/${props.imageId}` : undefined));

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

const cardClasses = computed(() => ({
    selected: isSelected.value,
    [modeStore.currentMode]: true,
    [`${props.collection}-card`]: true,
    'is-dragging': isDragging.value
}));

// Use common card functionality
const { getCardTextWrapperClass, onEditableGroupSubmit } = useCard(props);

// Event handlers
const handleEditSave = (event: any) => {
    cardStore.updateCard(props.collection, props.id, event);
    onEditableGroupSubmit(event);
    emit('update:data-item', event);
};

const handleClick = (event: MouseEvent) => {
    if (props.clickable && !event.defaultPrevented) {
        selectionStore.toggle(props.id);
    }
};

// For drag support
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
            border-top-left-radius: var(--corner-outer);
            border-top-right-radius: var(--corner-outer);
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
