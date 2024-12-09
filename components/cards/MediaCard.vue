<template>
    <div class="media-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" :mode="mode" :selected="selected" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <div class="card-details" :class="show">
                <h1 class="name">{{ name }}</h1>
                <h1 class="categories">{{ categoryNames }}</h1>
            </div>
            <slot v-if="mode === 'edit' && selected" name="inline-edit">
                <form class="form" @submit.prevent="handleSubmit" @click.stop>
                    <InputText type="text" v-model="editableName" />
                    <MultiSelect v-model="selectedCategoryIds" display="chip" :options="categoryList" optionLabel="name" optionValue="id" filter placeholder="Select a Category" :maxSelectedLabels="1" />
                    <Button type="submit" severity="secondary" label="Submit" />
                </form>
            </slot>
        </card-text-wrapper>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { imageIdProp, nameProp, modeProp, loveableProp, showProp, categoriesProp } from '@/types/props';
import type { Category } from '@/types/props'; // or wherever your Category type is defined

const props = defineProps({
    id: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    mode: modeProp,
    loveable: loveableProp,
    show: showProp,
    categories: categoriesProp,
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    gallery: { type: String, default: 'gallery' },
    selected: { type: Boolean, required: true },
    onNameUpdate: { type: Function as PropType<(name: string) => void>, required: true },
    onCategoriesUpdate: { type: Function as PropType<(categories: Category[]) => void>, required: true }
});

const emit = defineEmits(['update:selected', 'update:name', 'update:categories']);

// Remove localSelected and direct binding to ensure reactivity
function handleSelection(value: boolean) {
    emit('update:selected', value);
}

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
.media-card {
    picture {
        @include aspect-ratio(3, 2);
    }
    &.edit.selected {
        .card-details {
            display: none;
        }
    }
    .card-details {
        &:not(.categories) .categories,
        &:not(.name) .name {
            display: none;
        }
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
