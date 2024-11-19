<template>
    <card-wrapper v-bind="$props" :selected="localSelected" @update:selected="updateSelected" class="media-card">
        <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" :mode="mode" :selected="localSelected" />
        <card-text-wrapper :class="getCardTextWrapperClass">
            <div class="card-details" :class="show">
                <h1 class="name">{{ name }}</h1>
                <h1 class="categories">{{ categoryNames }}</h1>
            </div>
            <form class="form" v-if="mode === 'edit' && localSelected" @click.stop>
                <InputText type="text" v-model="editableName" />
                <MultiSelect v-model="selectedCategoryIds" display="chip" :options="categoryList" optionLabel="name" optionValue="id" filter placeholder="Select a Category" :maxSelectedLabels="1" />
                <Button type="submit" severity="secondary" label="Submit" />
            </form>
        </card-text-wrapper>
    </card-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { imageIdProp, nameProp, modeProp, loveableProp, showProp, categoriesProp } from '@/types/props';
import CardWrapper from './common/CardWrapper.vue';

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
    selected: { type: Boolean, required: true } // Passed down from parent or updated by CardWrapper
});

const emit = defineEmits(['update:selected']);

// Local state for managing `selected`
const localSelected = ref(props.selected);

// Watch prop changes and update local state
watch(
    () => props.selected,
    (newSelected) => {
        localSelected.value = newSelected;
    }
);

// Emit updates to parent when local state changes
function updateSelected(value: boolean) {
    localSelected.value = value;
    emit('update:selected', value); // Notify parent about the change
}

// Reactive state for category editing
const editableName = ref(props.name);
const selectedCategoryIds = ref(props.categories.map((cat) => cat.id));
const categoryList = useCategories(); // Example: Fetch category list

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
    return (props.mode === 'edit' && localSelected.value) || props.show.length > 0 ? 'show' : 'hide';
});
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
            font-family: $ff2;
            font-size: 15px;
            font-weight: 100;
            margin: 5px 0;
        }
        .categories {
            font-family: $ff2;
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
