<template>
    <card-wrapper v-bind="$props" :selected="selected" @update:selected="handleSelect" class="test-card">
        <template #default="{ selected: wrapperSelected }">
            <card-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" :loveable="loveable" :mode="mode" :selected="wrapperSelected" />
            <card-text-wrapper :class="getCardTextWrapperClass(!!wrapperSelected)">
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
    selected: { type: Boolean, required: true }
});

const emit = defineEmits<{
    'update:selected': [boolean];
}>();

const selected = ref(props.selected);

// Watch for prop changes
watch(
    () => props.selected,
    (newValue) => {
        selected.value = newValue;
    }
);

function handleSelect(newValue: boolean) {
    console.log('TestCard handleSelect:', { newValue, id: props.id }); // Debug
    selected.value = newValue;
    emit('update:selected', newValue);
}

// Watch selected state
watch(
    () => selected.value,
    (newVal) => {
        console.log('TestCard selected changed:', newVal);
    }
);

// TestCard specific logic
const editableName = ref(props.name);
const selectedCategoryIds = ref(props.categories.map((cat) => cat.id));
const categoryList = useCategories(); // Assumed external function for category list
const src = ref<string>('');

const categoryNames = computed(() => {
    return props.categories.map((category) => category.name).join(', ');
});

watch(
    () => props.categories,
    (newCategories) => {
        selectedCategoryIds.value = newCategories.map((cat) => cat.id);
    },
    { immediate: true }
);

watch(
    () => props.show,
    (newShow) => {
        console.log('Show value changed:', newShow);
    },
    { immediate: true }
);

const getCardTextWrapperClass = (isSelected: boolean) => {
    return (props.mode === 'edit' && isSelected) || props.show.length > 0 ? 'show' : 'hide';
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
.card-wrapper {
    position: relative; // For smooth Vue transition-group https://www.youtube.com/watch?v=DGI_aKld0Jg
    background: var(--surface-card);
    border: var(--card-border);
    font-size: 12px;
    transition: all 1s ease;
    border-radius: var(--corner-outer);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    img {
        transition: all 0.7s ease;
    }
    &.order {
        cursor: move;
    }
    &.select,
    &.view,
    &.edit,
    &.order {
        .mode-icons {
            display: flex;
            width: 100%;
            height: 100%;
            justify-content: flex-end;
            padding: 5px;
            opacity: 0;
            transition: all 1s ease;
            .icon {
                width: 24px;
                height: 24px;
            }
        }
        :hover {
            img {
                filter: brightness(80%);
            }
            .mode-icons {
                opacity: 0.8;
            }
        }
    }
    &.select.selected,
    &.edit.selected {
        img {
            filter: brightness(40%);
        }
        .mode-icons {
            opacity: 1;
            .icon {
                background-color: var(--primary-color);
                border-radius: 50%;
                svg {
                    stroke: white;
                }
            }
        }
    }
    &:has(.card-text-wrapper.hide) {
        .swp-picture img {
            border-radius: var(--corner-outer);
        }
    }
    & .swp-picture img {
        border-top-left-radius: var(--corner-outer);
        border-top-right-radius: var(--corner-outer);
    }
}
</style>
