<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useMessage } from '~/composables/useMessage';
import type { Message } from '~/types/message';
import MessageListItem from './MessageListItem.vue';
import MessageComposer from './MessageComposer.vue';
import { ref, onMounted, defineAsyncComponent } from 'vue';

const store = useMessage();
const toast = useToast();
const route = useRoute();
const dialogVisible = ref(false);
const messageDetail = ref<Message | null>(null);

const activeFolder = computed(() => route.path.split('/')[3] || 'inbox');
const currentMessages = computed(() => store.filteredMessages[activeFolder.value] || []);

// Move fetch logic into onMounted
onMounted(async () => {
    store.activeFolder = activeFolder.value;
    await store.fetchMessages();
});

// Watch for route changes after component is mounted
watch(() => route.path, async () => {
    store.activeFolder = activeFolder.value;
    await store.fetchMessages();
});

const sidebarItems = computed(() => [
    { label: 'Inbox', icon: 'pi pi-inbox', badge: store.filteredMessages.inbox?.length },
    { label: 'Starred', icon: 'pi pi-star', badge: store.filteredMessages.starred?.length },
    { label: 'Spam', icon: 'pi pi-ban', badge: store.filteredMessages.spam?.length },
    { label: 'Important', icon: 'pi pi-bookmark', badge: store.filteredMessages.important?.length },
    { label: 'Sent', icon: 'pi pi-send', badge: store.filteredMessages.sent?.length },
    { label: 'Archived', icon: 'pi pi-book', badge: store.filteredMessages.archived?.length },
    { label: 'Trash', icon: 'pi pi-trash', badge: store.filteredMessages.trash?.length }
].map(item => ({
    ...item,
    routerLink: `/new/message/${item.label.toLowerCase()}`
})));

const messageHandlers = {
    trash: async (messages: Message[]) => {
        try {
            messages.forEach((msg) => (msg.trash = true));
            await store.filterMessages();
            toast.add({ severity: 'info', summary: 'Info', detail: 'Mail moved to trash', life: 3000 });
        } catch (error) {
            handleStoreError(error);
        }
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

const handleToggleFlag = (flag: 'starred' | 'important', message: Message) => {
    message[flag] = !message[flag];
    store.filterMessages();
};

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

const currentComponent = computed(() => {
    const routeName = route.name as string;
    if (routeName === 'message-compose') return MessageComposer;
    if (routeName === 'message-detail') {
        return defineAsyncComponent(() => import('./MessageDetail.vue'));
    }
    return MessageListItem;
});

const routeName = computed(() => route.name as string);
</script>

<template>
    <div class="message-container">
        <div class="sidebar">
            <MessageSidebar :items="sidebarItems" />
        </div>
        <div class="content">
            <Suspense>
                <component
                    :is="currentComponent"
                    :messages="currentMessages"
                    v-bind="routeName === 'message-compose' ? { mode: 'new' } : {}"
                    v-on="routeName === 'message-compose' ? { 'send:message': onSaveReplyMail } : {}"
                    @action="(type, messages) => messageHandlers[type]?.(messages)"
                    @reply="showReplyDialog"
                    @toggleFlag="handleToggleFlag"
                />
                <template #fallback>
                    <div>Loading...</div>
                </template>
            </Suspense>
        </div>

        <MessageComposer 
            mode="reply" 
            v-model:dialogVisible="dialogVisible" 
            :original-message="messageDetail" 
            @save="onSaveReplyMail" 
            @update:dialogVisible="onChangeDialogVisibility" 
        />
    </div>
</template>

<style lang="scss">
@use '~/assets/css/_scss-variables' as vars;

.message-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--p-content-background);

    @container main (min-width: #{vars.$message-container-lg}) {
        flex-direction: row;
    }

    .sidebar {
        padding: 1rem;
        @container main (min-width: #{vars.$message-container-lg}) {
            width: 170px;
        }
    }
    .content {
        flex-grow: 1;
    }
}
</style>
