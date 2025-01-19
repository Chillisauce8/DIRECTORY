<script setup lang="ts">
import type { Message } from '~/types/message';
import { useMailUtils } from '~/composables/useMessageUtils';

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

const { generateId, generateDate } = useMailUtils();
const router = useRouter();

// Reactive state with type
const mailContent = ref<Partial<Message>>({});

// Initialize content based on mode and original message
watchEffect(() => {
    if (props.mode === 'reply' && props.originalMessage) {
        mailContent.value = {
            to: props.originalMessage.from,
            title: `Re: ${props.originalMessage.title}`,
            from: props.originalMessage.to
        };
    }
});

const emit = defineEmits<{
    save: [message: Message];
    'update:dialogVisible': [value: boolean];
}>();

function sendMail() {
    const mail: Message = {
        ...mailContent.value,
        id: generateId(),
        sent: true,
        archived: false,
        trash: false,
        spam: false,
        starred: false,
        important: false,
        date: generateDate(),
        image: 'avatar.png'
    };

    emit('save', mail);

    if (props.mode === 'new') {
        router.push({ name: 'mail-inbox' });
    } else {
        modelVisible.value = false;
        mailContent.value = {};
    }
}
</script>

<template>
    <div v-if="mode === 'new'" class="message-composer">
        <div class="compose-form">
            <div class="form-field">
                <IconField class="icon-field">
                    <InputIcon class="pi pi-user" />
                    <InputText id="to" type="text" v-model="mailContent.to" class="recipient-input" fluid placeholder="To:" />
                </IconField>
            </div>
            <div class="form-field">
                <IconField class="icon-field">
                    <InputIcon class="pi pi-pencil" />
                    <InputText id="subject" type="text" v-model="mailContent.title" placeholder="Subject:" class="subject-input" fluid />
                </IconField>
            </div>
            <div class="form-field">
                <Editor v-model="mailContent.message" class="message-editor"></Editor>
            </div>
            <div class="actions">
                <Button type="button" outlined icon="pi pi-image" />
                <Button type="button" outlined icon="pi pi-paperclip" />
                <Button type="button" icon="pi pi-send" label="Send Message" @click="sendMail()" />
            </div>
        </div>
    </div>

    <Dialog v-else v-model:visible="modelVisible" header="Reply" modal class="message-reply-dialog">
        <div class="compose-form">
            <!-- Reuse the same form structure -->
            <div class="form-field">
                <IconField class="icon-field">
                    <InputIcon class="pi pi-user" />
                    <InputText id="to" type="text" v-model="mailContent.to" class="recipient-input" fluid placeholder="To:" />
                </IconField>
            </div>
            <div class="form-field">
                <IconField class="icon-field">
                    <InputIcon class="pi pi-pencil" />
                    <InputText id="subject" type="text" v-model="mailContent.title" placeholder="Subject:" class="subject-input" fluid />
                </IconField>
            </div>

            <div class="form-field">
                <Editor v-model="mailContent.message" class="message-editor"></Editor>
            </div>
            <div class="actions">
                <Button type="button" outlined icon="pi pi-image" />
                <Button type="button" outlined icon="pi pi-paperclip" />
                <Button type="button" icon="pi pi-send" label="Send" @click="sendMail()" />
            </div>
            <div v-if="originalMessage?.message" class="message-preview">
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
