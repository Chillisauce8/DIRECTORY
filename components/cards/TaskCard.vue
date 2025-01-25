<template>
    <div class="task-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <div class="card-details">
                <h1 v-if="displayStore.currentShow.includes('name')" class="name">{{ name }}</h1>
                <h1 v-if="displayStore.currentShow.includes('categories')" class="categories">{{ categoryNames }}</h1>
                <div v-if="displayStore.currentShow.includes('start')" class="start">{{ formattedStartDate }}</div>
                <div v-if="displayStore.currentShow.includes('description') && description" class="description">{{ description }}</div>
                <div v-if="displayStore.currentShow.includes('vehicles')" class="vehicles">{{ vehicleNames }}</div>
            </div>
        </card-text-wrapper>
        <CardEditWrapper collection="events" :data-item="props.dataItem" @save="onEditableGroupSubmit" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { imageIdProp, nameProp, showProp, categoriesProp, dataItemProp } from '@/types/props';
import type { Category, Vehicle } from '@/types/props';
import CardEditWrapper from './common/CardEditWrapper.vue';
import { useCard } from '~/composables/useCard';
import { useSelectionStore } from '~/stores/useSelectionStore';
import { useModeStore } from '~/stores/useModeStore';
import { useDisplayStore } from '~/stores/useDisplayStore';

const props = defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    dataItem: dataItemProp,
    description: { type: String, default: '' },
    vehicles: { type: Array as PropType<Vehicle[]>, default: () => [] },
    files: { type: Array as PropType<{ id: string; alt: string; type: string }[]>, default: () => [] },
    start: { type: String },
    end: { type: String },
    duration: {
        type: Object as PropType<{ value: number; unit: string }>,
        default: () => ({ value: 0, unit: 'mins' })
    }
});

const selectionStore = useSelectionStore();
const isSelected = computed(() => selectionStore.isSelected(props.id));

const emit = defineEmits(['update:data-item']);

const modeStore = useModeStore();
const displayStore = useDisplayStore();

// Computed properties
const formattedStartDate = computed(() => {
    if (!props.start) return '';
    return new Date(props.start).toLocaleDateString();
});

const vehicleNames = computed(() => {
    return props.vehicles.map((v) => v.name).join(', ');
});

const categoryNames = computed(() => {
    return props.categories.map((category) => category.name).join(', ');
});

const { getCardTextWrapperClass, onEditableGroupSubmit } = useCard({
    ...props,
    show: displayStore.currentShow
});
</script>

<style lang="scss">
.task-card {
    picture {
        @include aspect-ratio(3, 2);
    }
    &.edit.selected {
        .card-details {
            display: none;
        }
    }
    .card-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;

        .name {
            font-family: var(--primary-font-family);
            font-size: 15px;
            font-weight: 100;
            margin: 5px 0;
        }
        .categories {
            font-family: var(--primary-font-family);
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
        }
        .description {
            font-size: 0.875rem;
            line-height: 1.25rem;
        }
        .start {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
        }
        .vehicles {
            font-size: 0.75rem;
            font-style: italic;
        }
    }
    .form {
        width: 100%;
        display: flex;
        flex-direction: column;
        > *:not(:last-child) {
            margin-bottom: 10px;
        }
        .p-inputtext {
            font-size: 12px;
        }
    }
}
</style>
