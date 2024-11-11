import { UserTypes } from '~/service/user-common/user.service';
import type { DbNode } from '~/service/db-node.typings';

export enum UserCustomCollections {
  staffs = 'staffs',
  customers = 'customers',
  supplierContact = 'supplierContacts',
}


export interface UserData {
  [field: string]: any;
  id: string;
  type: UserTypes;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isSwp: boolean;
  ipList?: string[];
  ipBlocked?: boolean;
  roles?: any[];
  departments?: any[];
}


export interface BaseUserDbNode extends DbNode {
  [field: string]: any;
  isActive: boolean;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  roles?: any[];
  userType?: UserTypes;
  phone?: string;
}
