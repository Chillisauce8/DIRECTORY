<script setup lang="ts">
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

const modelVisible = defineModel<boolean>('dialogVisible', {
    required: false,
    default: false
});
const router = useRouter();

// Full form state management
const mailContent = ref({
    subject: '',
    content: '',
    recipientType: 'user' as const,
    userRecipients: [] as string[],
    sender: {
        id: '',
        title: '',
        name: '',
        _type: 'user' as const
    }
});

// Reply handling
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

// Watch for reply content changes
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
            id: '',
            name: '',
            userType: 'user',
            date: new Date().toISOString(),
            isTest: false,
            environment: 'development'
        },
        isInitialMessage: true,
        state: 'sent'
    } as Message;

    emit('save', mail);

    if (props.mode === 'new') {
        router.push({ name: 'message-inbox' });
    } else {
        modelVisible.value = false;
        mailContent.value = {
            subject: '',
            content: '',
            recipientType: 'user',
            userRecipients: [],
            sender: { id: '', title: '', name: '', _type: 'user' }
        };
    }
}
</script>

<template>
    <Dialog 
        v-model:visible="modelVisible" 
        :header="mode === 'new' ? 'New Message' : 'Reply'" 
        modal 
        class="message-compose-dialog"
    >
        <div class="compose-form">
            <div class="form-field">
                <IconField class="icon-field">
                    <InputIcon class="pi pi-user" />
                    <InputText 
                        id="to" 
                        type="text" 
                        v-model="mailContent.userRecipients" 
                        class="recipient-input" 
                        fluid 
                        placeholder="To:" 
                    />
                </IconField>
            </div>
            <div class="form-field">
                <IconField class="icon-field">
                    <InputIcon class="pi pi-pencil" />
                    <InputText 
                        id="subject" 
                        type="text" 
                        v-model="mailContent.subject" 
                        placeholder="Subject:" 
                        class="subject-input" 
                        fluid 
                    />
                </IconField>
            </div>
            <div class="form-field">
                <Editor v-model="mailContent.content" class="message-editor" />
            </div>
            <div class="actions">
                <Button type="button" outlined icon="pi pi-image" />
                <Button type="button" outlined icon="pi pi-paperclip" />
                <Button type="button" icon="pi pi-send" label="Send Message" @click="sendMail" />
            </div>
            <div v-if="mode === 'reply' && originalMessage?.content" class="message-preview">
                <div class="message-content" v-html="originalMessage.content" />
            </div>
        </div>
    </Dialog>
</template>

<style lang="scss">
.message-compose-dialog {
    .compose-form {
        display: grid;
        gap: 1rem;
        background: var(--surface-0);
        border-radius: 0.5rem;

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

        .message-editor {
            height: 250px;
        }

        .actions {
            grid-column: span 12;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
        }

        .message-preview {
            grid-column: span 12;
            border: 1px solid var(--surface-200);
            border-radius: 6px;
            padding: 1.5rem;
            margin: 1rem 0;
        }
    }
}
</style>
