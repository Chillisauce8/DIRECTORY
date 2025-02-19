<template>
    <div class="messages">
        <MessageContainer />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'messages'
});

const route = useRoute();
const store = useMessage();

// Validate folder parameter
const validFolders = ['inbox', 'starred', 'spam', 'important', 'sent', 'archived', 'trash'];
if (!validFolders.includes(route.params.folder as string)) {
    throw createError({ statusCode: 404, message: 'Folder not found' });
}

// Initialize store with current folder
onMounted(() => {
    store.activeFolder = route.params.folder as string;
});
</script>
