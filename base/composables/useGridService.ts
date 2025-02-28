import type { DbNode } from '~/types';
import type { BaseService } from '~/service/BaseService';

export interface GridReadyData<T = any> {
  _id: string;
  [key: string]: any;
}

export function useGridService<T extends DbNode>(service: BaseService<T>) {
  function transformForGrid(item: T): GridReadyData<T> {
    // Flatten nested properties for grid operations
    return {
      _id: item._id,
      ...flattenObject(item)  // Would need to implement this
    };
  }

  return {
    async getGridData() {
      const items = await service.getItems();
      return items.map(transformForGrid);
    }
  };
}
