<script setup lang="ts">
import type { Message } from '~/types/message';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import MessageSidebar from '~/components/message/MessageSidebar.vue';
import MessageListItem from '~/components/message/MessageListItem.vue';
import { defineAsyncComponent } from 'vue';

// Dynamic component loading for MessageComposer only
const MessageComposer = defineAsyncComponent(() => import('~/components/message/MessageComposer.vue'));

const store = useMailStore();
const toast = useToast();
const route = useRoute();
const dialogVisible = ref(false);
const messageDetail = ref<Message | null>(null);

// Add missing activeFolder computed property
const activeFolder = computed(() => route.path.split('/')[3] || 'inbox');

onMounted(async () => {
    store.activeFolder = activeFolder.value;
    await store.fetchMessages();
});

// Update watch to use computed property
watch(activeFolder, (newFolder) => {
    store.activeFolder = newFolder;
});

// Computed sidebar items
const sidebarItems = computed(() => [
    { label: 'Inbox', icon: 'pi pi-inbox', badge: store.filteredMessages.inbox?.length || 0, routerLink: '/new/message/inbox' },
    { label: 'Starred', icon: 'pi pi-star', badge: store.filteredMessages.starred?.length || 0, routerLink: '/new/message/starred' },
    { label: 'Spam', icon: 'pi pi-ban', badge: store.filteredMessages.spam?.length || 0, routerLink: '/new/message/spam' },
    { label: 'Important', icon: 'pi pi-bookmark', badge: store.filteredMessages.important?.length || 0, routerLink: '/new/message/important' },
    { label: 'Sent', icon: 'pi pi-send', badge: store.filteredMessages.sent?.length || 0, routerLink: '/new/message/sent' },
    { label: 'Archived', icon: 'pi pi-book', badge: store.filteredMessages.archived?.length || 0, routerLink: '/new/message/archived' },
    { label: 'Trash', icon: 'pi pi-trash', badge: store.filteredMessages.trash?.length || 0, routerLink: '/new/message/trash' }
]);

// Message handlers
const messageHandlers = {
    trash: (messages: Message[]) => {
        messages.forEach((msg) => (msg.trash = true));
        store.filterMessages();
        toast.add({ severity: 'info', summary: 'Info', detail: 'Mail moved to trash', life: 3000 });
    },
    spam: (messages: Message[]) => {
        messages.forEach((msg) => (msg.spam = true));
        store.filterMessages();
    },
    archive: (messages: Message[]) => {
        messages.forEach((msg) => (msg.archived = true));
        store.filterMessages();
    }
};

// Add toggleFlag handler
const handleToggleFlag = (flag: 'starred' | 'important', message: Message) => {
    // Toggle the flag in the store
    message[flag] = !message[flag];
    // Update filtered messages
    store.filterMessages();
};

// Dialog handlers
const showReplyDialog = (message: Message) => {
    dialogVisible.value = true;
    messageDetail.value = message;
};

const onSaveReplyMail = (message: Message) => {
    store.messages.push(message);
    store.filterMessages();
    dialogVisible.value = false;
    messageDetail.value = null;
};

const onChangeDialogVisibility = (isVisible: boolean) => {
    dialogVisible.value = isVisible;
};

// Add component determination logic
const currentComponent = computed(() => {
    const routeName = route.name as string;
    if (routeName === 'message-compose') return MessageComposer;
    if (routeName === 'message-detail') return defineAsyncComponent(() => import('~/components/message/MessageDetail.vue'));
    return MessageListItem;
});
</script>

<template>
    <div class="message-container">
        <div class="sidebar">
            <MessageSidebar :items="sidebarItems" />
        </div>
        <div class="content">
            <component
                :is="currentComponent"
                :messages="store.filteredMessages[activeFolder]"
                :mode="$route.name === 'message-compose' ? 'new' : undefined"
                @action="(type, messages) => messageHandlers[type]?.(messages)"
                @reply="showReplyDialog"
                @send:message="onSaveReplyMail"
                @toggleFlag="handleToggleFlag"
            />
        </div>

        <MessageComposer mode="reply" v-model:dialogVisible="dialogVisible" :original-message="messageDetail" @save="onSaveReplyMail" @update:dialogVisible="onChangeDialogVisibility" />
    </div>
</template>

<style lang="scss">
.message-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: var(--p-content-background);

    @container main (min-width:  #{$message-container-break}) {
        flex-direction: row;
    }

    .sidebar {
        padding: 1rem;
        @container main (min-width: #{$message-container-break}) {
            width: 170px;
        }
    }
    .content {
        //width: 100%;
        flex-grow: 1;
    }
}
</style>
