import type { _Node } from '../_Node';
import type { _Join } from '../_Join';

export interface userGroups extends _Node {
  name: string; // Display name of the group
  members?: Array<{

  }>;
  organisation?: { & _Join

  };
}