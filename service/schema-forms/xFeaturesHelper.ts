import {DEFAULT_FALSE_X_KEYS, UNDEFINED_MATTERS_X_KEYS, X_KEYS} from './schemaParser.factory';
import { isNumber, isObject, isString, isUndefined, union } from '../utils';


String.prototype.repeat = function( num ) {
  // @ts-ignore
  return new Array(num + 1).join(this);
}


function prepareAbsPathPrefix(pathParts: string[], steps: number) {
  const partsForReplace = pathParts.slice(0, pathParts.length - steps);

  return partsForReplace
    .map(item => {
      if (item.endsWith('[]')) {
        const clearedItem = item.replace('[]', '');
        item = clearedItem + `[this.indexes.${clearedItem}]`;
      }

      return item;
    })
    .map(item => item + '.').join('');
}


export function prepareRelativeJs(js: string|any, fieldPath: string) {
  if (!isString(js)) {
    return js;
  }

  let preparedJs = js.replace(/G\//gi, 'this.global.');

  if (preparedJs.indexOf('../') !== -1) {
    const pathParts = fieldPath.split('.');
    const maxPossibleStepsBack = pathParts.length - 1;

    for (let i = maxPossibleStepsBack; i > 0; --i) {
      const absPathPrefixWithIndexes = prepareAbsPathPrefix(pathParts, i);

      const pattern = '\\.\\./'.repeat(i);
      const re = new RegExp(pattern, 'g');
      preparedJs = preparedJs.replace(re, `this.${absPathPrefixWithIndexes}`);
    }

    if (preparedJs.indexOf('../') !== -1) {
      preparedJs = preparedJs.replace(/\.\.\//g, `this.`);
    }
  }

  if (preparedJs.indexOf('./') !== -1) {
    const pathParts = fieldPath.split('.');
    const absFullPath = prepareAbsPathPrefix(pathParts, 0);
    preparedJs = preparedJs.replace(/\.\/([a-z_A-Z1-9-]+)/g, `this.${absFullPath}$1`);
  }

  if (preparedJs.indexOf('/') !== -1) {
    preparedJs = preparedJs.replace(/(^|\s|\(|{|\[|\+|!)\/([a-z][a-z_A-Z1-9-]+)/g, '$1this.$2');
  }

  return preparedJs;
}


export function evalInContextFunction(js: string, fieldPath: string): any {
  try {
    return new Function('"use strict";return (' + prepareRelativeJs(js, fieldPath) + ')');
  } catch (e) {
    console.log(js);
    console.log(e);
  }
}


export function evalInContext(js: string, context = {}) {
  return evalInContextFunction(js, '').call(context);
}


export class XFeaturesHelper {

  private readonly globalVariablesForContext;

  constructor(
    // private currentUser: CurrentUser,
    // private currentSupplier: CurrentSupplier
  ) {
    this.globalVariablesForContext = this.prepareGlobalVariablesForContext();
  }

  getGlobalVariablesForContext() {
    return this.globalVariablesForContext;
  }

  getControlFeatures(fieldDescription: any, context: any): any {
    if (!fieldDescription.rawData) {
      return {};
    }

    const executionContext = this.prepareExecutionContext(fieldDescription, context);

    const result: any = {};

    X_KEYS.forEach(keyName => {
      let value = this.getValueForXKey(keyName, fieldDescription, executionContext);

      const resultKeyName = keyName.replace('x-', '');

      if (!isUndefined(value)) {

        if (resultKeyName === 'calculate') {
          value = this.roundXStepValue(value, fieldDescription);
        }

        result[resultKeyName] = value;
      } else if (fieldDescription.rawData?.[keyName] &&
          DEFAULT_FALSE_X_KEYS.includes(resultKeyName)) {
        result[resultKeyName] = false;
      } else if (fieldDescription.rawData?.[keyName] &&
          UNDEFINED_MATTERS_X_KEYS.includes(resultKeyName)) {
        result[resultKeyName] = undefined;
      }
    });

    const ifValues = this.getValueForXKey('if', fieldDescription, executionContext);

    if (ifValues) {
      for (const keyName of Object.keys(ifValues)) {
        result[keyName] = ifValues[keyName];
      }
    }

    const switchValues = this.getValueForXKey('switch', fieldDescription, executionContext);

    if (switchValues) {
      for (const keyName of Object.keys(switchValues)) {
        result[keyName] = switchValues[keyName];
      }
    }

    return result;
  }

  prepareExecutionContext(description: any, context: any) {
    const executionContext = {
      ...context.resultModel,
      ...context,
    };

    const allDescriptionKeys: string[] = Object.keys(description.rawData);

    for (const key of allDescriptionKeys) {
      if (!key.startsWith('let ')) {
        continue;
      }

      const letName = key.replace('let ', '').trim();
      const variableValue = this.executeToGetVariable(description.path, description.path,
        executionContext, letName, description.rawData[key]);

      executionContext[letName] = variableValue;
    }

    return executionContext;
  }

  getValueForXKey(keyName: string, description: any, executionContext: any) {
    const keyDescription = ['if', 'switch'].indexOf(keyName) !== -1 ? description.rawData :
      description.rawData[keyName];

    if (!keyDescription) {
      return;
    }

    if (['if', 'switch'].indexOf(keyName) !== -1 && !(keyName in keyDescription)) {
      return;
    }

    if (keyDescription['if']) {
      const ifPath = `${description.path}.${keyName}${keyName !== 'if' ? '.if' : ''}`;
      const ifValue = this.executeToGetVariable(ifPath, description.path,
        executionContext, 'if', keyDescription['if']);

      if (ifValue) {
        if (keyDescription['value'] || keyDescription['then']) {
          return this.getValueValue(keyName, ifPath, description.path, keyDescription, executionContext);
        } else {
          return true;
        }
      } else if (keyDescription['else']) {
        if (!Array.isArray(keyDescription['else'])) {
          const ifElsePath = ifPath + '.else';
          const elseItemDescription = keyDescription['else'];

          if (elseItemDescription['if']) {
            const elseIfValue = this.executeToGetVariable(ifElsePath, description.path,
              executionContext, 'if',
              elseItemDescription['if']);

            if (elseIfValue) {
              return this.getValueValue(keyName, ifElsePath, description.path, keyDescription['else'], executionContext);
            }
          } else {
            return this.getValueValue(keyName, ifElsePath, description.path, keyDescription['else'], executionContext);
          }
        }

        const elseArray = keyDescription['else'];

        for (let i = 0; i < elseArray.length; ++i) {
          const elseItemDescription = elseArray[i];

          if (elseItemDescription['if']) {
            const ifElsePath = ifPath + '.else.' + i;
            const elseIfValue = this.executeToGetVariable(ifElsePath, description.path,
              executionContext, 'if', elseItemDescription['if']);

            if (elseIfValue) {
              return this.getValueValue(keyName, ifElsePath, description.path, elseItemDescription, executionContext);
            }
          } else {
            const ifElsePath = ifPath + '.else.' + i;
            return this.getValueValue(keyName, ifElsePath, description.path, elseItemDescription, executionContext);
          }
        }
      } else {
        return false;
      }
    } else if (keyDescription['switch']) {
      const switchPath = `${description.path}.${keyName}${keyName !== 'switch' ? '.switch' : ''}`;
      const switchValue = this.executeToGetVariable(switchPath, description.path,
        executionContext, 'switch', keyDescription['switch']);

      if (switchValue) {
        const casesDescription = keyDescription['cases'];
        for (let i = 0; i < casesDescription.length; ++i) {
          const caseDescription = casesDescription[i];
          const casePath = switchPath + '.case.' + i;
          if (isUndefined(caseDescription['case']) ||
            switchValue === caseDescription['case']) {
            return this.getValueValue(keyName, casePath, description.path, caseDescription, executionContext);
          }
        }
      }
    } else if (keyDescription['value']) {
      return this.getValueValue(keyName, description.path, description.path, keyDescription, executionContext);
    } else {
      return this.getExecutedValue(keyName, description.path, description.path,
        keyDescription, executionContext);
    }
  }

  getValueValue(keyName: string, cachePath: string, schemaPath: string, keyDescription: any,
                executionContext: any) {
    let rawValue = 'then' in  keyDescription ? keyDescription['then'] : keyDescription;
    rawValue = 'value' in rawValue ? rawValue['value'] : rawValue;

    if (!rawValue) {
      return rawValue;
    }

    return this.getExecutedValue(keyName, cachePath, schemaPath, rawValue, executionContext);
  }

  isExecutableValue(rawValue: string): boolean {
    return isString(rawValue) && (rawValue.indexOf('this.') !== -1 || /\/[a-z]/.test(rawValue));
  }

  getExecutedValue(keyName: string, cachePath: string, schemaPath: string, rawValue: any, executionContext: any) {
    if (this.isExecutableValue(rawValue)) {
      return this.executeToGetVariable(cachePath, schemaPath, executionContext, 'value', rawValue);
    } else if (Array.isArray(rawValue) && Object.keys(rawValue[0]).some( key => key.startsWith('match-'))) {
      return undefined;
    } else if (isObject(rawValue) && Object.keys(rawValue).some(key => key.startsWith('match-'))) {
      return undefined;
    } else if (Array.isArray(rawValue)) {
      return rawValue;
    } else if (isObject(rawValue)) {
      const result: any = {};
      for (const key in rawValue) {
        if (this.isExecutableValue(rawValue[key])) {
          result[key] = this.executeToGetVariable(cachePath, schemaPath, executionContext, key, rawValue[key]);
        } else {
          result[key] = rawValue[key];
        }
      }

      return result;
    }

    return rawValue;
  }

  executeToGetVariable(cachePath: string, pathWithArrays: string, executionContext: any, variableName: string,
                       variableCode: string) {
    if (!executionContext._cachedFunction[cachePath]) {
      executionContext._cachedFunction[cachePath] = {};
    }

    if (!executionContext._cachedFunction[cachePath][variableName]) {
      executionContext._cachedFunction[cachePath][variableName] =
        evalInContextFunction(variableCode, pathWithArrays);
    }

    let variableValue;

    try {
      variableValue = executionContext._cachedFunction[cachePath][variableName].call(executionContext);
    } catch (ex) {
      variableValue = undefined;
    }

    return variableValue;
  }

  roundXStepValue(value: number, description: any) {
    if (description.xStep) {
      const splitStep = description.xStep.toString().split('.');
      if (splitStep.length === 2) {
        const decimalPointsNeed = splitStep[1].length;

        return this.roundNumberForXStepFields(value, decimalPointsNeed);
      }
    }

    return value;
  }

  isFormulaTypeValue(value: string) {
    if (!isString(value)) {
      return false;
    }

    return value.slice(0, 2) === '&(' && value.slice(-1)[0] === ')';
  }

  resolveFormulaValue(value: string, context: any, description: any) {
    const possibleOperators = ['+', '-', '*', '/'];

    let formulaString = value.slice(2, -1);

    const values = formulaString.split(' ');

    let parsedOk = true;

    values.forEach((item: string) => {
      if (possibleOperators.includes(item)) {
        return;
      }

      if (!isNaN(<any>item)) {
        return;
      }

      const foundValue = this.deepFindValueInContext(context, item);

      if (!foundValue) {
        parsedOk = false;
        return;
      }

      formulaString = formulaString.replace(item, foundValue);
    });

    if (parsedOk) {
      const result = eval(formulaString);
      return this.roundXStepValue(result, description);
    }
  }

  deepFindValueInContext(context: any, path: string, indexLastChunk = false) {
    const pathChunks = path.split('.');
    let currentObject = context.resultModel;
    let i;

    for (i = 0; i < pathChunks.length; ++i) {
      if (!currentObject) {
        return currentObject;
      }

      const pathChunk: string = pathChunks[i];

      if (!pathChunk) {
        return currentObject;
      }

      let matchResult: any = pathChunk.match(/^[^\[]+/g);
      const pathObjectName = matchResult[0];
      let innerObject = currentObject[pathObjectName];

      matchResult = pathChunk.match(/[^\[\]]+(?=])/g);

      if (matchResult) {
        let pathIndex = parseInt(matchResult[0], 10);
        if (isNaN(pathIndex)) {
          pathIndex = context.indexes[pathObjectName];
        }

        if (isNumber(pathIndex)) {
          innerObject = innerObject[pathIndex];
        } else {
          innerObject = undefined;
        }
      } else {
        const isLastChunk = i === pathChunks.length - 1;

        if ((indexLastChunk || !isLastChunk) && Array.isArray(innerObject)) {
          if (context.indexes && pathObjectName in context.indexes) {
            const pathIndex = context.indexes[pathObjectName];
            innerObject = innerObject[pathIndex];
          }
        }
      }

      if (isUndefined(innerObject)) {
        if (Array.isArray(currentObject)) {
          currentObject = currentObject.map(function(item: any) {
            return item ? item[pathChunk] : null;
          });
        } else {
          return undefined;
        }
      } else {
        currentObject = innerObject;
      }
    }

    return currentObject;
  }

  private prepareGlobalVariablesForContext() {
    const globalContext: any = {};

    //TODO: USER TYPE
    // if (this.currentUser?.getVisibleUserType()) {
    //   globalContext['userType'] = this.currentUser.getVisibleUserType();
    // }

    // TODO: SUPPLIER
    // if (this.currentSupplier?.getId()) {
    //   globalContext['supplier'] = {
    //     'id': this.currentSupplier.getId(),
    //     'name': this.currentSupplier.getName(),
    //   };
    // }

    // TODO: ROLES
    // const roles = this.currentUser?.getRoles() || [];
    // const possiblePermissions = ['staffArea', 'supplierArea', 'parentSupplierArea', 'websiteArea'];
    //
    // const permissions: any = {};

    // possiblePermissions.forEach(possiblePermission => {
    //   const mergedSubPermissions: any = {};
    //
    //   for (const role of roles) {
    //     const rolePossiblePermission = role[possiblePermission];
    //     for (const key in rolePossiblePermission) {
    //       if (Array.isArray(rolePossiblePermission[key])) {
    //         if (!(key in mergedSubPermissions)) {
    //           mergedSubPermissions[key] = rolePossiblePermission[key];
    //         } else {
    //           mergedSubPermissions[key] = union(mergedSubPermissions[key], rolePossiblePermission[key]);
    //         }
    //       }
    //     }
    //   }
    //
    //   permissions[possiblePermission] = mergedSubPermissions;
    // });
    //
    // globalContext['permissions'] = permissions;
    //
    // globalContext['role'] = roles.map((item: any) => item['name']);

    return globalContext;
  }

  private roundNumberForXStepFields(val: number, maxDecimalPoints: number = 2) {
    const d = Math.pow(10, maxDecimalPoints);
    return Math.round(val * d) / d;
  }
}


export const xFeaturesHelper = new XFeaturesHelper();
