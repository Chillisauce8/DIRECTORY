import { defineStore } from 'pinia';

// Add interface definition directly in store
interface SearchField {
    field: string;
    label: string;
}

interface SearchState {
    searchQuery: string;
    searchFields: SearchField[];
}

export const useSearchStore = defineStore('search', {
    state: (): SearchState => ({
        searchQuery: '',
        searchFields: []
    }),

    actions: {
        setSearch(query: string, fields: SearchField[]) {
            this.searchQuery = query;
            this.searchFields = fields;
        },
        clear() {
            this.searchQuery = '';
        }
    }
});
