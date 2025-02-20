import type { _Node } from '../_Node';

export interface verificationTokens extends _Node {
  identifier: string;
  token: string;
  expires: Date;
}
