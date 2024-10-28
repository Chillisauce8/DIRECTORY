import { xFeaturesHelper, XFeaturesHelper } from './xFeaturesHelper';
import { debounce, isNumber, isObject, isString, isUndefined, pullFromArray } from '../utils';
import { EventEmitter, EventEmitterHandler } from '../event-emitter/event-emitter';
import { EventEmitterSubscription } from '../event-emitter/event-emitter-observable';
// @ts-ignore
import { ComponentInternalInstance } from 'vue';


export interface IFieldRef {
  isValid: () => boolean,
  touch: () => void,
  needXProcessTheField: () => boolean,
  processXFeaturesWrapped: () => void,
  getFormName: () => string,
  description: any,

}

interface IFieldRegistration {
  ref: ComponentInternalInstance;
  parentRef?: ComponentInternalInstance;
  changesSubscription: EventEmitterSubscription|null;
  needWatch: boolean;
}


export class SchemaFormsProcessingHelper {

  private registeredForms: any = {};

  private _isProcessModelChangesActivated = false;

  // private _formUpdatedSubject: Subject<any>;
  private formUpdatedEmitter: EventEmitter<any> = new EventEmitter<any>();

  private readonly debouncedProcessFormChanges: (formName: string) => void;

  constructor(
    private xFeaturesHelper: XFeaturesHelper,
   //  private currentUser: CurrentUser,
   // private currentSupplier: CurrentSupplier
  ) {

    this.debouncedProcessFormChanges = debounce((formName: string) =>
      this._processFormChanges(formName), 300);
  }

  onFormUpdated(handler: EventEmitterHandler<any>): EventEmitterSubscription {
    return this.formUpdatedEmitter.subscribe();
      // .pipe(
      //   filter((_formName) => _formName === formName)
      // );
  }

  // TODO: isReadOnlyMode
  isReadOnlyMode(): boolean {
    // const routeStaticData = (this.route).routeConfig.data;
    // const permissionName = routeStaticData['needEditPermissions'] || routeStaticData['needPermissions'];
    // return !this.currentUser.hasPermission(permissionName);
    return false
  }

  deepFindValueInContext(context: any, path: string, indexLastChunk = false) {
    if (path.startsWith('this.')) {
      path = path.replace('this.', '');
    }

    return this.xFeaturesHelper.deepFindValueInContext(context, path, indexLastChunk);
  }

  deepRemoveValueInContext(context: any, path: string) {
    const parentPath = path.split('.').slice(0, -1).join('.');
    const name = path.split('.').slice(-1)[0].replace('[]', '');
    const parentName = parentPath.split('.').slice(-1)[0].replace('[]', '');
    let parentValue = this.deepFindValueInContext(context, parentPath);

    if (Array.isArray(parentValue)) {
      const pathIndex = context.indexes[parentName];
      parentValue = parentValue[pathIndex];
    }

    if (parentValue && name in parentValue) {
      delete parentValue[name];

      return true;
    }

    return false;
  }

  shouldFieldBeHidden(description: any, xDescription: any, context: any): boolean {
    if (!xDescription) {
      return false;
    }

    if (this._checkCondition(xDescription, context)) {
      return true;
    }

    const features = this.xFeaturesHelper.getControlFeatures(description, context);

    return !!features['hide'];
  }

  shouldFieldBePersisted(description: any, context: any): boolean {
    if (!description) {
      return true;
    }

    if (description.persist &&
      this.xFeaturesHelper.getExecutedValue('', description.path, description.path,
        description.persist, context) === true) {
      return true;
    }

    const xHide = description.xHide;

    const actualCondition: any = this._getActualCondition(xHide, context);
    if (actualCondition) {
      if (actualCondition['persist'] === true) {
        return true;
      }

      if (actualCondition['match'] === 'userType' || actualCondition['match'] === 'role') {
        return true;
      }
    }

    const features = this.xFeaturesHelper.getControlFeatures(description, context);

    return !!features['persist'];
  }

  shouldFieldBeRequired(xDescription: any, context: any): boolean|null {
    if (!xDescription) {
      return false;
    }

    return this._checkCondition(xDescription, context);
  }

  filterFieldValues(xDescription: any, initialValues: Array<any>, context: any): Array<any> {
    let modelValue: any;

    if (xDescription['match-key']) {
      modelValue = this.deepFindValueInContext(context, xDescription['match-key']);
    } else {
      modelValue = xDescription['match-value'];
    }

    return initialValues.filter((item: any) => {
      let value = item;
      const byField = xDescription['by-field'] || xDescription['by_field'];

      if (byField) {
        value = this._objectPropertyByString(item, byField);
      }

      if (Array.isArray(modelValue)) {
        if (Array.isArray(value)) {
          for (const valueItem of value) {
            if (modelValue.indexOf(valueItem) !== -1) {
              return true;
            }
          }

          return false;

        } else {
          return modelValue.indexOf(value) !== -1;
        }
      } else {
        if (Array.isArray(value)) {
          return value.indexOf(modelValue) !== -1;
        } else {
          return value === modelValue;
        }
      }
    });
  }

  filterFieldValues2(description: any, initialValues: Array<any>, context: any): Array<any> {
    if (!description.rawData?.filter) {
      return initialValues;
    }

    return initialValues.filter((item: any) => {
      return this.xFeaturesHelper.executeToGetVariable(description.path, description.path,
        {...context, ...context.resultModel, item}, 'filter', description.rawData['filter']);
    });
  }

  prepareEnumValues(enumValues: Array<any>, titlePath: string, valuePath: string): Array<any> {
    const result = enumValues?.length ? enumValues
      .map((item: any) => {
        if (isString(item)) {
          return item;
        } else if (isObject(item)) {
          if (Object.keys(item).length === 0) {
            return null;
          }

          const innerResult: any = {};

          const itemContext = {resultModel: item, indexes: []};

          let value = item;

          if (valuePath) {
            value = this.deepFindValueInContext(itemContext, valuePath);
          }

          innerResult['value'] = value;

          let title = item[Object.keys(item)[0]];

          if (titlePath) {
            title = this.deepFindValueInContext(itemContext, titlePath);
          }

          innerResult['title'] = title;

          return innerResult;
        }
      }) : [];

    return result.filter(item => !!item);
  }

  getXEnumValues(xDescription: any, context: any): any {
    if (!xDescription) {
      return null;
    }

    let descriptionToCheck = xDescription;

    if (!Array.isArray(descriptionToCheck)) {
      descriptionToCheck = [descriptionToCheck];
    }

    for (const i in descriptionToCheck) {
      if (this._checkConditionForItem(descriptionToCheck[i], context)) {
        let enumValues = descriptionToCheck[i]['enum'];
        const titlePath = descriptionToCheck[i]['title-path'];
        const valuePath = descriptionToCheck[i]['value-path'];

        if (isString(enumValues) && enumValues[0] === '&') {
          enumValues = this.deepFindValueInContext(context, enumValues.slice(1));
        }

        if (!Array.isArray(enumValues)) {
          continue;
        }

        return this.prepareEnumValues(enumValues, titlePath, valuePath);
      }
    }

    return null;
  }

  getXDefaultValue(xDescription: any, context: any, modelDescription: any): any {
    if (!xDescription) {
      return false;
    }

    let descriptionToCheck = xDescription;

    if (!Array.isArray(xDescription)) {
      descriptionToCheck = [xDescription];
    }

    for (const i in descriptionToCheck) {
      if (this._checkConditionForItem(descriptionToCheck[i], context)) {
        const result = descriptionToCheck[i]['default'];
        return this.resolveSpecialValue(result, modelDescription, context, false);
      }
    }

    return null;
  }

  getXSetValue(xDescription: any, context: any, modelDescription: any): any {
    if (!xDescription) {
      return undefined;
    }

    let descriptionToCheck = xDescription;

    if (!Array.isArray(descriptionToCheck)) {
      descriptionToCheck = [descriptionToCheck];
    }

    for (const i in descriptionToCheck) {
      if (this._checkConditionForItem(descriptionToCheck[i], context)) {
        const result = descriptionToCheck[i]['value'];
        return this.resolveSpecialValue(result, modelDescription, context);
      }
    }

    return undefined;
  }

  getXTitleValue(xDescription: any, context: any, modelDescription: any): any {
    if (!xDescription) {
      return undefined;
    }

    let descriptionToCheck = xDescription;

    if (!Array.isArray(descriptionToCheck)) {
      descriptionToCheck = [descriptionToCheck];
    }

    for (const i in descriptionToCheck) {
      if (this._checkConditionForItem(descriptionToCheck[i], context)) {
        const result = descriptionToCheck[i]['value'];
        return this.resolveSpecialValue(result, modelDescription, context);
      }
    }

    return undefined;
  }

  getXReadOnlyValue(xDescription: any, context: any): boolean {
    if (!xDescription) {
      return false;
    }

    let descriptionToCheck = xDescription;

    if (!Array.isArray(descriptionToCheck)) {
      descriptionToCheck = [descriptionToCheck];
    }

    for (const i in descriptionToCheck) {
      if (this._checkConditionForItem(descriptionToCheck[i], context)) {
        return true;
      }
    }

    return false;
  }

  getXCalculatedValues(description: any, context: any): number|undefined {

    const processGroups = (descriptions: Array<any>): number|undefined => {
      let result: any = null;

      for (let i = 0; i < descriptions.length; ++i) {
        const d = descriptions[i];

        let value: number;
        if (d['group']) {
          value = processGroups(d['group']) as number;
        } else {
          if (d['match-key']) {
            value = this.deepFindValueInContext(context, d['match-key']);
          } else {
            value = d['const'] || 0;
          }
        }

        if (result === null) {
          result = value;
        } else {
          const operation = d['operation'] || '+';

          switch (operation) {
            case '+':
              result += value;
              break;
            case '-':
              result -= value;
              break;
            case '*':
              result *= value;
              break;
            case '/':
              result /= value;
              break;
            case '%':
              result %= value;
              break;
          }
        }
      }

      if (isNaN(result)) {
        return undefined;
      }

      return this.xFeaturesHelper.roundXStepValue(result, description);
    };

    return processGroups(description.xCalculate);
  }

  getXConcatenateValue(xDescription: Array<any>, context: any): string {
    if (!xDescription) {
      return '';
    }

    let res = '';

    for (const item of xDescription) {
      if (item[0] === '&') {
        const modelValue = this.deepFindValueInContext(context, item.slice(1));

        if (modelValue) {
          res += modelValue;
        }
      } else {
        res += item;
      }
    }

    return res;
  }

  getXNumberValue(xDescription: Array<any>, context: any, modelDescription: any): number|undefined|null {
    if (!xDescription) {
      return undefined;
    }

    let descriptionToCheck = xDescription;

    if (!Array.isArray(descriptionToCheck)) {
      descriptionToCheck = [descriptionToCheck];
    }

    for (const i in descriptionToCheck) {
      if (this._checkConditionForItem(descriptionToCheck[i], context)) {
        let result = descriptionToCheck[i]['value'];
        result = this.resolveSpecialValue(result, modelDescription, context);

        if (Array.isArray(result)) {
          return result.length;
        } else if (isNumber(result)) {
          return result;
        }
      }
    }

    return null;
  }

  registerForm(formName: string) {
    if (formName in this.registeredForms) {
      return;
    }

    this.registeredForms[formName] = {
      fields: []
    };
  }

  unRegisterForm(formName: string) {
    if (!(formName in this.registeredForms)) {
      return;
    }

    delete this.registeredForms[formName];
  }

  isFormRegistered(formName: string): boolean {
    return formName in this.registeredForms;
  }

  registerField(fieldComponentInstance: ComponentInternalInstance, parentObjectFieldInstance?: ComponentInternalInstance) {
    if (!fieldComponentInstance) {
      return;
    }

    const fieldRegistration: IFieldRegistration = {
      ref: fieldComponentInstance,
      parentRef: parentObjectFieldInstance,
      changesSubscription: null,
      needWatch: fieldComponentInstance.setupState.sharedFunctions.needXProcessTheField()
    };

    this.registeredForms[fieldComponentInstance.setupState.sharedFunctions.getFormName()]['fields'].push(fieldRegistration);
  }

  unRegisterField(fieldComponentRef: ComponentInternalInstance) {
    const fieldRegistration = this.registeredForms[fieldComponentRef.setupState.sharedFunctions.getFormName()]['fields']
      .filter((value: IFieldRegistration) => value.ref === fieldComponentRef)[0];

    if (fieldRegistration) {
      if (fieldRegistration.changesSubscription) {
        fieldRegistration.changesSubscription.unsubscribe();
      }

      this.registeredForms[fieldComponentRef.setupState.sharedFunctions.getFormName()]['fields'] =
        pullFromArray(this.registeredForms[fieldComponentRef.setupState.sharedFunctions.getFormName()]['fields'], fieldRegistration);
    }

    for (const field of this.registeredForms[fieldComponentRef.setupState.sharedFunctions.setupState.sharedFunctions.getFormName()]['fields']) {
      if (field.parentRef === fieldComponentRef) {
        this.unRegisterField(field.ref);
      }
    }
  }

  isFormValid(formName: string) {
    if (!this.registeredForms[formName] || !this.registeredForms[formName]['fields']) {
      return;
    }

    // TODO: update validation code ***
    for (const field of this.registeredForms[formName]['fields']) {
      if (!field.ref.setupState.sharedFunctions.isValid() &&
        (!field.ref.props.description.xHideValue || !field.ref.props.description.xHide?.persist)) {
        return false;
      }
    }

    return true;
  }

  touchAllControlsForForm(formName: string) {
    if (!this.registeredForms[formName] || !this.registeredForms[formName]['fields']) {
      return;
    }

    this.registeredForms[formName]['fields'].forEach((c: any) => {
      c.ref.setupState.sharedFunctions.touch();
    });
  }

  processFormChanges(formName: string) {
    this.debouncedProcessFormChanges(formName);
  }

  private _processFormChanges(formName: string) {
    if (!this.registeredForms[formName] || !this.registeredForms[formName]['fields']) {
      return;
    }

    this.registeredForms[formName]['fields'].forEach((c: any) => {
      if (c.needWatch) {
        c.ref.setupState.sharedFunctions.processXFeaturesWrapped();
      }
    });

    setTimeout(() => {
      this.formUpdatedEmitter.next(formName);
    }, 100);
  }

  private _checkCondition(descriptionToCheck: any, context: any): boolean|null {
    return this._getActualCondition(descriptionToCheck, context);
  }

  private _getActualCondition(descriptionToCheck: any, context: any): boolean|null {
    if (!Array.isArray(descriptionToCheck)) {
      descriptionToCheck = [descriptionToCheck];
    }

    for (const i in descriptionToCheck) {
      if (this._checkConditionForItem(descriptionToCheck[i], context)) {
        return descriptionToCheck[i];
      }
    }

    return null;
  }

  private _checkConditionForItem(item: any, context: any): boolean {
    const self = this;

    if (!item) {
      return false;
    }

    if (isUndefined(item['match-type'])) {
      item['match-type'] = true;
    }

    if (item['match-all']) {
      for (const subItem of item['match-all']) {
        if (!this._checkConditionForItem(subItem, context)) {
          return false;
        }
      }

      return true;
      // TODO: exotic matches
    // } else if (item['match'] === 'permissions') {
    //   const match = item['match-values'].reduce((result: any, current: any) => {
    //     return result || self.currentUser.hasPermission(current);
    //   }, false);
    //   return match === item['match-type'];
    // } else if (item['match'] === 'role') {
    //   const match = item['match-values'].reduce((result: any, current: any) => {
    //     return result || self.currentUser.hasRole(current);
    //   }, false);
    //   return match === item['match-type'];
    // } else if (item['match'] === 'userType') {
    //   const match = item['match-values'].reduce((result: any, current: any) => {
    //     return result || self.currentUser.isUserTypeIs(current);
    //   }, false);
    //   return match === item['match-type'];
    } else if (item['match-key']) {
      let modelValue: any = this.deepFindValueInContext(context, item['match-key']);

      if (isUndefined(modelValue)) {
        // null is possible for X-conditions but undefined is not possible
        modelValue = null;
      }

      let match = false;

      if (item['match-values']) {
        if (Array.isArray(modelValue)) {
          match = (modelValue as any[]).reduce((result: any, current: any) => {
            return result || (item['match-values'].indexOf(current) !== -1);
          }, false);
        } else {
          match = item['match-values'].indexOf(modelValue) !== -1;
        }
      } else {
        match = !!modelValue;
      }

      return match === item['match-type'];
    } else if (item['match-count']) {
      const modelValue = this.deepFindValueInContext(context, item['match-count']);
      const count = modelValue ? modelValue.length : 0;
      const match = item['match-values'].indexOf(count) !== -1;
      return match === item['match-type'];
    } else {
      return item['match-type'] || true;
    }
  };

  resolveSpecialValue(value: any, modelDescription: any, context: any, joinArray = true): any {
    if (!value) {
      return value;
    }

    let selectValueId;
    // if (value === 'this.user') {
    //   selectValueId = this.currentUser.getId();
    // } else if (value === 'this.supplier') {
    //   selectValueId = this.currentSupplier.getId() || null;
    // }

    if (selectValueId && modelDescription.values && modelDescription.values.length) {
      for (const i in modelDescription.values) {
        if (selectValueId === modelDescription.values[i].id) {
          return modelDescription.values[i];
        }
      }
    } else if (selectValueId === null) {
      return selectValueId;
    }

    // TODO: current user
    // if (value === 'this.user.name') {
    //   return this.currentUser.getFullName();
    // }
    //
    // if (value === 'this.user.id') {
    //   return this.currentUser.getId();
    // }

    const formType = modelDescription?.description?.formType ?? modelDescription.formType;
    if (formType === 'date' && value === 'today') {
      return new Date();
    }

    if (this.xFeaturesHelper.isFormulaTypeValue(value)) {
      return this.xFeaturesHelper.resolveFormulaValue(value, context, modelDescription);
    } else if (value[0] === '&') {
      return this.deepFindValueInContext(context, value.slice(1));
    }

    if (Array.isArray(value)) {
      const result = value.map((item: any) => {
        return this.resolveSpecialValue(item, modelDescription, context);
      });

      return joinArray ? result.join(' ') : result;
    }

    return value;
  }

  private _objectPropertyByString(obj: any, property: string): any {
    let s = property;
    let o: any = obj;

    s = s.replace(/\[(\w+)]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    const a = s.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
      const k = a[i];
      if (k in o) {
        o = o[k];
      } else if (Array.isArray(o)) {
        return (<Array<any>>o).map((item: any) => {
          return this._objectPropertyByString(item, a.slice(i).join('.'));
        });
      } else {
        return;
      }
    }

    return o;
  }
}


export const schemaFormsProcessingHelper = new SchemaFormsProcessingHelper(xFeaturesHelper);
