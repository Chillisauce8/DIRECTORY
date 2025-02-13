import { defineStore } from 'pinia';

interface SelectedState {
    selectedItems: string[];  // Changed from Set to array
}

export const createSelectedStore = (gridId: string) =>
    defineStore(`selected-${gridId}`, {
        state: (): SelectedState => ({
            selectedItems: []
        }),
        actions: {
            select(id: string) {
                if (!this.selectedItems.includes(id)) {
                    this.selectedItems.push(id);
                }
            },
            deselect(id: string) {
                const index = this.selectedItems.indexOf(id);
                if (index !== -1) {
                    this.selectedItems.splice(index, 1);
                }
            },
            toggle(id: string) {
                const index = this.selectedItems.indexOf(id);
                if (index !== -1) {
                    this.selectedItems.splice(index, 1);
                } else {
                    this.selectedItems.push(id);
                }
            },
            clear() {
                this.selectedItems = [];
            },
            setMultiple(ids: string[]) {
                // Ensure uniqueness
                this.selectedItems = [...new Set(ids)];
            },
            // New method to filter selections by visible items
            filterSelections(visibleIds: Set<string>) {
                this.selectedItems = this.selectedItems.filter(id => visibleIds.has(id));
            }
        },
        getters: {
            isSelected: (state) => (id: string) => state.selectedItems.includes(id),
            selectedCount: (state) => state.selectedItems.length,
            hasSelectedItems: (state) => state.selectedItems.length > 0,
            // New getter to get selections as a Set for O(1) lookups
            selectedItemsSet: (state) => new Set(state.selectedItems)
        }
    });
