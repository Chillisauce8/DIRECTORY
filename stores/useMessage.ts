import { defineStore } from 'pinia';
import type { Message } from '~/types/message';

export const useMailStore = defineStore('mail', () => {
    const messages = ref<Message[]>([]);
    const filteredMessages = ref<Record<string, Message[]>>({});
    const activeFolder = ref('inbox');

    // Demo data fetching
    async function fetchMessages() {
        const { data } = await useFetch('/demo/data/mail.json');
        messages.value = data.value?.data || [];
        filterMessages();
    }

    // Filter messages by type
    function filterMessages() {
        filteredMessages.value = {};
        messages.value.forEach((message) => {
            if (!message.archived && !message.trash && !message.spam && !message.sent) {
                addToFolder('inbox', message);
            }
            Object.entries(message).forEach(([key, value]) => {
                if (value === true) addToFolder(key, message);
            });
        });
    }

    function addToFolder(folder: string, message: Message) {
        if (!filteredMessages.value[folder]) {
            filteredMessages.value[folder] = [];
        }
        filteredMessages.value[folder].push(message);
    }

    return {
        messages,
        filteredMessages,
        activeFolder,
        fetchMessages,
        filterMessages
    };
});
