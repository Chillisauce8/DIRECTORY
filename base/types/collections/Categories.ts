import type { _Node } from '../_Node';
import type { _Join } from '../_Join';

export type CategoryType = 'Category Group' | 'Category Item';

export interface Categories extends _Node {
    type: CategoryType;
    categoryGroup?: _Join;
}
