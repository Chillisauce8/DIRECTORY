import {ObjectId} from 'mongodb';
import * as _ from 'lodash';

class DataTypes {
  static object: string = 'object';
}

export class NodeSystemDataHelper {

  getUniqueID() {
    return new ObjectId().toHexString();
  }

  public getNodeWithoutSystemFields(node: any) {
    if (!node) {
        return;
    }

    let clearedNode = _.clone(node);

    const systemFieldList = ['_id', '_type', '_qname', '_features', '_system'];

    systemFieldList.forEach(field => delete clearedNode[field]);

    return clearedNode;
  }

  public deleteUndefinedProperties(obj: any, recurse: boolean = true) {

    if (_.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
          if (_.isUndefined(obj[i])) {
              obj.splice(i, 1);
              i--;
          }
      }
    }

    for (let i in obj) {
      if (_.isUndefined(obj[i])) {
          delete obj[i];
      } else if (recurse && _.isObject(obj[i])) {
          this.deleteUndefinedProperties(obj[i], recurse);
      }
    }
  }

  public deleteNullProperties(obj: any, recurse: boolean = true) {
      if (_.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
              if (_.isNull(obj[i])) {
                  obj.splice(i, 1);
                  i--;
              }
          }
      }

      for (let i in obj) {
          if (_.isNull(obj[i])) {
              delete obj[i];
          } else if (recurse && _.isObject(obj[i])) {
              this.deleteNullProperties(obj[i], recurse);
          }
      }
  }
}

const inst = new NodeSystemDataHelper();

export {inst as nodeSystemDataHelper};
