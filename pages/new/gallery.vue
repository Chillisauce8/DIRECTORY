<template>
    <SelectButton v-model="mode" :options="options" />
    <MediaGallery :mode />
</template>

<script setup lang="ts">
const mode = ref('view');
const options = ref(['view', 'select']);
</script>
