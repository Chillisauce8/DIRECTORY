<template>
    <card-wrapper class="media-card" :class="mode" :id="id" v-bind="mode === 'view' ? { 'data-fancybox': gallery, 'data-caption': name, link: fullSizeSrc } : {}" :mode="mode" v-model:selected="selected">
        <swp-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" @update:src="src = $event" :loveable="loveable" :mode="mode" />
        <card-text-wrapper :class="getCardTextWrapperClass()">
            <div class="card-details" :class="props.show">
                <h1 class="name">{{ name }}</h1>
                <h1 class="categories">{{ categoryNames }}</h1>
            </div>
            <form class="form" v-if="mode === 'edit' && selected" @click.stop>
                <InputText type="text" v-model="editableName" />
                <MultiSelect v-model="selectedCategoryIds" display="chip" :options="categoryList" optionLabel="name" optionValue="id" filter placeholder="Select a Category" :maxSelectedLabels="1" />
                <Button type="submit" severity="secondary" label="Submit" />
            </form>
        </card-text-wrapper>
    </card-wrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { defineProps, defineModel, type PropType } from 'vue';

const props = defineProps({
    id: { type: String, required: true },
    imageId: { type: String, required: true },
    name: { type: String, default: '' },
    categories: { type: Array as PropType<{ id: number; name: string }[]>, default: () => [] }, // Array of category objects
    gallery: { type: String, default: 'gallery' },
    mode: { type: String as () => 'view' | 'select' | 'edit' | 'order', default: 'view' },
    loveable: { type: Boolean, default: false },
    loved: { type: Boolean, default: false },
    show: { type: Array as PropType<string[]>, default: () => [] },
    selected: { type: Boolean, default: false } // Selected prop for two-way binding
});
const fullSizeSrc = computed(() => `https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto/${props.imageId}`);

const selected = defineModel('selected', { type: Boolean, default: false }); // Two-way binding model

const editableName = ref(props.name);
const selectedCategoryIds = ref<number[]>(props.categories.map((category) => category.id)); // Extract category IDs
const categoryList = useCategories(); // Get full list of categories
const src = ref<string>('');

// Transform category objects to a list of names for display
const categoryNames = computed(() => {
    return selectedCategoryIds.value
        .map((id) => categoryList.find((category) => category.id === id)?.name)
        .filter(Boolean)
        .join(', ');
});

const getCardTextWrapperClass = () => {
    if ((props.mode === 'edit' && selected.value) || props.show?.length > 0) {
        return 'show';
    } else {
        return 'hide';
    }
};
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
        &:not(.albums) .albums,
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
