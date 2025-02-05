import { defineStore } from 'pinia';

interface SearchField {
    field: string;
    label: string;
}

interface SearchState {
    searchQuery: string;
    searchFields: SearchField[];
}

export const createSearchStore = (gridId: string) =>
    defineStore(`search-${gridId}`, {
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
