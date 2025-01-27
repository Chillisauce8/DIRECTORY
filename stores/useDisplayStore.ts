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
        selectedSize: null as CardSize | null
    }),

    actions: {
        setSize(size: CardSize) {
            this.selectedSize = size;
        }
    },

    getters: {
        currentSize: (state) => state.selectedSize || CARD_SIZES.find((size) => size.label === 'Big Cards') || CARD_SIZES[1],
        displayClass: (state) => state.selectedSize?.display || CARD_SIZES[1].display
    }
});
