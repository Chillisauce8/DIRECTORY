import * as BBPromise from 'bluebird';
import {GridCrud} from './gridCrud';
import {ERROR_REASON} from '../../const';
import { DefinitionCrud, IDataCrud } from '../../db';
import { RequestHelper } from '../../utils';


export interface GridByDefinitionConfig {
  definitionId: string;
  gridUrl: string;
}


export class GridByDefinitionCrud extends GridCrud {

  constructor(dataCrudService: IDataCrud, requestHelper: RequestHelper,
              private definitionCrud: DefinitionCrud) {
    super(dataCrudService, requestHelper);
  }

  async getDataList(req: Request, gridConfig: GridByDefinitionConfig): Promise<any[]> {
    const collectionName = await this.getCollectionName(req, gridConfig.definitionId);
    return this.queryData(req, collectionName);
  }

  private async getCollectionName(req: Request, definitionId: string): Promise<string> {
    const definition = await this.definitionCrud.getDefinitionById(req, definitionId);

    if (!definition) {
      const message = `Definition ${definitionId} not found`;
      return BBPromise.reject({reason: ERROR_REASON.invalidData, message});
    }

    return definition.name;
  }
}

