import { defineStore } from 'pinia';

// Factory function: each grid gets its own store instance
export const createSelectedStore = (gridId: string) =>
    defineStore(`selected-${gridId}`, {
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
                this.clear();
                ids.forEach((id) => this.selectedItems.add(id));
            }
        },
        getters: {
            isSelected: (state) => (id: string) => state.selectedItems.has(id),
            selectedCount: (state) => state.selectedItems.size,
            hasSelections: (state) => state.selectedItems.size > 0,
            hasSelectedItems: (state) => state.selectedItems.size > 0
        }
    });
