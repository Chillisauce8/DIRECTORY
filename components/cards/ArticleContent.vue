<template>
    <picture-image v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" @update:src="src = $event" :loveable="loveable" :mode="mode" />
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { defineProps } from 'vue';

// Props passed down to ArticleContent
const props = defineProps({
    imageId: { type: String, required: true },
    name: { type: String, default: '' },
    mode: { type: String as () => 'view' | 'select' | 'edit' | 'order', default: 'view' },
    loveable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    show: { type: Array as PropType<string[]>, default: () => [] }
});

// Reactive data and computed properties
const editableName = ref(props.name);
const selectedCategoryIds = ref<number[]>([]);
const categoryList = useCategories(); // Assumed external function for category list
const src = ref<string>('');

const categoryNames = computed(() => {
    return selectedCategoryIds.value
        .map((id) => categoryList.find((category) => category.id === id)?.name)
        .filter(Boolean)
        .join(', ');
});

const getCardTextWrapperClass = () => {
    return (props.mode === 'edit' && props.selected) || props.show.length > 0 ? 'show' : 'hide';
};
</script>
