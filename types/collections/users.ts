import type { _Node } from '../_Node';
import type { _Join } from '../_Join';

export interface users extends _Node {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
 
  general: string;
}