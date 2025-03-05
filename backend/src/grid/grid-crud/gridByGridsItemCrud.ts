import * as _ from 'lodash';
import * as BBPromise from 'bluebird';
import {GridCrud} from './gridCrud';
import {ERROR_REASON} from '../../const';
import {coreServiceLocator} from '../../serviceLocator';
import {PermissionView} from '../../auth/permissions-helper';
import {STANDARD_COLLECTIONS_DESCRIPTION} from '../../collectionNames';
import { IDataCrud } from '../../db';
import { RequestHelper } from '../../utils';
import { GridsCrud } from './gridsCrud';


export interface GridByGridsItemConfig {
  gridsItemId: string;
  collectionName: string;
}


export class GridByGridsItemCrud extends GridCrud {

  constructor(dataCrudService: IDataCrud, requestHelper: RequestHelper,
              private gridsCrud: GridsCrud) {
    super(dataCrudService, requestHelper);
  }

  async getDataList(req: Request, gridConfig: GridByGridsItemConfig): Promise<any[]> {
    if (gridConfig.collectionName === STANDARD_COLLECTIONS_DESCRIPTION.collections.name) {
      return this.getDefinitionsDataList(req);
    }

    const grid = await this.gridsCrud.getGridsItemById(req, gridConfig.gridsItemId);

    if (!grid) {
      const message = `Grid ${gridConfig.gridsItemId} not found`;
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message});
    }

    const isUserHasReadPermission = await this.gridsCrud.userHasReadPermissionForGrid(req, grid);

    if (!isUserHasReadPermission) {
      return BBPromise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
    }

    const collections = _.get(grid, 'general.collections');

    if (!collections?.length || !collections.includes(gridConfig.collectionName)) {
      const message = `Collection ${gridConfig.collectionName} not found in grid ${gridConfig.gridsItemId}`;
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message});
    }

    return this.queryData(req, gridConfig.collectionName);
  }

  private async getDefinitionsDataList(req: Request): Promise<any[]> {
    const name = STANDARD_COLLECTIONS_DESCRIPTION.collections.name;
    const view = PermissionView.list;

    const permissionsHelper = coreServiceLocator.get('permissionsHelper');
    const isUserHasReadPermission = await permissionsHelper.userHasReadPermissionsFor(req,
        {name, view});

    if (!isUserHasReadPermission) {
      return BBPromise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
    }

    return this.queryData(req, STANDARD_COLLECTIONS_DESCRIPTION.collections.name);
  }
}

