<template>
    <div class="messages">
        <MessageContainer />
    </div>
</template>

<script setup lang="ts">
/**
 * Message Folder Page Component
 * 
 * Top-level route component for message management
 */

const route = useRoute();
const store = useMessage();
const initialized = ref(false);

// Validate folder parameter
const validFolders = ['inbox', 'starred', 'spam', 'important', 'sent', 'archived', 'trash'];
if (!validFolders.includes(route.params.folder as string)) {
    throw createError({ statusCode: 404, message: 'Folder not found' });
}

// Initialize store with folder - use await to ensure initialization completes
onBeforeMount(async () => {
    console.log('Page beforeMount, setting active folder:', route.params.folder);
    store.activeFolder = route.params.folder as string;
});

// Ensure page waits for loading
onMounted(async () => {
    console.log('Page mounted, store state:', { 
        initialized: store.initialized, 
        messageCount: store.messages.length 
    });
    
    // Don't repeat initialization here - let the component handle it
    initialized.value = true;
});
</script>
