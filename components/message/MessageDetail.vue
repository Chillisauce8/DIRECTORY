<script setup lang="ts">
import type { Message } from '~/types/message';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage } from '~/stores/useMessage';

const emit = defineEmits(['send:message']);
const store = useMessage();
const route = useRoute();
const router = useRouter();

const message = ref<Message | null>(null);
const newMessage = ref({
    message: ''
});

// Get message from store instead of props
const getMessage = () => {
    // Convert both IDs to strings for comparison
    return store.messages.find((msg) => String(msg.id) === String(route.params.id));
};

// Watch both store messages and route for changes
watch(
    [() => store.messages, () => route.params.id],
    () => {
        message.value = getMessage();
    },
    { immediate: true, deep: true }
);

const dialogVisible = ref(false);

function handleReply() {
    emit('reply', message.value);
}

function goBack() {
    // Update route name to include 'new'
    router.push({ name: 'new-message-inbox' });
}
</script>

<template>
    <div v-if="message" class="message-detail">
        <div class="header">
            <div class="sender-info">
                <Button type="button" icon="pi pi-chevron-left" text plain @click="goBack()"></Button>
                <Avatar v-if="message.sender?.id" :image="`/demo/images/avatar/${message.sender.id}.png`" size="large" shape="circle" class="avatar"></Avatar>
                <div class="info">
                    <span class="name">{{ message.sender?.name || message.sender?.title }}</span>
                    <span class="recipient">To: {{ message.userRecipients?.[0] }}</span>
                </div>
            </div>
            <div class="actions">
                <span class="date">{{ new Date(message._createdAt).toLocaleString() }}</span>
                <Button type="button" icon="pi pi-reply" text plain @click="handleReply()"></Button>
                <Button type="button" icon="pi pi-ellipsis-v" text plain></Button>
            </div>
        </div>
        <div class="content">
            <div class="title">{{ message.subject }}</div>
            <div class="message" v-html="message.content"></div>

            <div class="footer">
                <Button type="button" icon="pi pi-send" label="Send Reply" @click="handleReply()" />
            </div>
        </div>
    </div>
    <div v-else>Loading message...</div>
</template>

<style lang="scss">
.message-detail {
    .header {
        display: flex;
        flex-direction: column;
        margin-bottom: 2rem;
        padding-top: 2rem;
        gap: 1.5rem;
        border-top: 1px solid var(--surface-200);

        @container main (min-width: $md) {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding-top: 0;
            border-top: none;
        }

        .sender-info {
            display: flex;
            align-items: center;

            .avatar {
                border: 2px solid var(--surface-200);
            }

            .info {
                display: flex;
                flex-direction: column;
                margin-left: 1rem;

                .name {
                    color: var(--surface-900);
                    font-weight: 700;
                    font-size: 1.125rem;
                }

                .recipient {
                    color: var(--surface-900);
                    font-weight: 600;
                }
            }
        }

        .actions {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0 1.5rem;

            @container main (min-width: $md) {
                padding: 0;
            }

            .date {
                color: var(--surface-900);
                font-weight: 600;
                white-space: nowrap;
                margin-right: auto;
            }
        }
    }

    .content {
        border: 1px solid var(--surface-200);
        border-radius: 6px;
        padding: 1.5rem;

        .title {
            color: var(--surface-900);
            font-weight: 600;
            font-size: 1.125rem;
            margin-bottom: 1rem;
        }

        .message {
            line-height: 1.5;
            margin: 0 0 1rem;
        }

        .footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 1rem;
        }
    }
}
</style>
