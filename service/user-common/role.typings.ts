import type {DbNode} from '~/service/db-node.typings';


export interface RoleDbNode extends DbNode {
  [fieldName: string]: any;
}
