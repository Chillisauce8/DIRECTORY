<template>
    <card-wrapper class="media-card" :class="mode" v-bind="mode === 'view' ? { 'data-fancybox': gallery, 'data-caption': name, link: src } : {}" :mode="mode">
        <swp-picture v-if="id" :id="id" :name="name" widths="290:870" :increment="290" aspectRatio="3:2" loading="lazy" @update:src="src = $event" :loveable="loveable" :mode="mode" />
        <card-text-wrapper :class="getCardTextWrapperClass()">
            <div class="card-details">
                <h1 class="name" :class="getVisibilityClass('name')">{{ name }}</h1>
                <h1 class="albums" :class="getVisibilityClass('albums')">{{ albumNames }}</h1>
            </div>
            <form class="edit-form">
                <InputText type="text" v-model="editableName" />
                <MultiSelect v-model="selectedAlbums" display="chip" :options="albumList" optionLabel="name" optionValue="id" filter placeholder="Select an Album" :maxSelectedLabels="1" />
                <Button type="submit" severity="secondary" label="Submit" />
            </form>
        </card-text-wrapper>
    </card-wrapper>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ''
    },
    albums: {
        type: Array as () => number[],
        default: () => []
    },
    gallery: {
        type: String,
        default: 'gallery'
    },
    mode: {
        type: String as () => 'view' | 'select' | 'edit',
        default: 'view'
    },
    selectable: {
        type: Boolean,
        default: false
    },
    selected: {
        type: Boolean,
        default: false
    },
    loveable: {
        type: Boolean,
        default: false
    },
    loved: {
        type: Boolean,
        default: false
    },
    show: {
        type: [Array, null] as () => string[] | null
    }
});

const albumList = useAlbums();
const src = ref<string>('');
const editableName = ref(props.name); // Local ref for editing the `name` prop

watch(editableName, (newName) => {
    emit('update:name', newName); // Emit an update whenever editableName changes
});

// Transform album IDs to names for display
const albumNames = computed(() => {
    return props.albums
        .map((id) => albumList.find((album) => album.id === id)?.name)
        .filter(Boolean)
        .join(', ');
});

// Bind selected albums to v-model directly
const selectedAlbums = computed({
    get: () => albumList.filter((album) => props.albums.includes(album.id)),
    set: (newSelectedAlbums) => {
        const newAlbumIds = newSelectedAlbums.map((album) => album.id);
        // Update albums prop or emit change if needed
        // emit('update:albums', newAlbumIds);
    }
});

const getVisibilityClass = (value: string) => {
    return props.show?.includes(value) ? 'visible' : 'hidden';
};

const getCardTextWrapperClass = () => {
    return {
        show: props.show?.length > 0,
        hide: !props.show || props.show.length === 0
    };
};
</script>

<style lang="scss">
.media-card {
    picture {
        @include aspect-ratio(3, 2);
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
    .edit-form {
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
