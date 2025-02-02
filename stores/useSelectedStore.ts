import { defineStore } from 'pinia';

export const useSelectedStore = defineStore('selection', {
    state: () => ({
        selectedItems: new Set<string>()
    }),

    actions: {
        select(id: string) {
            console.log('SelectedStore - Selecting:', { id, currentItems: Array.from(this.selectedItems) });
            if (!id) {
                console.warn('SelectedStore - Attempted to select with undefined id');
                return;
            }
            this.selectedItems.add(id);
        },
        deselect(id: string) {
            console.log('SelectedStore - Deselecting', { id, before: this.selectedItems });
            this.selectedItems.delete(id);
            console.log('SelectedStore - After deselect', { after: this.selectedItems });
        },
        toggle(id: string) {
            console.log('SelectedStore - Toggling:', {
                id,
                currentItems: Array.from(this.selectedItems),
                hasId: !!id,
                currentlySelected: this.selectedItems.has(id)
            });
            if (!id) {
                console.warn('SelectedStore - Attempted to toggle with undefined id');
                return;
            }
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
