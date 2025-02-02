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
    dbNode: DBNode;
    [key: string]: any;
}
