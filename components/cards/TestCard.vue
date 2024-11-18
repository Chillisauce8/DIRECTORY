<template>
    <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" @update:src="src = $event" :loveable="loveable" :mode="mode" :selected="selected">
        <!-- Always show image regardless of mode -->
    </card-picture>
    <card-text-wrapper :class="getCardTextWrapperClass()">
        <div class="card-details" :class="show">
            <h1 class="name">{{ name }}</h1>
            <h1 class="categories">{{ categoryNames }}</h1>
        </div>
        <form class="form" v-if="mode === 'edit' && selected" @click.stop>
            <InputText type="text" v-model="editableName" />
            <MultiSelect v-model="selectedCategoryIds" display="chip" :options="categoryList" optionLabel="name" optionValue="id" filter placeholder="Select a Category" :maxSelectedLabels="1" />
            <Button type="submit" severity="secondary" label="Submit" />
        </form>
    </card-text-wrapper>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { defineProps } from 'vue';
import CardPicture from '../media/CardPicture.vue';

// Props passed down to ArticleContent
const props = defineProps({
    imageId: { type: String, required: true },
    name: { type: String, default: '' },
    mode: { type: String as () => 'view' | 'select' | 'edit' | 'order', default: 'view' },
    loveable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    show: { type: Array as PropType<string[]>, default: () => ['name'] },
    categories: { type: Array as PropType<{ id: number; name: string }[]>, default: () => [] }
});

// Reactive data and computed properties
const editableName = ref(props.name);
const selectedCategoryIds = ref(props.categories.map((cat) => cat.id));
const categoryList = useCategories(); // Assumed external function for category list
const src = ref<string>('');

// Update computed to use props.categories directly
const categoryNames = computed(() => {
    return props.categories.map((category) => category.name).join(', ');
});

// Add watch to keep selectedCategoryIds in sync with props
watch(
    () => props.categories,
    (newCategories) => {
        selectedCategoryIds.value = newCategories.map((cat) => cat.id);
    },
    { immediate: true }
);

// Add watch to debug show prop changes
watch(
    () => props.show,
    (newShow) => {
        console.log('Show value changed:', newShow);
    },
    { immediate: true }
);

const getCardTextWrapperClass = () => {
    return (props.mode === 'edit' && props.selected) || props.show.length > 0 ? 'show' : 'hide';
};
</script>
<style lang="scss">
.test-card {
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
