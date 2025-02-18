<template>
    <div class="messages">
        <MessageContainer />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
// Validate folder parameter if needed
const validFolders = ['inbox', 'starred', 'spam', 'important', 'sent', 'archived', 'trash'];
if (!validFolders.includes(route.params.folder as string)) {
    throw createError({ statusCode: 404, message: 'Folder not found' });
}
</script>
