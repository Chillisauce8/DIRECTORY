import * as _ from 'lodash';
import * as BBPromise from 'bluebird';
import {coreServiceLocator} from '../../serviceLocator';
import { IDataCrud, IQueryParams } from '../../db';
import {ERROR_REASON} from '../../const';
import {PermissionAction, PermissionView} from '../../auth/permissions-helper';


export class GridsCrud {

  private STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');
  private privateSettings = coreServiceLocator.get('privateSettings');


  constructor(private dataCrudService: IDataCrud) {
  }

  async getGridsItemByAreaAndUrl(req: Request, area: string, url: string) {
    const query: IQueryParams = {
      query: {
        'general.area': area,
        'general.url': url,
        'general.published': 'Yes',
      },
    };

    const gridsItem = await this.dataCrudService.querySingleNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.grids.name, query);

    if (!gridsItem) {
      return null;
    }

    const isAllowed = await this.userHasReadPermissionForGrid(req, gridsItem);

    return isAllowed ? gridsItem : null;
  };

  async getGridsItemByAreaAndCollection(req: Request, area: string, collectionName: string) {
    const query: IQueryParams = {
      query: {
        'general.area': area,
        'general.collections': {$elemMatch: {$eq: collectionName}},
        'general.published': 'Yes',
      }
    };

    const gridList = await this.dataCrudService.queryAllAvailableNodes(
        req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.grids.name, query);

    if (gridList && gridList.length) {
      for (let grid of gridList) {
        if (grid.general.collections[0] === collectionName) {
          const isAllowed = await this.userHasReadPermissionForGrid(req, grid);

          if (isAllowed) {
            return grid;
          }
        }
      }
    }

    if (gridList && gridList.length) {
      for (let grid of gridList) {
        if (grid.general.collections[0] !== collectionName) {
          const isAllowed = await this.userHasReadPermissionForGrid(req, grid);

          if (isAllowed) {
            return grid;
          }
        }
      }
    }

    return null;
  }

  async getGridsItemById(req: Request, id: string) {
    const query: IQueryParams = {
      nodeId: id,
    };

    return this.dataCrudService.readNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.grids.name, query);
  };

  async createGridsItem(req: Request, data) {
    if (!data || !data.general) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    if (data.general.hasOwnProperty('order') && typeof data.general.order === 'string') {
      data.general.order = Number(data.general.order);
    }

    const title = this.prepareTitle(data);

    const nodeBody = {
      ...data,
      title,
    };

    return this.dataCrudService.createNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.grids.name, nodeBody);
  };

  async updateGridsItem(req: Request, data) {
    const gridId = _.get(data, '_doc');

    if (!gridId || !data) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const grid = await this.getGridsItemById(req, gridId);

    if (!grid) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const title = this.prepareTitle(data);

    return this.dataCrudService.mergeNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.grids.name, {
      ...data,
      title,
    });
  };

  async deleteGridsItem(req: Request, id: string) {
    if (!id) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const grid = await this.getGridsItemById(req, id);

    if (!grid) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    return this.dataCrudService.deleteNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.grids.name, grid);
  };

  async userHasReadPermissionForGrid(req: Request, grid): Promise<boolean> {
    return this.checkPermissionForGrid(req, grid, PermissionAction.read);
  }

  async userHasUpdatePermissionForGrid(req: Request, grid): Promise<boolean> {
    return this.checkPermissionForGrid(req, grid, PermissionAction.update);
  }

  async checkPermissionForGrid(req: Request, grid, action: PermissionAction): Promise<boolean> {
    const permission = _.get(grid, 'general.permission');

    if (!permission) {
      return this.privateSettings?.ignorePermissions || false;
    }

    const permissionPathList = permission.split('.');

    if (permissionPathList.length !== 2) {
      return false;
    }

    const name = permissionPathList[1];
    const view = PermissionView.list;

    const permissionsHelper = coreServiceLocator.get('permissionsHelper');
    return permissionsHelper.userHasPermissions(req, {name, action, view});
  }

  private prepareTitle(grid): string {
    const name = _.get(grid, 'general.name');
    const area = _.get(grid, 'general.area');

    if (!area) {
      return name;
    }

    return this.prepareArea(area) + ' Area ' + grid.general.name;
  }

  private prepareArea(area: string): string {
    switch (area) {
      case 'parentSupplier':
        return 'Parent Supplier';
      case 'non-login':
        return 'Non-Login';
      default:
        return area.charAt(0).toUpperCase() + area.slice(1);
    }
  }
}

