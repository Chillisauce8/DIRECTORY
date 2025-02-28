import { defineStore } from 'pinia';
import { get } from 'lodash-es';

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
            options: FilterOption[];
        }
    >;
    currentFilteredItems: any[]; // Add this to track current filtered data state
}

// Convert to factory pattern
export const createFilterStore = (gridId: string) =>
    defineStore(`filter-${gridId}`, {
        state: (): FilterState => ({
            selectedFilters: {},
            filterFields: {},
            currentFilteredItems: [] // Add this to track current filtered data state
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
            },

            updateAvailableOptions(items: any[]) {
                this.currentFilteredItems = items;
                
                // Update counts for each filter field
                Object.entries(this.filterFields).forEach(([field, config]) => {
                    const counts = new Map<string | number, number>();
                    
                    items.forEach(item => {
                        const values = this.extractFieldValues(item, field);
                        values.forEach(val => {
                            counts.set(val, (counts.get(val) || 0) + 1);
                        });
                    });
                    
                    // Update options with new counts
                    config.options = Array.from(counts.entries())
                        .map(([value, count]) => ({
                            value,
                            label: `${value} (${count})`,
                            count
                        }))
                        .sort((a, b) => String(a.value).localeCompare(String(b.value)));
                });
            },

            extractFieldValues(item: any, field: string): (string | number)[] {
                const extracted = get(item, field);
                if (Array.isArray(extracted)) {
                    return extracted.map(val => 
                        typeof val === 'object' ? val.name : val
                    );
                }
                return extracted ? [typeof extracted === 'object' ? extracted.name : extracted] : [];
            },

            updateFilterOptionsFromItems(items: any[]) {
                this.currentFilteredItems = items;
                
                // Update each filter field's options based on current filtered items
                Object.entries(this.filterFields).forEach(([field, config]) => {
                    const valueCounts = new Map<string | number, number>();
                    
                    // Count occurrences in filtered items
                    items.forEach(item => {
                        const fieldValue = get(item, field);
                        if (Array.isArray(fieldValue)) {
                            fieldValue.forEach(v => {
                                const value = typeof v === 'object' ? v.name : v;
                                valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
                            });
                        } else if (fieldValue !== undefined && fieldValue !== null) {
                            const value = typeof fieldValue === 'object' ? fieldValue.name : fieldValue;
                            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
                        }
                    });

                    // Update options while preserving selected state
                    const currentSelected = new Set(this.selectedFilters[field] || []);
                    
                    config.options = Array.from(valueCounts.entries())
                        .map(([value, count]) => ({
                            value,
                            label: `${value} (${count})`,
                            count
                        }))
                        .sort((a, b) => String(a.value).localeCompare(String(b.value)));
                });
            }
        },

        getters: {
            getSelectedFilters: (state) => (field: string) => state.selectedFilters[field] || [],

            getFilterOptions: (state) => (field: string) => state.filterFields[field]?.options || [],

            hasActiveFilters: (state) => Object.values(state.selectedFilters).some((filters) => filters.length > 0)
        }
    });
