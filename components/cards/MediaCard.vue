<template>
    <card-wrapper class="media-card" :class="mode" :id="id" v-bind="mode === 'view' ? { 'data-fancybox': gallery, 'data-caption': name, link: src } : {}" :mode="mode" v-model:selected="selected">
        <swp-picture v-if="imageId" :id="imageId" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" @update:src="src = $event" :loveable="loveable" :mode="mode" />
        <card-text-wrapper :class="getCardTextWrapperClass()">
            <div class="card-details" :class="props.show">
                <h1 class="name">{{ name }}</h1>
                <h1 class="albums">{{ albumNames }}</h1>
            </div>
            <form class="form" v-if="mode === 'edit' && selected" @click.stop>
                <InputText type="text" v-model="editableName" />
                <MultiSelect v-model="selectedAlbums" display="chip" :options="albumList" optionLabel="name" optionValue="id" filter placeholder="Select an Album" :maxSelectedLabels="1" />
                <Button type="submit" severity="secondary" label="Submit" />
            </form>
        </card-text-wrapper>
    </card-wrapper>
</template>

<script setup lang="ts">
const props = defineProps({
    id: { type: String, required: true },
    imageId: { type: String, required: true },
    name: { type: String, default: '' },
    albums: { type: Array as PropType<number[]>, default: () => [] },
    gallery: { type: String, default: 'gallery' },
    mode: { type: String as () => 'view' | 'select' | 'edit' | 'order', default: 'view' },
    loveable: { type: Boolean, default: false },
    loved: { type: Boolean, default: false },
    show: { type: Array as PropType<string[]>, default: () => [] },
    selected: { type: Boolean, default: false } // Add selected prop
});

const selected = defineModel('selected', { type: Boolean, default: false }); // Use two-way binding

const editableName = ref(props.name);
const selectedAlbums = ref<number[]>(props.albums);
const albumList = useAlbums();
const src = ref<string>('');

// Transform album IDs to names for display
const albumNames = computed(() => {
    return selectedAlbums.value
        .map((id) => albumList.find((album) => album.id === id)?.name)
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
        .albums {
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
