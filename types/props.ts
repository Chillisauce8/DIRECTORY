import type { PropType } from 'vue';

export type FunctionMode = 'view' | 'select' | 'edit' | 'order';

export interface Category {
    id: number;
    name: string;
}

export interface Image {
    id: string;
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
    required: true as const
};

export const nameProp = {
    type: String,
    default: ''
};

export const classNameProp = {
    type: String,
    default: ''
};

export interface ShowProps {
    show: string[];
}

export interface CardWrapperProps {
    id: string;
    mode: string;
    clickable: boolean;
    searchTerms: string;
    selected: boolean;
    imageId?: string;
    gallery: string;
    show: string[];
}
