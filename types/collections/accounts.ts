import type { _Node } from '../_Node';

export interface accounts extends _Node {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: string;  // Changed from number to Date
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}