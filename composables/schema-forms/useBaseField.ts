import {schemaFormsProcessingHelper} from '~/service/schema-forms/schemaFormsProcessing.service'
import { isUndefined, intersection, isObject, isString, isEqual, cloneDeep } from '~/service/utils';
import { xFeaturesHelper } from '~/service/schema-forms/xFeaturesHelper';


export interface BaseFieldProps {
  model: any;
  description: any;
  context: any;
}


export interface BaseFieldEmits {
  (e: 'modelChange', value: any): void;
}


export interface FormRef {
  formName: string,
  needCorrectExistingValues?: boolean,
}


export interface ComponentRefs {
  self: any,
  form?: FormRef,
  parentObjectField?: any,
  parentGroupField?: any,
  parentDynamicControl?: any,
}


interface InnerModel {
  _innerModel: any,
  innerContexts: any,
  __id: number,
  _previousValue: any,
  registered: boolean,
}


export default function useBaseField(props: BaseFieldProps, emits: BaseFieldEmits, refs: ComponentRefs): any {

  const im: InnerModel = {
    _innerModel: null,
    innerContexts: {},
    __id: Math.floor(Math.random() * 10000),
    _previousValue: null,
    registered: false,
  };

  watch(() => props?.model, (value: any) => {
    value = correctModelBeforeSet(value);

    if (isStructureTag() && props.context) {
      setModelValueForStructureTagDescription(value);
    } else {
      im._previousValue = im._innerModel;

      const valuesDifferent = valueAndPreviousAreDifferent(value);

      if (!valuesDifferent) {
        return;
      }

      if (valuesDifferent || !isEqual(im._innerModel, value)) {
        im._innerModel = value;
        _processInnerModelChanged();
      }
    }
  });

  function doOnMounted() {
    initField();

    // call this if description was set after model was set!
    afterFieldInit();
  }

  function doOnDeactivated() {
    unregister();
  }

  function unregister() {
    if (schemaFormsProcessingHelper.isFormRegistered(getFormName())) {
      schemaFormsProcessingHelper.unRegisterField(refs.self);
      im.registered = false;
    }
  }

  function registerField() {
    if (schemaFormsProcessingHelper.isFormRegistered(getFormName()) &&
      !im.registered) {
      schemaFormsProcessingHelper.registerField(refs.self,
        refs.parentObjectField || refs.parentGroupField);
      im.registered = true;
    }
  }

  function initField() {
    registerField();
  }

  function afterFieldInit() {
    if (isStructureTag() && im._innerModel) {
      setModelValueForStructureTagDescription(im._innerModel);
    }

    if (needXProcessTheField()) {
      processXFeatures();
    }
  }

  function getFormName(): string {
    if (refs.form) {
      return refs.form.formName;
    }

    return '';
  }

  function isValid(): boolean {
    return true;
  }

  function touch() {
    //
  }

  function shouldBeRequired(description: any): boolean {
    return !!schemaFormsProcessingHelper.shouldFieldBeRequired(description.xRequired, props.context);
  }

  function shouldBeConstructed(description: any, context: any = null, prevValue: any = null,
    updateModel: boolean = true): boolean {
    const shouldBeInited = () => {
      const isArrayDirective = 'canAddMore' in refs.self;

      if (description.persist || (description.xHide && description.xHide.persist)) {
        return false;
      }

      if ((description?.rawData?.hide || description.xHide) && props.model === undefined &&
        (isArrayDirective || ['email', 'url', 'number', 'text', 'textarea', 'time', 'time24',
          'checkbox'].indexOf(description.formType) === -1)) {
        return true;
      }

      return false;
    };

    context = context || props.context;

    let shouldBeConstructedResult = true;

    const features = xFeaturesHelper.getControlFeatures(description, context);

    const hide = features['hide'];
    const writeOnly = (features['writeOnly'] || features['depreciated']);

    const shouldHide = isUndefined(hide) ?
      schemaFormsProcessingHelper.shouldFieldBeHidden(description, description.xHide, context) : hide;

    description.xHideValue = shouldHide;

    if (writeOnly) {
      shouldBeConstructedResult = true;
    } else if (shouldHide) {
      const shouldFieldBePersistedResult = schemaFormsProcessingHelper.shouldFieldBePersisted(description, context)
      if (!shouldFieldBePersistedResult) {
        shouldBeConstructedResult = false;
      }
    }

    if (updateModel) {
      if (shouldBeConstructedResult && !prevValue) {
        registerField();

        if (shouldBeInited()) {
          initField();
        }
      } else if (!shouldBeConstructedResult && (prevValue || prevValue === null)) {
        const isRemoved = schemaFormsProcessingHelper.deepRemoveValueInContext(context, description.path);

        if (isRemoved) {
          schemaFormsProcessingHelper.processFormChanges(getFormName());
        }
      }
    }

    if (description.xHide && !isEqual(!shouldBeConstructedResult, description.xRemoveValue)) {
      description.xRemoveValue = !shouldBeConstructedResult;
    }

    return shouldBeConstructedResult;
  }

  function createModel() {
    props.model = {};
  }

  function deleteModel() {
    props.model = undefined;
  }

  function isReadonly(): boolean {
    if (props.description.readonly) {
      return true;
    }

    if (schemaFormsProcessingHelper.isReadOnlyMode()) {
      return true;
    }

    if (props.description.xSetValue !== undefined) {
      return true;
    }

    return false;
  }

  function getTitle() {
    if (props.description.xTitleValue) {
      return props.description.xTitleValue;
    }

    if (props.description.header) {
      return props.description.header.title;
    }

    return props.description.title;
  }

  function getDescription() {
    if (!props.description) {
      return null;
    }

    if (props.description.header) {
      if (props.description.header.path) {
        return props.description.header;
      }

      return props.description.header.description;
    } else if (props.description.description && !props.description.path) {
      return props.description.description;
    }

    return props.description;
  }

  function getDescriptionText(item?: any) {
    const description = item ? item.description : props.description;

    if (!description) {
      return null;
    }

    if (description.xDescriptionValue) {
      return description.xDescriptionValue;
    }

    if (description.header) {
      return description.header.description;
    } else if (description.description) {
      return description.description;
    }

    return null;
  }

  function processXFeaturesWrapped() {
    processXFeatures();
  }

  function needXProcessTheField(): boolean {
    for (const propertyName of possibleOldXPropertyNames()) {
      if (_getPropertyDescription(propertyName)) {
        return true;
      }
    }

    for (const propertyName of possibleXPropertyNames()) {
      const propertyDescription = _getPropertyDescription('rawData.' + propertyName);

      if (propertyDescription) {
        if (intersection(['value', 'if', 'switch'], Object.keys(propertyDescription))) {
          return true;
        }

        if (xFeaturesHelper.isExecutableValue(propertyDescription)) {
          return true;
        }
      }
    }

    if (_checkAnyChildHasXHide()) {
      return true;
    }

    return false;
  }


  function getCustomValidationErrorMessage(): string {
    return props.description?.rawData?.errorMessage;
  }

  function isStructureTag(): boolean {
    return getDescription() && getDescription().structureTagDescription;
  }

  function getParentPath(): string {
    return getDescription().path.split('.').slice(0, -1).join('.');
  }

  function getModel() {
    if (shouldSetValueForRealModelValue()) {
      const parentPath = getParentPath();
      const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(props.context, parentPath);
      return parentModel[getDescription().name];
    }

    return im._innerModel;
  }

  function createInnerFieldContext(filedName: string, fieldPathIndex: number) {
    if (im.innerContexts[fieldPathIndex]) {
      return im.innerContexts[fieldPathIndex];
    }

    const innerContext: any = {
      ...props.context,
      indexes: cloneDeep(props.context.indexes)
    };

    innerContext.indexes[filedName] = fieldPathIndex;

    // @ts-ignore
    im.innerContexts[fieldPathIndex] = innerContext;

    return innerContext;
  }

  function correctModelBeforeSet(value: any) {
    return value;
  }

  function _checkAnyChildHasXHide(): boolean {
    let description;

    if (props.description && props.description.description &&
      !isString(props.description.description)) {
      description = props.description.description;
    } else {
      description = props.description;
    }

    if (!description) {
      return false;
    }

    if (!description.content) {
      return false;
    }

    const result = description.content.some((item: any) => {
      if (!item.description) {
        return false;
      }

      if (!!item.description.xHide) {
        return true;
      }

      if (item.description.rawData && item.description.rawData.hide) {
        return true;
      }

      return false;
    });

    return result;
  }

  function _processInnerModelChanged(value?: any) {
    emits('modelChange', value || getModel());
  }

  function possibleOldXPropertyNames() {
    return ['xHide', 'xTitle', 'xDefault', 'xSet', 'xMinItems', 'xMaxItems'];
  }

  function possibleXPropertyNames() {
    return ['hide', 'title', 'if', 'switch'];
  }

  function processXFeatures() {
    props.context = {
      ...props.context,
      // ...props.context.resultModel,
      resultModel: props.context.resultModel,
      indexes: props.context.indexes,
      _cachedFunction: props.context._cachedFunction,
    }

    if (_getPropertyDescription('xHide')) {
      processXHidedForModelChanges();
    }

    let fieldDescription;

    const descriptionDescription = props.description?.description;

    if (descriptionDescription && isObject(descriptionDescription)) {
      fieldDescription = descriptionDescription;
    } else {
      fieldDescription = props.description?.header || props.description;
    }

    if (fieldDescription.xTitle) {
      processXTitleForModelChanges();
    }

    if (props.description.xDefault) {
      processXDefaultForModelChanges();
    }

    if (props.description.xSet) {
      const value = schemaFormsProcessingHelper.getXSetValue(props.description.xSet,
        props.context, props.description);
      processXSetForModelChanges(value);
    }

    const features = xFeaturesHelper.getControlFeatures(fieldDescription, props.context);

    if ('hide' in features) {
      processXHidedForModelChanges(features['hide']);
    }

    if ('writeOnly' in features) {
      processXHidedForModelChanges(features['writeOnly']);
    }

    if ('depreciated' in features) {
      processXHidedForModelChanges(features['depreciated']);
    }

    if ('title' in features) {
      processXTitleForModelChanges(features['title']);
    }

    if ('description' in features) {
      processXDescriptionForModelChanges(features['description']);
    }

    if ('default' in features) {
      processXDefaultForModelChanges(features['default']);
    }

    if ('set' in features) {
      processXSetForModelChanges(features['set']);
    }

    return features;
  }

  function processXHidedForModelChanges(value?: boolean) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.shouldFieldBeHidden(props.description,
        _getPropertyDescription('xHide'), props.context);
    }

    if (!isEqual(value, props.description.xHideValue)) {
      props.description.xHideValue = value;

      if (refs.parentObjectField && refs.parentObjectField.processInnerElementVisibilityChanged) {
        refs.parentObjectField.processInnerElementVisibilityChanged();
      }
    }
  }

  function processXTitleForModelChanges(value?: string) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXTitleValue(props.description.xTitle, props.context,
        props.description);
    }

    if (!isEqual(value, props.description.xTitleValue)) {
      props.description.xTitleValue = value;
    }
  }

  function processXDescriptionForModelChanges(value: string) {
    getDescription().xDescriptionValue = value;
  }

  function processXDefaultForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXDefaultValue(props.description.xDefault, props.context, props.description);
    } else {
      value = schemaFormsProcessingHelper.resolveSpecialValue(value, props.description, props.context, false);
    }

    if (!isEqual(value, props.description.xDefaultValue)) {
      const previousXDefaultValue = props.description.xDefaultValue;

      props.description.xDefaultValue = value;

      if (props.model === props.description.default || props.model === previousXDefaultValue) {
        props.model = undefined;
      }

      if (props.description.isJoin) {
        correctExistingRelatorsValue();
      }

      // if (Array.isArray(props.model)) {
      //   if (props.model.length === 0 && !props.context.resultModel._doc) {
      //     props.model = undefined;
      //   }
      // }

      fillEmptyModel();
    }
  }

  function processXSetForModelChanges(value: any) {
    props.description.xSetValue = value;

    if (!isEqual(value, props.model) && value !== undefined) {
      const parentPath = getParentPath();
      const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(props.context, parentPath);

      if (parentModel) {
        parentModel[getDescription().name] = value;
      }
    }
  }

  function correctExistingRelatorsValue() {
    if (!props.model) {
      return;
    }

    if (props.description.isJoin && props.description.values) {
      if (Array.isArray(props.model)) {
        for (let i = 0; i < props.model.length; ++i) {
          if (props.model[i]) {
            props.model[i] = findRelatorProperty(props.model[i], props.description.values);
          }
        }

        props.model = props.model.filter((item: any) => item !== null);
      } else {
        props.model = findRelatorProperty(props.model, props.description.values);
      }
    }
  }

  function findRelatorProperty(modelValue: any, relatorChoices: any) {
    if (isUndefined(modelValue)) {
      return
    }

    for (const i in relatorChoices) {
      if (modelValue.id === relatorChoices[i].id) {
        // we need to extend current selected relator variant with actual ngModel mapping
        // but we need to save original title
        const relatorTitle = relatorChoices[i]['title'];
        const result = {...relatorChoices[i], ...modelValue};
        result['title'] = relatorTitle;

        return result;
      }
    }

    return undefined;
  }

  function fillEmptyModel() {
    if (props.model === undefined) {
      const defaultValue = _getDefaultValue();

      if (defaultValue !== undefined) {
        props.model = defaultValue;
      }
    }
  }

  function _getDefaultValue(): any {
    return props.description.xDefaultValue || props.description.default;
  }

  function _getPropertyDescription(name: string) {
    let fieldDescription;

    const descriptionDescription = props.description?.description;

    if (descriptionDescription && isObject(descriptionDescription)) {
      fieldDescription = descriptionDescription;
    } else {
      fieldDescription = props.description;
    }

    let propertyDescription = fieldDescription.header?.name;

    if (propertyDescription) {
      return propertyDescription;
    }

    propertyDescription = fieldDescription?.name;

    if (propertyDescription) {
      return propertyDescription;
    }

    return null;
  }

  function setModelValueForStructureTagDescription(value: any) {
    const parentPath = getParentPath();
    const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(props.context, parentPath);

    if (isUndefined(im._previousValue) && isUndefined(value)) {
      return;
    }

    const name = getDescription().name;

    im._previousValue = parentModel[name];

    if (!valueAndPreviousAreDifferent(value)) {
      return;
    }

    parentModel[name] = value;

    im._innerModel = undefined;

    _processInnerModelChanged();
    schemaFormsProcessingHelper.processFormChanges(getFormName());
  }

  function shouldSetValueForRealModelValue(): boolean {
    return isStructureTag() && props.context;
  }


  function valueAndPreviousAreDifferent(value: any): boolean {
    if (im._previousValue !== value) {
      if (Array.isArray(im._previousValue) && !im._previousValue.length &&
        Array.isArray(value) && !value.length) {
        return false;
      }

      if (isObject(im._previousValue) && !Object.keys(im._previousValue).length &&
        isObject(value) && !Object.keys(value).length) {
        return false;
      }

      return true;
    }

    return false;
  }

  return {
    getTitle,
    getModel,
    initField,
    afterFieldInit,
    fillEmptyModel,
    correctExistingRelatorsValue,
    possibleOldXPropertyNames,
    possibleXPropertyNames,
    processXFeatures,
    shouldBeRequired,
    shouldBeConstructed,
    doOnMounted,
    doOnDeactivated,
    isValid,
    touch,
    findRelatorProperty,
  }
}
