<script setup lang="ts">
import type { Message } from '~/types/message';

interface Props {
    message?: Message | null;
    dialogVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    message: null,
    dialogVisible: false
});

const modelVisible = defineModel('dialogVisible');

const emit = defineEmits<{
    reply: [message: Message];
    'update:dialogVisible': [value: boolean];
}>();

const handleReply = () => {
    if (props.message) {
        emit('reply', props.message);
    }
};
</script>

<template>
    <Dialog
        v-model:visible="modelVisible"
        modal
        header="Message Detail"
        class="message-detail-dialog"
    >
        <div v-if="message" class="message-content">
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
            <h2 class="subject">{{ message.subject }}</h2>
            <div class="content" v-html="message.content"></div>
        </div>
    </Dialog>
</template>

<style lang="scss" scoped>
.message-detail-dialog {
    .message-content {
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

    .sender-details {
        h3 {
            margin: 0;
            font-size: 1.1rem;
        }
        .date {
            color: var(--text-color-secondary);
            font-size: 0.9rem;
        }
    }

    .subject {
        margin: 1rem 0;
        font-size: 1.5rem;
    }

    .content {
        margin-top: 1rem;
        line-height: 1.5;
    }
}
</style>
