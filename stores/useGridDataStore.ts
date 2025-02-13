import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { get } from 'lodash-es';

export type FilterFunction = (items: any[]) => any[];

export const createGridDataStore = (gridId: string) => 
    defineStore(`grid-data-${gridId}`, () => {
        const originalData = ref<any[]>([]);
        const activeFilters = ref(new Map<string, FilterFunction>());
        
        const filteredByFilters = computed(() => {
            let result = originalData.value;
            
            // Apply each active filter in sequence
            for (const [_, filterFn] of activeFilters.value) {
                result = filterFn(result);
            }
            
            return result;
        });

        function addFilter(key: string, filterFn: FilterFunction) {
            activeFilters.value.set(key, filterFn);
        }

        function removeFilter(key: string) {
            activeFilters.value.delete(key);
        }

        return {
            originalData,
            filteredByFilters,
            addFilter,
            removeFilter
        };
    });
