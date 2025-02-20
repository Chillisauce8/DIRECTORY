import type { _Node } from '../_Node';

export interface sessions extends _Node {
  userId: string;
  sessionToken: string;
  expires: Date;
}
