import { defineStore } from 'pinia';

export const useCardStore = defineStore('card', {
    state: () => ({
        cards: new Map()
    }),
    actions: {
        updateCard(collection: string, id: string, data: any) {
            const key = `${collection}-${id}`;
            this.cards.set(key, data);
        },
        getCard(collection: string, id: string) {
            const key = `${collection}-${id}`;
            return this.cards.get(key);
        }
    }
});
