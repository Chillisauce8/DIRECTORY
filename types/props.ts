import type { PropType } from 'vue';

export type FunctionMode = 'view' | 'select' | 'edit' | 'order';

export interface Category {
    _id: string; // Changed from id: number
    name: string;
}

export interface Image {
    _id: string; // Changed from id: string
    alt: string;
}

// Shared Props
export const showProp = {
    type: Array as PropType<string[]>,
    default: () => ['name']
};

export const modeProp = {
    type: String as PropType<FunctionMode>,
    default: 'view'
};

export const categoriesProp = {
    type: Array as PropType<Category[]>,
    default: () => []
};

export const selectedProp = {
    type: Boolean,
    default: false
};

export const loveableProp = {
    type: Boolean,
    default: false
};

export const imageIdProp = {
    type: String,
    required: false
};

export const nameProp = {
    type: String,
    default: ''
};

export const dataItemProp = {
    type: Object,
    default: null
};

export const classNameProp = {
    type: String,
    default: ''
};

export interface ShowProps {
    show: string[];
}

export const commonCardProps = {
    _id: { type: String, required: true }, // Changed from id to _id
    clickable: { type: Boolean, default: true },
    searchTerms: { type: String, default: '' },
    dataItem: dataItemProp,
    collection: { type: String, required: true },
    imageId: imageIdProp,
    name: nameProp,
    loveable: loveableProp,
    categories: categoriesProp
} as const;
