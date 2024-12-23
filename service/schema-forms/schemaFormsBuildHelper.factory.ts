import { schemaRelatorsFetchService, SchemaRelatorsFetchService } from './schemaRelatorsFetch.service';
import { SchemaParser, schemaParserFactory, SchemaParserFactory } from './schemaParser.factory';
import {BlockComponents} from './blockComponents';
import { groupBy } from '../utils';


export interface BlockDescription {
  blockComponent: BlockComponents;
  description: any;
}


export function getDescriptionBinding(description: any) {
  const joinSchema = description._relator || description.join;

  if (!joinSchema) {
    return [];
  }

  let bind = joinSchema['x-bind'] || joinSchema['bind'];

  const bindAllMappings = joinSchema['bind-all-mappings'] || joinSchema['bindAll'];

  if (bindAllMappings) {
    bind = joinSchema['mappings'];
  }

  if (bind && !Array.isArray(bind)) {
    bind = [bind];
  }

  if (!bind && joinSchema['mappings']) {
    bind = joinSchema['mappings'].filter((item: { bind: any; }) => item.bind);
  }

  return bind;
}


export class SchemaFormsBuildHelper {
  public waitPromises: Array<Promise<any>> = [];
  public relatorsBulkRequestParams: Array<any> = [];
  public internalContainers: Array<any> = [];

  private currentStructuresTagMap: {[path: string]: any} = {};
  // @ts-ignore
  private currentStructuresTagLevel: number;

  constructor(
      private schemaName: string,
      // private schemaPath: string,
      public schemaParser: SchemaParser,
      private schemaRelatorsFetchService: SchemaRelatorsFetchService,
      // private currentSupplier: CurrentSupplier
  ) {
  }

  clearPromisesList() {
    this.waitPromises = [];
  }

  clearRelatorsBulkRequestParams() {
    this.relatorsBulkRequestParams = [];
  }

  clearFormContainers() {
    this.internalContainers = [];
  }

  _addRelatorsToBulkRequest(path: string, resultObj: Object) {
    // if (this.schemaPath) {
    //   path = this.schemaPath + '.' + path;
    // }

    this.relatorsBulkRequestParams.push({'schema': this.schemaName, 'path': path, 'resultObj': resultObj});
  }

  async fetchRelatorChoicesInBulk(): Promise<any> {
    const groupedRelatorsBulkRequestParams = this._groupRelatorsBulkRequestParams();

    // const currentSupplierId = this.currentSupplier.getId();

    const requestParams: any[] = [];
    Object.keys(groupedRelatorsBulkRequestParams).forEach((key: string) => {
      const item: any = groupedRelatorsBulkRequestParams[key][0];

      requestParams.push({
        // supplier: currentSupplierId,
        path: item['path'],
        schema: item['schema']
      });
    });

    return this.schemaRelatorsFetchService.getRelatorChoiceInBulk(requestParams)
      .then((result: any) => {
          let index = 0;
          Object.keys(groupedRelatorsBulkRequestParams).forEach((key: string) => {
            const itemsList = groupedRelatorsBulkRequestParams[key];

            for (let i = 0; i < itemsList.length; ++i) {
              itemsList[i]['resultObj']['values'] = result[index];
            }

            index++;
          });
        });
  }

  _groupRelatorsBulkRequestParams(): any {
    return groupBy(this.relatorsBulkRequestParams, (item: any) => {
        const join = item['resultObj']['_relator'] ||  item['resultObj']['join'];
        const bind = getDescriptionBinding(item);

        const groupProperties = {
          'nodeType': join['nodeType'] || join['collection'],
          'select': join['x-select'] || join['select'],
          'bind': bind,
        };

        // @ts-ignore
        return JSON.stringify(groupProperties)['hashCode']();
      });
  }

  buildItemDescription(path: string, showTitle: boolean = true, readonly: boolean = false): any {
    const result: any = this.schemaParser.parseItem(path);

    const pathSplit = path.split('.');
    result['name'] = pathSplit[pathSplit.length - 1].replace('[]', '');
    result['path'] = path;

    if (readonly) {
      result['readonly'] = readonly;
    }

    if (this._isAbsolutelyRemovedFromForm(result)) {
      return;
    }

    if (result['isJoin']) {
      if (this._needAddToRelatorsBulkRequest(result)) {
        this._addRelatorsToBulkRequest(path, result);
      }
    }

    result['showTitle'] = showTitle;

    return result;
  }

  _needAddToRelatorsBulkRequest(description: any): boolean {
    if (!description) {
      return false;
    }

    const joinDescription = description._relator || description.join;

    if (!joinDescription) {
      return false;
    }

    const nodeType = joinDescription.node || joinDescription.collection;

    return nodeType !== 'media';
  }

  _isAbsolutelyRemovedFromForm(description: any): boolean {
    const xHideDescription = description['xHide'] || description['x-hide'];
    const xConcatenateDescription = description['xConcatenate'] || description['x-concatenate'];

    if (xHideDescription &&
        Object.keys(xHideDescription).length === 1 &&
        xHideDescription['match-type'] === true) {
      return true;
    }

    if (xHideDescription &&
        !xHideDescription['match-values'] &&
        xHideDescription['match-type'] === true &&
        xHideDescription['persist'] === true &&
        !xConcatenateDescription) {
      return true;
    }

    const newHideDescription = description.rawData?.hide;

    if (newHideDescription && newHideDescription.if === 'true') {
      const value = newHideDescription.value || newHideDescription?.then?.value;

      if (!value.persist) {
        return true;
      }
    }

    const newIfDescription = description.rawData?.if;

    if (newIfDescription === 'true') {
      const value = description.rawData.value || description.rawData.then ||
        description.rawData?.then?.value;

      if (value.hide && !value.persist) {
        return true;
      }
    }

    return false;
  }

  buildHeaderDescription(path: string, seeItems: boolean = false): any {
    const result: any = this.schemaParser.parseItemHeader(path, seeItems);
    const pathSplit = path.split('.');
    result['name'] = pathSplit[pathSplit.length - 1].replace('[]', '');
    result['path'] = path;

    return result;
  };

  autodetectBlockComponent(path: string): BlockComponents|null {
    const item = this.schemaParser.getItem(path);

    if (item.type === 'container') {
      return BlockComponents.container;
    }

    if (item.type === '/container') {
      return BlockComponents.containerEnd;
    }

    if (!item) {
      return null;
    }

    if (item.type === 'object') {
      if (item.component === 'map') {
        return BlockComponents.map;
      }

      if (item.component) {
        return BlockComponents.value;
      }

      if (item._relator || item.join) {
        return BlockComponents.value;
      } else if (!item.properties || !Object.keys(item.properties).length) {
        return BlockComponents.value;
      } else {
        return BlockComponents.object;
      }
    } else if (item.type === 'array') {
      const component = item.component || this.schemaParser.parseItemComponent(item);

      if (component === 'SelectOrUpload') {
        return BlockComponents.selectOrUploadArray;
      }

      if (['MultiSelect', 'Listbox', 'Chips'].includes(component)) {
        return BlockComponents.value;
      }

      if (item.items.type === 'object') {
        if (item.items._relator || item.items.join) {
          return BlockComponents.arrayOfValues;
        } else if (!item.items.properties || !Object.keys(item.items.properties).length) {
          return BlockComponents.arrayOfValues;
        }
        return BlockComponents.arrayOfObjects;
      } else if (item.items.type === 'array') {
        return null;
      } else {
        if (item.items.enum) {
          return BlockComponents.value;
        } else {
          return BlockComponents.arrayOfValues;
        }
      }
    } else {
      return BlockComponents.value;
    }
  }

  generateField(path: string, showTitles: boolean = true, readonly: boolean = false): BlockDescription|null {
    const blockComponent = this.autodetectBlockComponent(path) as BlockComponents;

    const item = this.schemaParser.getItem(path);

    let preparedPath = path;

    if (item.type === 'array') {
      preparedPath += '[]';
    }

    const description = this.buildItemDescription(preparedPath, showTitles, readonly);

    if (!description) {
      return null;
    }

    const result = {blockComponent: blockComponent, description};

    if (BlockComponents.container === blockComponent) {
      result['description']['header'] = this.buildHeaderDescription(preparedPath);
      result['description']['isContainer'] = true;
      result['description']['content'] = [];
      this.internalContainers.push(result);

      return null;
    }

    if (BlockComponents.containerEnd === blockComponent) {
      return this.internalContainers.pop() || null;
    }

    if ([BlockComponents.object, BlockComponents.arrayOfObjects,
      BlockComponents.arrayOfImages, BlockComponents.arrayOfVideo].includes(blockComponent)) {

      const children = this.schemaParser.getItemChildren(path);

      result['description']['header'] = this.buildHeaderDescription(preparedPath);
      result['description']['content'] = [];

      for (const childName of Object.getOwnPropertyNames(children)) {
        const field = this.generateField(preparedPath + '.' + childName, showTitles, readonly);

        if (field) {
          result['description']['content'].push(field);
        }
      }
    }

    if (this.internalContainers.length) {
      const internalContainer = this.internalContainers[this.internalContainers.length - 1];
      internalContainer['description']['content'].push(result);
    } else {
      return result;
    }

    return null;
  }

  async buildFormDescription(showTitles: boolean = true, readonly: boolean = false): Promise<any> {
    this.clearPromisesList();
    this.clearRelatorsBulkRequestParams();
    this.clearFormContainers()

    const children = this.schemaParser.getItemChildren('');

    const description = {
      header: {},
      noHeaderDisplay: true,
      content: []
    };

    let containerField: any = null;

    for (const childName of Object.getOwnPropertyNames(children)) {
      const item = this.schemaParser.getItem(childName);

      if (item.type === BlockComponents.container) {
        const description = this.buildItemDescription(childName, showTitles, readonly);

        if (!description) {
          return null;
        }

        const result = {blockComponent: BlockComponents.container, description};
        result['description']['header'] = this.buildHeaderDescription(childName);
        result['description']['isContainer'] = true;
        result['description']['content'] = [];
        containerField = result;
      } else if (item.type === BlockComponents.containerEnd) {
        description.content.push(containerField);
        containerField = null;
      } else {
        const field = this.generateField(childName, showTitles, readonly);

        if (!field) {
          continue;
        }

        if (containerField) {
          containerField['description']['content'].push(field);
        } else {
          // @ts-ignore
          description.content.push(field);
        }
      }
    }

    const promise = this.fetchRelatorChoicesInBulk();
    this.waitPromises.push(promise);

    await Promise.all(this.waitPromises)
    return description;
  }

  buildEmptyModel(path: string = ''): any {
    let result: any;

    const item = this.schemaParser.getItem(path);
    if (!item) {
      return;
    }

    if (item.type === 'object') {
      result = {};
      const children = this.schemaParser.getItemChildren(path);

      if (children) {
        for (const childName of Object.getOwnPropertyNames(children)) {
          if ([BlockComponents.container, BlockComponents.containerEnd].includes(children[childName].type)) {
            continue;
          }

          let defaultValue = undefined;

          const subItem = this.schemaParser.getItem(path);
          if (subItem) {
            if (subItem.type === 'object') {
              defaultValue = this.buildEmptyModel(path ? (path + '.' + childName) : childName);
            }
          }

          result[childName] = defaultValue;
        }
      }
    }

    return result;
  }
}


export class SchemaFormsBuildHelperFactory {

  constructor(
    private schemaParserFactory: SchemaParserFactory,
    private schemaRelatorsFetchService: SchemaRelatorsFetchService,
    // private currentSupplier: CurrentSupplier
  ) {
  }

  getInstance(schemaName: string, schemaJson: Object, fields?: Object): SchemaFormsBuildHelper {

    if (fields && Object.keys(fields).length && schemaJson) {
      const shouldHideAbsentFields = fields[Object.keys(fields)[0]] === 1;

      for (const propertyName in schemaJson['properties']) {
        if (shouldHideAbsentFields) {
          if (!(propertyName in fields)) {
            // hide
            schemaJson['properties'][propertyName]["hide"] = true;

            if (!("persist" in schemaJson['properties'][propertyName])) {
              schemaJson['properties'][propertyName]["persist"] = true;
            }
          }
        } else {
          if (propertyName in fields) {
            // hide
            schemaJson['properties'][propertyName]["hide"] = true;

            if (!("persist" in schemaJson['properties'][propertyName])) {
              schemaJson['properties'][propertyName]["persist"] = true;
            }
          }
        }
      }
    }

    return new SchemaFormsBuildHelper(schemaName, this.schemaParserFactory.getInstance(schemaJson),
      this.schemaRelatorsFetchService);
  }
}


export const schemaFormsBuildHelperFactory = new SchemaFormsBuildHelperFactory(schemaParserFactory,
  schemaRelatorsFetchService);
