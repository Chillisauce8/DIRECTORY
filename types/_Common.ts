import type { _Join } from './_Join';

export interface _Common {
    name: string;
    description: string;
    images: _Join[];
    categories: _Join[]; // Changed back to categories
}
