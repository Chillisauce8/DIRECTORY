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
        <PictureImage v-if="hasValidImage" :_id="imageId" :src="props.src" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy">
            <template #default>
                <slot name="image" />
                <SvgIcon v-if="props.loveable" svg="heart" class="heart" :class="{ loved: isLoved }" @click.stop="toggleLoved" />
            </template>
        </PictureImage>

        <div v-if="modeStore.currentMode" class="mode-icons">
            <SvgIcon :svg="modeIcon" :class="modeStore.currentMode" />
        </div>

        <div class="card-content">
            <header class="card-read" v-if="!showEditWrapper">
                <slot name="card-content" :data="cardData" />
            </header>

            <div v-if="showEditWrapper" class="card-edit">
                <CrudControl :collection="collection" function="update" :dialogEdit="false" :itemId="editItemId" :initialItem="cardData" noButton preventDefault @save="handleEditSave" />
            </div>
        </div>
    </component>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useCardStore } from '~/stores/useCardStore';
import { createSelectedStore } from '~/stores/useSelectedStore';
import { createModeStore } from '~/stores/useModeStore';
import type { DbNode } from '~/types';

// Props with better typing
interface CardProps {
    dataItem: DbNode;
    collection: string;
    clickable?: boolean;
    loveable?: boolean;
    gallery?: string;
    imageIdPath?: string;
    gridId: string;
    loved?: boolean;
    src?: string;  // Add this prop
}

const props = withDefaults(defineProps<CardProps>(), {
    clickable: true,
    loveable: false,
    gallery: 'gallery',
    loved: false
});

// Add this after props definition
const emit = defineEmits<{
    'update:data-item': [DbNode];
    'update:loved': [boolean];
}>();

// Initialize stores (moved after props definition)
const cardStore = useCardStore();
const selectionStore = createSelectedStore(props.gridId)();
const modeStore = createModeStore(props.gridId)();

// Core computed values
const cardData = computed(() => cardStore.getCard(props.collection, props.dataItem._id) || props.dataItem);
const isSelected = computed(() => selectionStore.isSelected(props.dataItem._id));
const showEditWrapper = computed(() => modeStore.isEditMode && isSelected.value);
const editItemId = computed(() => cardData.value?._id);

// Image handling
const imageId = computed(() => (props.imageIdPath ? props.imageIdPath.split('.').reduce((obj, key) => obj?.[key], props.dataItem) : undefined));
const hasValidImage = computed(() => props.src || (typeof imageId.value === 'string' && imageId.value.length > 0));
const fullSizeSrc = computed(() => props.src || (hasValidImage.value ? `https://media.chillisauce.com/image/upload/${imageId.value}` : undefined));

// UI state
const isLoved = ref(props.loved);
const isDragging = ref(false);

// Classes and icons
const modeIcon = computed(() => {
    if (isSelected.value && modeStore.isEditMode) return 'check-circle';
    const icons = { select: 'check-circle', edit: 'edit', view: 'eye', order: 'move' };
    return modeStore.currentMode ? icons[modeStore.currentMode] : '';
});

const cardClasses = computed(() => ({
    selected: (modeStore.currentMode === 'select' || modeStore.currentMode === 'edit') && isSelected.value,
    [modeStore.currentMode]: true,
    'is-dragging': isDragging.value
}));

// Event handlers
const handleClick = (event: MouseEvent) => {
    if (props.clickable && !event.defaultPrevented) {
        selectionStore.toggle(props.dataItem._id);
    }
};

const handleEditSave = async (event: DbNode) => {
    try {
        // First update the card
        await cardStore.updateCard(props.collection, props.dataItem._id, event);
        emit('update:data-item', event);

        // Then deselect and log for debugging
        console.log('Before deselect - Selected:', isSelected.value);
        await selectionStore.deselect(props.dataItem._id);
        console.log('After deselect - Selected:', isSelected.value);

        // Force a recompute of card classes
        nextTick(() => {
            console.log('Next tick - Selected:', isSelected.value);
        });
    } catch (error) {
        console.error('Save failed:', error);
    }
};

const toggleLoved = () => {
    isLoved.value = !isLoved.value;
    emit('update:loved', isLoved.value);
};

// Watch props
watch(
    () => props.loved,
    (val) => (isLoved.value = val)
);
</script>

<style lang="scss">
// Remove the explicit import since it's being injected by the Vite config
// @use '~/assets/css/mixins' as *;  

.base-card {
    position: relative;
    background: var(--surface-card);
    border: var(--card-border);
    border-radius: var(--corner-outer);
    box-shadow: var(--box-shadow);
    transition: all 1s ease;

    .picture-image {
        img {
            transition: all 0.7s ease;
            border-top-left-radius: var(--corner-outer);
            border-top-right-radius: var(--corner-outer);
        }

        picture {
            @include aspect-ratio(3, 2);
        }
    }

    &:has(.card-read:empty) {
        .picture-image img {
            border-radius: var(--corner-outer);
        }
    }

    .card-content {
        &:has(> .card-edit),
        &:has(> .card-read:not(:empty)) {
            padding: 5%;
        }
        .card-read {
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: stretch;
            overflow: hidden;
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
            svg {
                stroke: white;
            }

            .icon {
                border-radius: 50%;
                width: 24px;
                height: 24px;
            }
        }

        &:hover {
            img {
                filter: brightness(60%);
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
                }
            }
        }

        img {
            filter: brightness(30%);
        }
    }
    &.view,
    &.select,
    &.edit {
        cursor: pointer;
    }
    &.order {
        cursor: move;
    }
}
</style>
