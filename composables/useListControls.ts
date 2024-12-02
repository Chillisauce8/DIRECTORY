import {computed, ref, type Ref} from 'vue';
import type {DbNode} from '~/service/cars/dbNodeCRUD.service';

export interface Category {
    id: string;
    name: string;
}

export interface SortOption<Item extends unknown = any, SortValue extends unknown = any> {
    label: string;
    sort: string;
    order: 'asc' | 'desc';
    sortGetter?: (item: Item) => SortValue;
}


export type UpdateItemsSortingFn = (sortOption: SortOption) => void;


export interface SearchField {
  field: string;
  label: string;
}

export interface SearchQueryConfig {
  searchFields: SearchField[];
  searchQuery: string;
}


export type UpdateSearchQueryConfigFn = (config: SearchQueryConfig) => void;

export interface Item {
    id: string;
    name: string;
    [key: string]: any;
}

export interface Listing<DBNode extends DbNode = any> extends Item {
    images: { id: string; alt: string }[];
    // categories: Category[];
    dbNode: DBNode;
    [key: string]: any;
}

interface ListControlsOptions {
    initialSort?: SortOption;
    initialCategories?: Category[];
    initialShow?: string[];
    initialSearchQuery?: string;
}

export interface ListControlsReturn {
    selectedCategories: Ref<Category[]>;
    show: Ref<string[]>;
    searchQuery: Ref<string>;
    sort: Ref<SortOption | undefined>;
    selectedCategoryIds: Ref<number[]>;
}

export function useListControls(options?: ListControlsOptions): ListControlsReturn {
    // Common state
    const selectedCategories = ref<Category[]>(options?.initialCategories || []);
    const show = ref<string[]>(options?.initialShow || ['name']);
    const searchQuery = ref(options?.initialSearchQuery || '');
    const sort = ref<SortOption | undefined>(options?.initialSort || undefined);

    // Common computed properties
    const selectedCategoryIds = computed(() => selectedCategories.value.map((category) => category.id));

    return {
        // State
        selectedCategories,
        show,
        searchQuery,
        sort,
        // Computed
        selectedCategoryIds
    };
}
