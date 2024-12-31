<template>
    <div class="task-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :mode="mode" :selected="selected" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <div class="card-details">
                <h1 v-if="show.includes('name')" class="name">{{ name }}</h1>
                <h1 v-if="show.includes('categories')" class="categories">{{ categoryNames }}</h1>
                <div v-if="show.includes('start')" class="start">{{ formattedStartDate }}</div>
                <div v-if="show.includes('description') && description" class="description">{{ description }}</div>
                <div v-if="show.includes('vehicles')" class="vehicles">{{ vehicleNames }}</div>
            </div>
            <form class="form" v-if="mode === 'edit' && selected" @submit.prevent="handleSubmit" @click.stop>
                <InputText type="text" v-model="editableName" />
                <MultiSelect v-model="selectedCategoryIds" display="chip" :options="categoryList" optionLabel="name" optionValue="id" filter placeholder="Select a Category" :maxSelectedLabels="1" />
                <Button type="submit" severity="secondary" label="Submit" />
                <CreateTaskDialogWithDb :selectedTaskId="id" />
            </form>
        </card-text-wrapper>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { imageIdProp, nameProp, modeProp, showProp, categoriesProp } from '@/types/props';
import type { Category, Vehicle } from '@/types/props';
import CreateTaskDialogWithDb from '~/pages/apps/tasklist/CreateTaskDialogWithDb.vue';

interface Status {
    state: string;
    user: {
        id: string;
        name: string;
    };
    dateTime: string;
}

// Update props to match Events structure
const props = defineProps({
    id: { type: String, required: true },

    imageId: imageIdProp,
    name: nameProp,
    mode: modeProp,
    show: showProp,
    categories: categoriesProp,
    description: { type: String, default: '' },
    vehicles: { type: Array as PropType<Vehicle[]>, default: () => [] },
    status: { type: Array as PropType<Status[]>, default: () => [] },
    files: { type: Array as PropType<{ id: string; alt: string; type: string }[]>, default: () => [] },
    start: { type: String },
    end: { type: String },
    duration: {
        type: Object as PropType<{ value: number; unit: string }>,
        default: () => ({ value: 0, unit: 'mins' })
    },
    selected: { type: Boolean, required: true },
    onNameUpdate: { type: Function as PropType<(name: string) => void>, required: true },
    onCategoriesUpdate: { type: Function as PropType<(categories: Category[]) => void>, required: true }
});

console.log('TaskCard props:', {
    name: props.name,
    categories: props.categories,
    description: props.description,
    vehicles: props.vehicles,
    show: props.show,
    files: props.files,
    start: props.start
});

const emit = defineEmits(['update:selected', 'update:name', 'update:categories', 'update:description', 'update:vehicles', 'update:status']);

// Add new computed properties
const formattedStartDate = computed(() => {
    if (!props.start) return '';
    return new Date(props.start).toLocaleDateString();
});

const vehicleNames = computed(() => {
    return props.vehicles.map((v) => v.name).join(', ');
});

// Remove localSelected and direct binding to ensure reactivity
function handleSelection(value: boolean) {
    emit('update:selected', value);
}

const menu = ref(null);
const clickedTask = ref(null);
const menuItems = ref([
    { label: 'Edit', icon: 'pi pi-pencil', command: () => onEdit() },
    { label: 'Delete', icon: 'pi pi-trash', command: () => handleDelete() }
]);

const toggleMenu = (event, i, task) => {
    clickedTask.value = task;

    menu.value[i].toggle(event);
};

// Reactive state for category editing
const editableName = ref(props.name);
const selectedCategoryIds = ref(props.categories.map((cat) => cat.id));
const categoryList = ref(useCategories()); // Make categoryList a ref and type it

// Computed property for category names
const categoryNames = computed(() => {
    return props.categories.map((category) => category.name).join(', ');
});

// Watch for category changes and update reactive state
watch(
    () => props.categories,
    (newCategories) => {
        selectedCategoryIds.value = newCategories.map((cat) => cat.id);
    },
    { immediate: true }
);

// Watch for name changes and update editableName
watch(
    () => props.name,
    (newName) => {
        editableName.value = newName;
    },
    { immediate: true }
);

// Dynamic class logic for card text wrapper
const getCardTextWrapperClass = computed(() => {
    return (props.mode === 'edit' && props.selected) || props.show.length > 0 ? 'show' : 'hide';
});

function handleSubmit() {
    emit('update:name', editableName.value);

    const selectedCategories = categoryList.value.filter((cat: Category) => selectedCategoryIds.value.includes(cat.id));
    emit('update:categories', selectedCategories);

    // Reset form or close edit mode if needed
    emit('update:selected', false);
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
