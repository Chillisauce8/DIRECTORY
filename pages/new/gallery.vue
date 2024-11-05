<template>
    <SelectButton v-model="mode" :options="modeOptions" />
    <MultiSelect v-model="selectedAlbums" display="chip" :options="albums" optionLabel="name" filter placeholder="Select an Album" :maxSelectedLabels="2" class="w-full md:w-80" />
    <SelectButton v-model="show" :options="showOptions" />
    <MediaGallery :mode :show :selectedAlbumIds />
</template>

<script setup lang="ts">
interface Album {
    name: string;
    id: number;
}

// Define mode with a strict union type
const mode = ref<'view' | 'select'>('view');
const modeOptions = ref(['view', 'select']);
const show = ref<null | 'name' | 'albums'>(null); // Make show nullable
const showOptions = ref(['name', 'albums']);
const selectedAlbums = ref<Album[]>([]); // Explicitly define the type of selectedAlbums
const albums = useAlbums();

// Computed property to extract only the IDs from the selected albums
const selectedAlbumIds = computed(() => selectedAlbums.value.map((album) => album.id));
</script>

<style lang="scss">
.p-togglebutton-label {
    text-transform: capitalize;
}
</style>
