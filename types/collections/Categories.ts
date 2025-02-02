import type { _Node } from '../_Node';
import type { _Common } from '../_Common';
import type { _Join } from '../_Join';

export type CategoryType = 'Category Group' | 'Category Item';

export interface Categories extends _Node, Omit<_Common, 'categories'> {
    type: CategoryType;
    categoryGroup?: _Join;
}
