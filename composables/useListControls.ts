import { ref, computed, type Ref } from 'vue';

export interface Category {
    id: number;
    name: string;
}

export interface SortOption {
    label: string;
    sort: string;
    order: 'asc' | 'desc';
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
