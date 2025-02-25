<script setup lang="ts">
import type { Message } from '~/types/message';

interface Props {
    message?: Message | null;
    dialogVisible?: boolean;
    threadId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    message: null,
    dialogVisible: false,
    threadId: undefined
});

const modelVisible = defineModel<boolean>('dialogVisible');
const store = useMessage();

// Thread messages management
const threadMessages = computed(() => 
    props.threadId ? store.threadMessages[props.threadId] : []
);

const emit = defineEmits<{
    reply: [message: Message];
    'update:dialogVisible': [value: boolean];
}>();

// Initialize thread if ID provided
watchEffect(async () => {
    if (props.threadId) {
        try {
            await store.loadThread(props.threadId);
        } catch (error) {
            console.error('Thread loading error:', error);
        }
    }
});

const handleReply = () => {
    if (props.message) {
        emit('reply', props.message);
    }
};

// Add loading state handling
const isLoading = computed(() => store.loading);
const hasError = computed(() => !!store.error);
const errorMessage = computed(() => store.error?.message || 'Failed to load thread');
</script>

<template>
    <Dialog
        v-model:visible="modelVisible"
        modal
        header="Message Thread"
        class="message-thread-dialog"
    >
        <!-- Add loading state -->
        <template v-if="isLoading">
            <ProgressSpinner class="loading-indicator" />
        </template>
        
        <!-- Add error state -->
        <template v-else-if="hasError">
            <div class="error-message">
                {{ errorMessage }}
            </div>
        </template>

        <!-- Existing content -->
        <div v-else-if="message" class="thread-content">
            <!-- Message Header -->
            <div class="message-header">
                <div class="sender-info">
                    <Avatar 
                        :image="message.sender?.avatar" 
                        icon="pi pi-user" 
                        shape="circle" 
                    />
                    <div class="sender-details">
                        <h3>{{ message.sender?.name || message.from }}</h3>
                        <span class="date">{{ message.created?.date }}</span>
                    </div>
                </div>
                <Button 
                    icon="pi pi-reply" 
                    class="reply-button p-button-text" 
                    @click="handleReply"
                />
            </div>

            <!-- Current Message -->
            <div class="current-message">
                <h2 class="subject">{{ message.subject }}</h2>
                <div class="content" v-html="message.content"></div>
            </div>

            <!-- Thread Messages -->
            <div v-if="threadMessages.length" class="thread-messages">
                <Timeline :value="threadMessages">
                    <template #content="slotProps">
                        <div class="thread-message">
                            <div class="message-meta">
                                <span class="sender">{{ slotProps.item.sender.name }}</span>
                                <span class="date">{{ slotProps.item.created?.date }}</span>
                            </div>
                            <div class="message-content" v-html="slotProps.item.content"></div>
                        </div>
                    </template>
                </Timeline>
            </div>
        </div>
    </Dialog>
</template>

<style lang="scss">
.message-thread-dialog {
    .thread-content {
        padding: 1rem;
    }

    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .sender-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .thread-messages {
        margin-top: 2rem;
        border-top: 1px solid var(--surface-200);
        padding-top: 1rem;
    }

    .thread-message {
        padding: 1rem;
        background: var(--surface-50);
        border-radius: 6px;
        margin: 0.5rem 0;
    }
}

// Add loading and error styles
.loading-indicator {
    display: flex;
    justify-content: center;
    padding: 2rem;
}

.error-message {
    color: var(--red-500);
    text-align: center;
    padding: 2rem;
}
</style>
