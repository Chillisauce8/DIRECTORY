import { defineStore } from 'pinia';

export interface SortOption {
    label: string;
    sort: string;
    order: 'asc' | 'desc';
}

export const useSortStore = defineStore('sort', {
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
