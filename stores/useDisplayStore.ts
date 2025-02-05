/**
 * Store for managing card display size and layout
 * Used exclusively by DisplayControl component to switch between different card layouts
 * Not to be confused with useShowStore which controls field visibility
 */
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

export const createDisplayStore = (gridId: string) =>
    defineStore(`display-${gridId}`, {
        state: () => ({
            selectedSize: null as CardSize | null
        }),

        actions: {
            initialize(initialSize: string) {
                // Only set if not already set - this maintains persistence
                if (!this.selectedSize) {
                    const size = CARD_SIZES.find((size) => size.label === initialSize);
                    if (size) {
                        this.selectedSize = size;
                    }
                }
            },
            setSize(size: CardSize) {
                this.selectedSize = size;
            }
        },

        getters: {
            currentSize: (state) => state.selectedSize || CARD_SIZES.find((size) => size.label === 'Big Cards') || CARD_SIZES[1],
            displayClass: (state) => state.selectedSize?.display || CARD_SIZES[1].display
        }
    });
