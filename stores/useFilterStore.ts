import { defineStore } from 'pinia';

// Add simple interface for our needs
interface FilterOption {
    id?: string;
    name?: string;
    value?: any;
    [key: string]: any;
}

interface FilterState {
    selectedFilters: Record<string, any[]>;
    filterFields: Record<
        string,
        {
            field: string;
            options: FilterOption[]; // Changed from Item[] to FilterOption[]
        }
    >;
}

// Convert to factory pattern
export const createFilterStore = (gridId: string) =>
    defineStore(`filter-${gridId}`, {
        state: (): FilterState => ({
            selectedFilters: {},
            filterFields: {}
        }),

        actions: {
            setFilter(field: string, selected: any[]) {
                this.selectedFilters[field] = selected;
            },

            setFilterField(field: string, options: FilterOption[]) {
                this.filterFields[field] = {
                    field,
                    options
                };
            },

            clearFilter(field: string) {
                this.selectedFilters[field] = [];
            },

            clearAllFilters() {
                this.selectedFilters = {};
            }
        },

        getters: {
            getSelectedFilters: (state) => (field: string) => state.selectedFilters[field] || [],

            getFilterOptions: (state) => (field: string) => state.filterFields[field]?.options || [],

            hasActiveFilters: (state) => Object.values(state.selectedFilters).some((filters) => filters.length > 0)
        }
    });
