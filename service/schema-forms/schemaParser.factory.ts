import { isString } from '~/service/utils';

export const X_KEYS = ['hide', 'required', 'default', 'readOnly', 'writeOnly', 'title', 'description', 'default',
  'enum', 'x-enum', 'options', 'optionsPlus', 'set', 'dependencies', 'depreciated', 'concatenate', 'calculate'];

export const X_KEYS_OPERATORS = ['if', 'then', 'else', 'switch', 'cases', 'value'];

export const DEFAULT_FALSE_X_KEYS = ['hide', 'required', 'readOnly', 'writeOnly', 'depreciated'];
export const UNDEFINED_MATTERS_X_KEYS = ['set'];

export const ADDITIONAL_RAW_DATA_FIELDS = ['definition', 'showBrackets', 'errorMessage', 'selection', 'filter'];

export class PathTreeNode {
  public children?: PathTreeNode[] = [];

  constructor(public name?: string, public additionalFields?: Object) {
    if (!this.additionalFields) {
      this.additionalFields = {};
    }
  }
}


export class SchemaParser {

  constructor(private schemaJson: any) {
    //
  }

  isMultiGroupSchema(): boolean {
    return !!this.schemaJson.useMultiGroups;
  }

  parseItem(path: string): Object {
    const item = this.getItem(path);

    const properties = this.getItemProperties(item);

    const result: any = item.props || {};

    // result['formType'] = this.parseItemFormType(properties);

    result['component'] = this.parseItemComponent(item, properties);

    result['class'] = properties.class;

    result['title'] = properties.title || item.title;
    result['required'] = properties.required || item.required;
    result['readonly'] = properties.readonly || item.readonly;
    result['default'] = properties['default'] || item['default'];
    result['type'] = item['type'] || properties['type'];

    result['xHide'] = properties['x-hide'] || item['x-hide'];
    result['xRequired'] = properties['x-required'] || item['x-required'];
    result['xFilter'] = properties['x-filter'] || item['x-filter'];
    result['xEnum'] = properties['x-enum'] || item['x-enum'];
    result['xDefault'] = properties['x-default'] || item['x-default'];
    result['xSet'] = properties['x-set'] || item['x-set'];
    result['xTitle'] = properties['x-title'] || item['x-title'];
    result['xCalculate'] = properties['x-calculate'] || item['x-calculate'];
    result['xConcatenate'] = properties['x-concatenate'] || item['x-concatenate'];
    result['xReadonly'] = properties['x-readonly'] || item['x-readonly'];
    result['xMinimum'] = properties['x-minimum'] || item['x-minimum'];
    result['xMaximum'] = properties['x-maximum'] || item['x-maximum'];
    result['xMaximum'] = properties['x-maximum'] || item['x-maximum'];
    result['xMinItems'] = properties['x-minItems'] || item['x-minItems'] ||
      properties['minItems'] || item['minItems'];

    result['xMaxItems'] = properties['x-maxItems'] || item['x-maxItems'] ||
      properties['maxItems'] || item['maxItems'];

    result['xUniqueItems'] = properties['uniqueItems'] || item['uniqueItems'];

    result['minimumDate'] = properties['minimum-date'] || item['minimum-date'];
    result['maximumDate'] = properties['maximum-date'] || item['maximum-date'];

    result['xClose'] = properties['x-close'] || item['x-close'];

    result['xFieldType'] = properties['x-fieldtype'];
    result['xLine'] = item['x-line'] || item['line'];

    result['xStep'] = properties['x-step'] || properties['multipleOf'];
    result['xFlex'] = properties['x-flex'] || properties['flex'];

    result['xRequireMatch'] = properties['x-require-match'] || properties['requireMatch'];

    result['xLimitTo'] = item['x-limitTo'] || item['optionsLimit'];
    result['xUpload'] = item['x-upload'];

    result['xGrid'] = item['x-grid'];

    if ('pattern' in properties) {
      result['pattern'] = properties.pattern;
    }

    if ('maximum' in properties) {
      result['maximum'] = properties.maximum;
    }

    if ('minimum' in properties) {
      result['minimum'] = properties.minimum;
    }

    if ('maxLength' in properties) {
      result['maxLength'] = properties.maxLength;
    }

    if ('minLength' in properties) {
      result['minLength'] = properties.minLength;
    }

    const joinDefinition = item['_relator'] || properties['_relator'] || item['join'] || properties['join'];
    if (joinDefinition) {
      result['isRelator'] = true;
      result['isJoin'] = true;
      result['_relator'] = joinDefinition;
      result['join'] = joinDefinition;
    }

    if ('enum' in properties) {
      result['values'] = properties.enum;
    }

    if ('options' in properties) {
      result['values'] = properties.options;
    }

    if (properties.description) {
      result['description'] = properties.description;
    }

    if (properties.typesAllowed) {
      result['typesAllowed'] = properties.typesAllowed;
    }

    if (properties.changeOperators) {
      result['changeOperators'] = properties.changeOperators;
    }

    this.parseSelectionFeature(path, item);

    result['rawData'] = this.parseRawData(properties, item);

    return result;
  }

  parseItemHeader(path: string, seeItems: boolean = false): Object {
    const result: any = {};

    const item = this.getItem(path);
    let itemItems;

    if (seeItems && item.items) {
      itemItems = item.items;
    }

    result['title'] = itemItems && itemItems.title ? itemItems.title : item.title;
    result['type'] = item.type;
    result['description'] = item.description;
    result['component'] = item.component;
    result['required'] = item.required;
    result['xHide'] = item['x-hide'];
    result['xClose'] = item['x-close'];

    result['rawData'] = this.parseRawData({}, item);

    return result;
  }

  getItem(path: string) {
    if (!path) {
      return this.schemaJson;
    }

    let res = this.schemaJson['properties'];

    let xReadonly = this._getPropertyFromItem(this.schemaJson, 'x-readonly');
    let xRequired = this._getPropertyFromItem(this.schemaJson, 'x-required');
    let required = this._getPropertyFromItem(this.schemaJson, 'required');

    const pathArray = path.split('.');

    let i = 0;
    for (; i < pathArray.length - 1; ++i) {
      const pathStep = pathArray[i].replace('[]', '');
      res = res[pathStep];

      xReadonly = this._getPropertyFromItem(res, 'x-readonly') || xReadonly;
      xRequired = this._getPropertyFromItem(res, 'x-required') || xRequired;
      required = this._getPropertyFromItem(res, 'required') || required;

      if (res.type === 'array') {
        res = {...res.items, title: res.title};
      }

      if ('properties' in res) {
        res = res.properties;
      }
    }

    const pathLastItem = pathArray[i].replace('[]', '');
    res = res[pathLastItem];

    if (!res['x-readonly']) {
      res['x-readonly'] = xReadonly;
    }

    if (!res['x-required']) {
      res['x-required'] = xRequired;
    }

    const lastKey = pathArray[pathArray.length - 1];
    if (!res['required'] && !res['x-required'] && Array.isArray(required) && required.indexOf(lastKey) !== -1) {
      res['required'] = true;
    }

    return res;
  }

  getItemChildren(path: string): Object {
    const item = this.getItem(path);

    if (!item) {
      return {};
    }

    if ('properties' in item) {
      return item.properties;
    } else if ('items' in item) {
      return item.items.properties || {};
    } else {
      return {};
    }
  }

  getAllPaths(): Array<string> {
    const properties = this.schemaJson['properties'];
    return this._getAllPaths('', properties);
  }

  getAllPathTree(fields?: string[], showBrackets = true): PathTreeNode[] {
    const properties = this.schemaJson['properties'];
    return this._getAllPathTree(properties, fields, showBrackets);
  }

  parseItemComponent(item: any, properties?: any): string {
    // const fieldType = item['x-fieldtype'] || item['fieldType'];

    if (properties?.component) {
      return properties.component;
    }

    if (item.type === 'number') {
      if ('enum' in item) {
        return 'Select';
      }

      return 'InputNumber';
    }

    if ((item['_relator'] || item['join']) && !item['component']) {
      return 'AutoComplete';
    }

    if (item.type === 'string') {
      if (item.format === 'date') {
        return 'DatePicker';
      }

      if (item.format === 'time') {
        return 'DatePicker';
      }

      if (item.format === 'datetime') {
        return 'InputText';
      }

      if (item.format === 'date-time') {
        return 'InputText';
      }

      if (item.format === 'time24') {
        return 'DatePicker';
      }

      if (item.format === 'url') {
        return 'InputText';
      }

      if (item.format === 'uri') {
        return 'InputText';
      }

      if (item.format === 'email') {
        return 'InputText';
      }

      // if (item.format === 'treePath') {
      //   return 'treePath';
      // }

      if ('enum' in item) {
        return 'Select';
      }

      if ('options' in item) {
        return 'Select';
      }

      return 'InputText';
    }

    if (item.type === 'boolean') {
      return 'ToggleSwitch';
    }

    if (item.type === 'array') {
      if (!!item.items && 'enum' in item.items) {
        return 'MultiSelect';
      }

      if (item.items && item.items.type === 'string') {
        return 'InputChips';
      }

      if ((item.items && '_relator' in item.items) ||
        '_relator' in item ||
        (item.items && 'join' in item.items) ||
        'join' in item
      ) {
        return 'Select';
      } else if (item.items) {
        return this.parseItemComponent(item.items);
      }
    }

    if (item.type === 'object') {
      if (('_relator' in item) || ('join' in item)) {
        return 'Select';
      }
    }

    return 'InputText';
  }

  parseSelectionFeature(path: string, item: any) {
    if (item.type === 'array') {
      if (!!item.selection && item.items && item.items.type === 'object') {
        const propertiesNames = Object.keys(item.items.properties);
        propertiesNames.forEach(propertiesName => {
          if (item.selection.includes(propertiesName)) {
            const clearedPath = path.replace('[]', '');
            const pathSplit = clearedPath.split('.');
            const fieldName = pathSplit[pathSplit.length - 1];

            item.items.properties[propertiesName]['let show'] =
              `Array.isArray(this.${clearedPath}[this.indexes.${fieldName}].show) ?
              this.${clearedPath}[this.indexes.${fieldName}].show[0] : this.${clearedPath}[this.indexes.${fieldName}].show`;

            item.items.properties[propertiesName]['hide'] = {
              if: `this.show !== '${propertiesName}'`,
              value: true
            }
          }
        });

        item.items.properties['show'] = {
          type: 'string',
          title: 'Selection Types',
          enum: item.selection,
          readonly: true,
        };
      }
    }
  }

  private parseRawData(properties: any, item: any) {
    const result: any = {};

    for (const key of X_KEYS) {
      let rawData;

      if (key in properties) {
        rawData = properties[key];
      } else if (key in item) {
        rawData = item[key];
      }

      if (!rawData) {
        continue;
      }

      // temporary thing for old definitions
      // if (rawData['match-key'] || rawData?.[0]?.['match-key'] ||
      //   rawData['match-type'] || rawData?.[0]?.['match-type']) {
      //   continue;
      // }

      result[key] = rawData;
    }

    for (const key of X_KEYS_OPERATORS) {
      if (key in properties) {
        result[key] = properties[key];
      } else if (key in item) {
        result[key] = item[key];
      }
    }

    for (const key of ADDITIONAL_RAW_DATA_FIELDS) {
      if (key in properties) {
        result[key] = properties[key];
      } else if (key in item) {
        result[key] = item[key];
      }
    }

    for (const key in properties) {
      if (key.startsWith('let')) {
        result[key] = properties[key];
      }
    }

    for (const key in item) {
      if (key.startsWith('let')) {
        result[key] = item[key];
      }
    }

    return result;
  }

  private _getPropertyFromItem(item: any, propertyName: string) {
    if ('properties' in item && item['properties'][propertyName]) {
      return item['properties'][propertyName];
    }

    if (item['type'] === 'array' && 'items' in item && item['items'][propertyName]) {
      return item['items'][propertyName];
    }

    if (item[propertyName]) {
      return item[propertyName];
    }

    return undefined;
  }

  private getItemProperties(item: any) {
    let properties;
    if ('properties' in item) {
      properties = {...item, ...item.properties};
    } else if ('items' in item) {
      properties = {...item, ...item.items};
    } else {
      properties = item;
    }

    return properties;
  }

  private _getAllPaths(prefixPath: string, properties: any): Array<string> {
    let result: Array<string> = [];

    const addPathsForRelator = function(value: any, newPrefixPath: any) {
      if (value['_relator'] || value['join']) {
        result.push(newPrefixPath + '.id');
        result.push(newPrefixPath + '.ref');
        result.push(newPrefixPath + '.title');
        result.push(newPrefixPath + '.typeQName');
        result.push(newPrefixPath + '.qname');

        const mappings = value?.['_relator']?.['mappings'] ||
                         value?.['join']?.['mappings'];

        if (mappings) {
          mappings.forEach((mapping: any) => {
            const toProperty = mapping['toProperty'] || mapping['to'] || mapping['from'];
            result.push(newPrefixPath + '.' + toProperty + '*');
          });
        }
      }
    };

    Object.keys(properties).forEach((key: string) => {
      const value = properties[key];

      const newPrefixPath = prefixPath ? prefixPath + '.' + key : key;

      if (value['type'] === 'object') {
        result.push(newPrefixPath);

        if (['location'].includes(key)) {
          result.push(newPrefixPath + '*');
        }

        if (value['properties']) {
          result = [...result, ...this._getAllPaths(newPrefixPath, value['properties'])];
        }

        addPathsForRelator(value, newPrefixPath);

        if (value['x-upload']) {
          result.push(newPrefixPath + '*');
        }
      } else if (value['type'] === 'array') {
        result.push(newPrefixPath);

        addPathsForRelator(value, newPrefixPath);

        if (value['items'] && value['items']['properties']) {
          result = [...result, ...this._getAllPaths(newPrefixPath, value['items']['properties'])];
        }
      } else {
        result.push(newPrefixPath);
      }
    });

    return result;
  }

  private _getAllPathTree(properties: any, fields?: string[], showBrackets = true): PathTreeNode[] {
    const results: PathTreeNode[] = [];

    const addPathsForJoin = function(value: any, parentNode: PathTreeNode) {
      parentNode.children?.push(new PathTreeNode( 'id', {type: 'string'}));
      parentNode.children?.push(new PathTreeNode('title', {type: 'string'}));

      const mappings = value?.['_relator']?.['mappings'] || value?.['join']?.['mappings'];

      if (mappings) {
        mappings.forEach((mapping: any) => {
          const toProperty = mapping['toProperty'] || mapping['to'] || mapping['from'];
          parentNode.children?.push(new PathTreeNode(toProperty, {type: 'string'}));
        });
      }
    };

    Object.keys(properties).forEach((key: string) => {
      const value = properties[key];

      if (value['type'] === 'object') {
        const childNode = new PathTreeNode(key, this.getFields(value, fields));

        results.push(childNode);

        if (value['_relator'] || value.join) {
          addPathsForJoin(value, childNode);
        }

        if (value['properties']) {
          const children = this._getAllPathTree(value['properties'], fields, showBrackets);

          childNode.children = [...(childNode?.children || []), ...children];
        }
      } else if (value['type'] === 'array') {
        const arrayKey = showBrackets ? key + '[]' : key;
        const childNode = new PathTreeNode(arrayKey, this.getFields(value, fields));

        results.push(childNode);

        if (value['_relator'] || value['join']) {
          addPathsForJoin(value, childNode);
        }

        if (value['items'] && value['items']['properties']) {
          const children = this._getAllPathTree(value['items']['properties'], fields, showBrackets);
          childNode.children = [...(childNode?.children || []), ...children];
        }
      } else {
        results.push(new PathTreeNode(key, this.getFields(value, fields)));
      }
    });

    if (results.length > 1) {
      return results.sort((r: any, r2: any) => {
        const name1 = r.name;
        const name2 = r2.name;

        if (name1 < name2) {
          return -1;
        }
        if (name1 > name2) {
          return 1;
        }
        return 0;
      });
    }

    return results;
  }

  private getFields(value: any, fields?: string[]): Object {
    if (!fields) {
      return {};
    }

    return fields.reduce((result: any, field: string) => {
      const fieldValue = value?.[field];

      if (fieldValue !== undefined) {
        result[field] = fieldValue;
      }

      return result;
    }, {});
  }
}


export class SchemaParserFactory {

  constructor() {
    //
  }

  getInstance(schemaJson: any): SchemaParser {
    return new SchemaParser(schemaJson);
  }
}


export const schemaParserFactory = new SchemaParserFactory();
