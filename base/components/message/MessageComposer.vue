<script setup lang="ts">
/**
 * Message Composer Component
 * 
 * Handles message composition in both new message and reply modes
 * 
 * Features:
 * - Rich text editor integration
 * - Recipient selection
 * - Draft saving
 * - Reply threading
 * 
 * Props:
 * - mode: 'new' | 'reply'
 * - dialogVisible: Controls visibility in reply mode
 * - originalMessage: Original message when replying
 * 
 * Events:
 * - save: Emitted when message is sent
 * - update:dialogVisible: For v-model binding
 * 
 * States:
 * - Draft management
 * - Validation
 * - Loading states
 */
import type { Message } from '~/types/message';

interface Props {
    mode?: 'new' | 'reply';
    originalMessage?: Message | null;
    dialogVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    mode: 'new',
    originalMessage: null,
    dialogVisible: false
});

// Use defineModel for v-model support
const modelVisible = defineModel('dialogVisible');
const router = useRouter();

// Use a more specific type for mail content
interface MailContent {
    subject: string;
    content: string;
    recipientType: 'user' | 'group';
    userRecipients: string[];
    sender: {
        id: string;
        title: string;
        name: string;
        _type: 'user';
    };
}

const mailContent = ref<MailContent>({
    subject: '',
    content: '',
    recipientType: 'user',
    userRecipients: [],
    sender: {
        id: '',
        title: '',
        name: '',
        _type: 'user'
    }
});

// Move reply logic to a separate computed
const replyContent = computed(() => {
    if (props.mode === 'reply' && props.originalMessage) {
        return {
            userRecipients: [props.originalMessage.sender.id],
            subject: `Re: ${props.originalMessage.subject}`,
            recipientType: 'user' as const,
            content: ''
        };
    }
    return null;
});

// Watch reply content changes
watchEffect(() => {
    const content = replyContent.value;
    if (content) {
        mailContent.value = { ...mailContent.value, ...content };
    }
});

const emit = defineEmits<{
    save: [message: Message];
    'update:dialogVisible': [value: boolean];
}>();

function sendMail() {
    const mail: Message = {
        ...mailContent.value,
        _id: crypto.randomUUID(),
        created: {
            id: '', // Will be set by backend
            name: '', // Will be set by backend
            userType: 'user',
            date: new Date().toISOString(), // This is now correctly typed as AuditRecord
            isTest: false,
            environment: 'development'
        },
        isInitialMessage: true,
        state: 'sent'
    } as Message;

    emit('save', mail);

    if (props.mode === 'new') {
        router.push({ name: 'new-message-inbox' });
    } else {
        modelVisible.value = false;
        mailContent.value = {};
    }
}
</script>

<template>
    <Dialog 
        v-model:visible="modelVisible" 
        :header="mode === 'new' ? 'New Message' : 'Reply'" 
        modal 
        class="message-reply-dialog"
    >
        <div class="compose-form">
            <div class="form-field">
                <IconField class="icon-field">
                    <InputIcon class="pi pi-user" />
                    <InputText id="to" type="text" v-model="mailContent.userRecipients" class="recipient-input" fluid placeholder="To:" />
                </IconField>
            </div>
            <div class="form-field">
                <IconField class="icon-field">
                    <InputIcon class="pi pi-pencil" />
                    <InputText id="subject" type="text" v-model="mailContent.subject" placeholder="Subject:" class="subject-input" fluid />
                </IconField>
            </div>
            <div class="form-field">
                <Editor v-model="mailContent.content" class="message-editor"></Editor>
            </div>
            <div class="actions">
                <Button type="button" outlined icon="pi pi-image" />
                <Button type="button" outlined icon="pi pi-paperclip" />
                <Button type="button" icon="pi pi-send" label="Send Message" @click="sendMail()" />
            </div>
            <div v-if="mode === 'reply' && originalMessage?.message" class="message-preview">
                <div class="message-content" v-html="originalMessage.message"></div>
            </div>
        </div>
    </Dialog>
</template>

<style lang="scss">
.message-composer,
.message-reply-dialog {
    .compose-form {
        background: var(--surface-0);
        //  margin-top: 1.5rem;
        display: grid;
        gap: 1rem;
        //  padding: 1.5rem;
        border-radius: 0.5rem;

        @media (min-width: $md) {
            border: 1px solid var(--surface-200);
        }

        .message-preview {
            grid-column: span 12;
            border: 1px solid var(--surface-200);
            border-radius: 6px;
            padding: 1.5rem;
            margin: 1rem 0;
        }
    }

    // ... rest of the styles from MessageNew.vue ...
    .form-field {
        grid-column: span 12;
    }

    .icon-field {
        height: 3.5rem;
        margin-top: 1rem;
    }

    .recipient-input,
    .subject-input {
        padding-left: 4rem;
        color: var(--surface-900);
        font-weight: 600;
        height: 3.5rem;
    }

    .actions {
        grid-column: span 12;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 4rem;
    }

    .message-editor {
        height: 250px;
    }
}

.message-reply-dialog {
    margin: 1rem;

    @media (min-width: $sm) {
        margin: 0;
        width: 100%;
    }

    @media (min-width: $md) {
        width: 66.666667%;
    }

    @media (min-width: $lg) {
        width: 50%;
    }
}
</style>
