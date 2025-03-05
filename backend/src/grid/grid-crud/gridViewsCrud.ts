import * as _ from 'lodash';
import * as BBPromise from 'bluebird';
import {coreServiceLocator} from '../../serviceLocator';
import { IDataCrud, IQueryParams } from '../../db';
import {ERROR_REASON} from '../../const';
import { GridsCrud } from './gridsCrud';


export class GridViewsCrud {

  private STANDARD_COLLECTIONS_DESCRIPTION = coreServiceLocator.get('STANDARD_COLLECTIONS_DESCRIPTION');

  constructor(private dataCrudService: IDataCrud, private gridsCrud: GridsCrud) {
  }

  async create(req: Request, data): Promise<any> {
    if (!data || !data.name || !data.grid || !data.view) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const general: any = {
      name: data.name,
    };

    if (data.gridsItemId) {
      general.grid = {
        id: data.gridsItemId,
        name: data.grid,
      };
    } else {
      general.grid = {
        name: data.grid,
      };
    }

    if (data.definitionId) {
      general.definition = {
        id: data.definitionId,
        url: data.gridUrl,
      };
    }

    general.roles = data.roles || [];

    if (data.filters) {
      general.filters = data.filters;
    }

    general.view = data.view;

    const gridView = {
      title: data.name + ' (' + data.grid + ')',
      general,
    };

    const isAllowed = await this.checkEditViewPermission(req, gridView);

    if (!isAllowed) {
      return BBPromise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
    }

    return this.dataCrudService.createNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.gridViews.name, gridView);
  }

  async update(req: Request, data): Promise<any> {
    if (!data || !data._doc || !data.name || !data.view) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const gridView = await this.getGridViewById(req, data._doc);

    const isAllowed = await this.checkEditViewPermission(req, gridView);

    if (!isAllowed) {
      return BBPromise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
    }

    gridView.general.roles = data.roles || [];

    if (data.filters) {
      gridView.general.filters = data.filters;
    } else if (gridView.general.filters) {
      delete gridView.general.filters;
    }

    gridView.general.view = data.view;

    const nodeBody: any = {
      _doc: data._doc,
      general: gridView.general,
    };

    if (nodeBody.general.name !== data.name) {
      nodeBody.general.name = data.name;
      nodeBody.title = `${data.name} (${nodeBody.general.grid.name})`;
    }

    return this.dataCrudService.mergeNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.gridViews.name, nodeBody);
  }

  async delete(req: Request, id: string): Promise<any> {
    if (!id) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const gridView = await this.getGridViewById(req, id);

    const isAllowed = await this.checkEditViewPermission(req, gridView);

    if (!isAllowed) {
      return BBPromise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
    }

    return this.dataCrudService.deleteNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.gridViews.name, {nodeId: gridView._doc});
  }

  async getGridViewById(req: Request, id: string): Promise<any> {
    const query: IQueryParams = {
      nodeId: id,
    };

    return this.dataCrudService.readNode(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.gridViews.name, query);
  }

  async getGridViewListByGridsItem(req: Request, gridId: string): Promise<any[]> {
    if (!gridId) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const grid = await this.gridsCrud.getGridsItemById(req, gridId);

    const isAllowed = await this.gridsCrud.userHasReadPermissionForGrid(req, grid);

    if (!isAllowed) {
      return BBPromise.reject({reason: ERROR_REASON.genericAuthError, message: 'Not allowed'});
    }

    const query: IQueryParams = {
      query: {'general.grid.id': gridId},
    };

    return this.getGridViewList(req, query);
  }

  async getGridViewListByDefinition(req: Request, definitionId: string, gridUrl: string): Promise<any[]> {
    if (!definitionId || !gridUrl) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const query: IQueryParams = {
      query: {
        'general.definition.id': definitionId,
        'general.definition.url': gridUrl,
      },
    };

    return this.getGridViewList(req, query);
  }

  private async getGridViewList(req: Request, query): Promise<any[]> {
    const gridViewList = await this.dataCrudService.queryAllAvailableNodes(req,
        this.STANDARD_COLLECTIONS_DESCRIPTION.gridViews.name, query);

    if (!gridViewList?.length) {
      return [];
    }

    const userHelper = coreServiceLocator.get('userHelper');
    const user = userHelper.getCurrentUserSync(req);

    const roleManagement = coreServiceLocator.get('roleManagement');
    const userRoleList = await roleManagement.getUserOwnRoles(req, user);
    const userRoleIdList = userRoleList.map(item => item._doc);

    return _.chain(gridViewList)
      .filter(gridView => {
        const roles = gridView.general.roles;

        if (!roles?.length) {
          return true;
        }

        const roleIdList = roles.map(item => item.id);

        return _.intersection(userRoleIdList, roleIdList).length > 0;
      })
      .map(item => ({_doc: item._doc, ...item.general}))
      .sortBy('title').value();
  }

  private async checkEditViewPermission(req: Request, gridView: any): Promise<any> {
    if (!gridView) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Bad parameters'});
    }

    const definitionId = gridView.general?.definition?.id;
    const gridId = gridView.general?.grid?.id;

    if (!gridId && !definitionId) {
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message: 'Grid not found'});
    }

    if (gridId) {
      const grid = await this.gridsCrud.getGridsItemById(req, gridId);

      if (!grid) {
        return BBPromise.reject({reason: ERROR_REASON.invalidData, message: `Grid ${gridId} not found`});
      }

      return this.gridsCrud.userHasUpdatePermissionForGrid(req, grid);
    }

    return true;
  }
}

