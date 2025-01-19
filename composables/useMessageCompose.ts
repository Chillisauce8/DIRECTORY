import { reactive } from 'vue';
import type { Message } from '~/types/message';
import { useMailUtils } from '~/composables/useMessageUtils';

const { generateId } = useMailUtils();

export function useMailCompose() {
    const newMail = reactive<Partial<Message>>({});

    const sendMail = (replyTo?: Message) => {
        const mail: Message = {
            ...newMail,
            id: generateId(), // Demo only
            date: new Date().toISOString(),
            sent: true,
            archived: false,
            trash: false,
            spam: false,
            starred: false,
            important: false,
            image: 'avatar.png'
        };

        if (replyTo) {
            mail.to = replyTo.from;
            mail.title = `Re: ${replyTo.title}`;
        }

        return mail;
    };

    return {
        newMail,
        sendMail
    };
}
