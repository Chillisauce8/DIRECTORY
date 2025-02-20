import type { _Node } from '../_Node';

export interface users extends _Node {
  name?: string;
  email?: string;
  phone?: string;
  emailVerified?: Date;

  // Auth specific
  password?: string; // For credentials provider
  accounts?: any[]; // For OAuth accounts
  sessions?: any[];
}