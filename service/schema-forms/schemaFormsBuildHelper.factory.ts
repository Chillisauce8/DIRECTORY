import { schemaRelatorsFetchService, SchemaRelatorsFetchService } from './schemaRelatorsFetch.service';
import { SchemaParser, schemaParserFactory, SchemaParserFactory } from './schemaParser.factory';
import {SchemaFormElementTypes} from './schemaFormElementTypes';
import { groupBy, isUndefined } from '../utils';


export interface ISchemaFormField {
  formDirective: SchemaFormElementTypes;
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
  public relatorsBulkRequestParams: Array<Object> = [];

  private currentStructuresTagMap: {[path: string]: any} = {};
  // @ts-ignore
  private currentStructuresTagLevel: number;

  constructor(
      private schemaName: string,
      private schemaPath: string,
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

  _addRelatorsToBulkRequest(path: string, resultObj: Object) {
    if (this.schemaPath) {
      path = this.schemaPath + '.' + path;
    }

    this.relatorsBulkRequestParams.push({'schema': this.schemaName, 'path': path, 'resultObj': resultObj});
  }

  async _fetchRelatorChoicesInBulk(): Promise<any> {
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

    // return {...result, showTitle: showTitle};
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

  autodetectDirectiveType(path: string): SchemaFormElementTypes|null {
    const item = this.schemaParser.getItem(path);

    if (SchemaParser.isStructureTag(path)) {
      return SchemaFormElementTypes.structureTag;
    }

    if (!item) {
      return null;
    }

    let fieldType = item['x-fieldtype'] || item['fieldType'];

    if (!fieldType && item.component) {
      if (['MultiSelect', 'Listbox', 'Chips'].includes(item.component)) {
        fieldType = 'multiselect';
      }
    }

    if (item.type === 'object') {
      if (fieldType === 'map') {
        return SchemaFormElementTypes.mapPlaceField;
      }

      if (item.component) {
        return SchemaFormElementTypes.valueField;
      }

      if (item._relator || item.join) {
        return SchemaFormElementTypes.valueField;
      } else if (!item.properties || !Object.keys(item.properties).length) {
        return SchemaFormElementTypes.valueField;
      } else {
        return SchemaFormElementTypes.objectField;
      }
    } else if (item.type === 'array') {
      if (fieldType === 'chips') {
        return SchemaFormElementTypes.valueField;
      }

      if (fieldType === 'multiselect') {
        return SchemaFormElementTypes.valueField;
      }

      if (fieldType === 'imageslist') {
        return SchemaFormElementTypes.arrayOfImagesField;
      }

      if (fieldType === 'videolist') {
        return SchemaFormElementTypes.arrayOfVideoField;
      }

      if (item.items.type === 'object') {
        if (item.items._relator || item.items.join) {
          return SchemaFormElementTypes.arrayOfValuesField;
        } else if (!item.items.properties || !Object.keys(item.items.properties).length) {
          return SchemaFormElementTypes.arrayOfValuesField;
        }
        return SchemaFormElementTypes.arrayOfObjectsField;
      } else if (item.items.type === 'array') {
        return null;
      } else {
        if (item.items.enum) {
          return SchemaFormElementTypes.valueField;
        } else {
          return SchemaFormElementTypes.arrayOfValuesField;
        }
      }
    } else {
      return SchemaFormElementTypes.valueField;
    }
  }

  generateField(path: string, showTitles: boolean = true, readonly: boolean = false): ISchemaFormField|null {
    const formElementType = this.autodetectDirectiveType(path) as SchemaFormElementTypes;

    const item = this.schemaParser.getItem(path);

    let preparedPath = path;

    if (item.type === 'array') {
      preparedPath += '[]';
    }

    const description = this.buildItemDescription(preparedPath, showTitles, readonly);

    if (!description) {
      return null;
    }

    const result = {formDirective: formElementType, description};

    if ([SchemaFormElementTypes.objectField, SchemaFormElementTypes.arrayOfObjectsField,
      SchemaFormElementTypes.arrayOfImagesField, SchemaFormElementTypes.arrayOfVideoField,
      SchemaFormElementTypes.structureTag].includes(formElementType)) {

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

    return result;
  }

  isStructureTag(path: string): boolean {
    return SchemaParser.isStructureTag(path);
  }

  getStructureFieldLevel(field: ISchemaFormField): number {
    const match = field.description['name'].match(/^(\d)+_.+/);
    return match && parseInt(match[1], 10);
  }

  buildGroupDescription(name: string, showTitles: boolean = true, readonly: boolean = false) {
    const item = this.schemaParser.getItem(name);

    const path = name + (item.type === 'array' ? '[]' : '');

    const result: any = {
      header: this.buildHeaderDescription(path),
      content: [],
      fakeObject: false,
    };

    const isStructureTag = this.isStructureTag(name);

    const fieldType = item['x-fieldtype'] || item['fieldType'];

    if (result.header['type'] === 'object' && !fieldType && !isStructureTag && !result.header['component']) {
      if (this._isAbsolutelyRemovedFromForm(item)) {
        return null;
      }

      const children = this.schemaParser.getItemChildren(name);
      for (const childName of Object.getOwnPropertyNames(children)) {
        const field = this.generateField(name + '.' + childName, showTitles, readonly);

        if (!field || !field['description']) {
          continue;
        }

        result.content.push(field);
      }
    } else {
      const field = this.generateField(name, showTitles, readonly);

      if (field) {
        const parentPath = name.split('.').slice(0, -1).join('.');

        if (field.formDirective === SchemaFormElementTypes.structureTag) {
          result.fakeObject = true;
          result.header['type'] = 'object';

          const structureLevel = this.getStructureFieldLevel(field);
          this.currentStructuresTagMap[parentPath + '_' + structureLevel] = result;

          if (!isUndefined(this.currentStructuresTagLevel)) {
            const resultToObjectField = {
              formDirective: SchemaFormElementTypes.objectField,
              description: {
                header: result.header,
                content: result.content,
                type: 'object',
                name: result.header['name'],
                path: result.header['path'],
                title: result.header['title'],
                required: result.header['required'],
                xHide: result.header['xHide'],
              }
            };

            if (structureLevel > this.currentStructuresTagLevel) {
              const parentLevelMapKey = parentPath + '_' + this.currentStructuresTagLevel;
              this.currentStructuresTagMap[parentLevelMapKey].content.push(resultToObjectField);

              this.currentStructuresTagLevel = structureLevel;
              return null;
            } else if (structureLevel < this.currentStructuresTagLevel) {
              const parentLevelMapKey = parentPath + '_' + (structureLevel - 1);
              this.currentStructuresTagMap[parentLevelMapKey].content.push(resultToObjectField);

              this.currentStructuresTagLevel = structureLevel;
              return null;
            }
          }

          this.currentStructuresTagLevel = structureLevel;

        } else {
          const mapKey = parentPath + '_' + this.currentStructuresTagLevel;

          if (this.currentStructuresTagMap[mapKey]) {
            field.description['structureTagDescription'] = !!this.currentStructuresTagMap[mapKey];
            this.currentStructuresTagMap[mapKey].content.push(field);

            return null;
          }

          result.content.push(field);
        }
      }
    }

    return result;
  }

  async buildFormDescription(useOneGroup: boolean = false, showTitles: boolean = true, readonly: boolean = false): Promise<any> {
    this.clearPromisesList();
    this.clearRelatorsBulkRequestParams();

    const result: any[] = [];
    const children = this.schemaParser.getItemChildren('');

    if (useOneGroup) {
      const oneGroupDescription = {
        header: {},
        noHeaderDisplay: true,
        content: []
      };

      for (const childName of Object.getOwnPropertyNames(children)) {
        const field = this.generateField(childName, showTitles, readonly);

        if (field) {
          // @ts-ignore
          oneGroupDescription.content.push(field);
        }
      }

      result.push(oneGroupDescription);

    } else {
      for (const childName of Object.getOwnPropertyNames(children)) {
        const description = this.buildGroupDescription(childName, showTitles, readonly);

        if (description) {
          result.push(description);
        }
      }
    }

    if (readonly) {

    }

    const promise = this._fetchRelatorChoicesInBulk();
    this.waitPromises.push(promise);

    await Promise.all(this.waitPromises)
    return result;
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

  getInstance(schemaName: string, schemaJson: Object, schemaPath?: string): SchemaFormsBuildHelper {

    if (schemaPath) {
      const chilliSchemaParser = new SchemaParser(schemaJson);
      schemaJson = chilliSchemaParser.getItem(schemaPath);
    }

    return new SchemaFormsBuildHelper(schemaName, schemaPath as string, this.schemaParserFactory.getInstance(schemaJson),
      this.schemaRelatorsFetchService);
  }
}


export const schemaFormsBuildHelperFactory = new SchemaFormsBuildHelperFactory(schemaParserFactory,
  schemaRelatorsFetchService);
