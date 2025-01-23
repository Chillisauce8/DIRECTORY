<template>
    <div class="task-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :mode="mode" :selected="selected" />
        <card-text-wrapper :class="getCardTextWrapperClass" :mode="props.mode" :selected="selected">
            <div class="card-details">
                <h1 v-if="show.includes('name')" class="name">{{ name }}</h1>
                <h1 v-if="show.includes('categories')" class="categories">{{ categoryNames }}</h1>
                <div v-if="show.includes('start')" class="start">{{ formattedStartDate }}</div>
                <div v-if="show.includes('description') && description" class="description">{{ description }}</div>
                <div v-if="show.includes('vehicles')" class="vehicles">{{ vehicleNames }}</div>
            </div>
        </card-text-wrapper>
        <CardEditWrapper :mode="props.mode" :selected="selected" collection="events" :dataItem="props.dataItem" @save="onEditableGroupSubmit" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { imageIdProp, nameProp, modeProp, showProp, categoriesProp, dataItemProp } from '@/types/props';
import type { Category, Vehicle } from '@/types/props';
import CardEditWrapper from './common/CardEditWrapper.vue';

const props = defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    dataItem: dataItemProp,
    mode: modeProp,
    show: showProp,
    categories: categoriesProp,
    description: { type: String, default: '' },
    vehicles: { type: Array as PropType<Vehicle[]>, default: () => [] },
    files: { type: Array as PropType<{ id: string; alt: string; type: string }[]>, default: () => [] },
    start: { type: String },
    end: { type: String },
    duration: {
        type: Object as PropType<{ value: number; unit: string }>,
        default: () => ({ value: 0, unit: 'mins' })
    },
    selected: { type: Boolean, required: true }
});

const emit = defineEmits(['update:selected', 'update:data-item']);

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

const getCardTextWrapperClass = computed(() => {
    return (props.mode === 'edit' && props.selected) || props.show.length > 0 ? 'show' : 'hide';
});

function onEditableGroupSubmit($event) {
    emit('update:data-item', $event);
}
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
