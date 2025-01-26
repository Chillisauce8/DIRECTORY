import { defineStore } from 'pinia';

export const useSelectedStore = defineStore('selection', {
    state: () => ({
        selectedItems: new Set<string>()
    }),

    actions: {
        select(id: string) {
            this.selectedItems.add(id);
        },
        deselect(id: string) {
            this.selectedItems.delete(id);
        },
        toggle(id: string) {
            if (this.selectedItems.has(id)) {
                this.selectedItems.delete(id);
            } else {
                this.selectedItems.add(id);
            }
        },
        clear() {
            this.selectedItems.clear();
        },
        setMultiple(ids: string[]) {
            this.selectedItems = new Set(ids);
        }
    },

    getters: {
        isSelected: (state) => (id: string) => state.selectedItems.has(id),
        selectedItemsArray: (state) => Array.from(state.selectedItems),
        hasSelectedItems: (state) => state.selectedItems.size > 0
    }
});
