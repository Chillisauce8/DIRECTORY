import {MongoCrudClient} from './mongo/client';
import type { ICrudBaseOptions } from './data-crud.interface';



export class CollectionCrud {

    constructor(private mongoCrudHelper: MongoCrudClient) {
        //
    }

    public async hasCollection(req: Request, collectionName: string,
                               options?: ICrudBaseOptions): Promise<any> {
        return this.mongoCrudHelper.hasCollection(collectionName);
    }

    public async createCollection(req: Request, collectionName: string, additionalParams: any = {},
                                  options?: ICrudBaseOptions): Promise<any> {
        return this.mongoCrudHelper.createCollection(collectionName, additionalParams);
    }

    public async dropCollection(req: Request, collectionName: string,
                                options?: ICrudBaseOptions): Promise<any> {
        await this.mongoCrudHelper.deleteCollection(collectionName);
        await this.mongoCrudHelper.deleteCollection(collectionName + ':diff');
    }

    public async renameCollection(req: Request, collectionName: string,
                                  newCollectionName: string, options?: ICrudBaseOptions): Promise<any> {
        await this.mongoCrudHelper.renameCollection(collectionName, newCollectionName);
        await this.mongoCrudHelper.renameCollection(collectionName + ':diff',
          newCollectionName + ':diff');
    }

    public async updateValidator(req: Request, collectionName, validator: any,
                                 commandAdditionalParams?: Object,
                                 options?: ICrudBaseOptions) {
        return this.mongoCrudHelper.updateCollectionValidator(collectionName,
            validator, commandAdditionalParams);
    }
}
