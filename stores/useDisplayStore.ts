import { defineStore } from 'pinia';

export interface CardSize {
    label: string;
    icon: string;
    display: string;
}

export const CARD_SIZES: readonly CardSize[] = [
    { label: 'Small Cards', icon: 'cardssmall', display: 'display-small-cards' },
    { label: 'Big Cards', icon: 'cardsbig', display: 'display-big-cards' },
    { label: 'List', icon: 'list', display: 'display-list' }
] as const;

export const useDisplayStore = defineStore('display', {
    state: () => ({
        selectedSize: CARD_SIZES[1], // Default to 'Big Cards'
        show: ['name', 'categories'] as string[]
    }),

    actions: {
        setSize(size: CardSize) {
            this.selectedSize = size;
        },
        setShow(fields: string[]) {
            this.show = fields;
        }
    },

    getters: {
        currentSize: (state) => state.selectedSize,
        currentShow: (state) => state.show,
        displayClass: (state) => state.selectedSize.display
    }
});
