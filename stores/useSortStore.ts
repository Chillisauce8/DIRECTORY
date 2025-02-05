import { defineStore } from 'pinia';

export interface SortOption {
    label: string;
    sort: string;
    order: 'asc' | 'desc';
}

// Factory function: each grid gets its own store instance
export const createSortStore = (gridId: string) =>
    defineStore(`sort-${gridId}`, {
        state: () => ({
            selectedSort: null as SortOption | null
        }),
        actions: {
            setSort(sort: SortOption) {
                this.selectedSort = sort;
            }
        },
        getters: {
            currentSort: (state) => state.selectedSort
        }
    });
