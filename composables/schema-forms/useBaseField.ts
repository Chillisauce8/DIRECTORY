import {schemaFormsProcessingHelper} from '~/service/schema-forms/schemaFormsProcessing.service'
import { isUndefined, intersection, isObject, isString, isEqual, cloneDeep } from '~/service/utils';
import { xFeaturesHelper } from '~/service/schema-forms/xFeaturesHelper';
// @ts-ignore
import { onMounted } from 'vue';


export interface BaseFieldProps {
  model: any;
  description: any;
  context?: any;
  noPlaceholder?: boolean;
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
  refs?: ComponentRefs,
  needCorrectExistingValues: boolean,
}


export default function useBaseField(props: BaseFieldProps, emits: BaseFieldEmits): any {

  const im: InnerModel = reactive({
    _innerModel: null,
    innerContexts: {},
    __id: Math.floor(Math.random() * 10000),
    _previousValue: null,
    registered: false,
    refs: null,
    needCorrectExistingValues: false,
  });

  const vm = reactive({
    model: props.model,
    context: props.context,
    placeholderValue: props.noPlaceholder,
  });

  const initDone = ref(false);

  const sharedFunctions = {

    setRefs(refsValue: ComponentRefs) {
      im.refs = refsValue;
      im.needCorrectExistingValues = refsValue?.form?.needCorrectExistingValues || false;
    },

    getTitle: () => {
      if (props.description.xTitleValue) {
        return props.description.xTitleValue;
      }

      if (props.description.header) {
        return props.description.header.title;
      }

      return props.description.title || props.description.name;
    },

    getModel: () => {
      if (sharedFunctions.shouldSetValueForRealModelValue()) {
        const parentPath = sharedFunctions.getParentPath();
        const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);
        return parentModel[sharedFunctions.getDescription().name];
      }

      return im._innerModel;
    },

    setModel: (value: any, updated?: boolean) => {
      value = sharedFunctions.correctModelBeforeSet(value);

      if (isStructureTag() && vm.context) {
        setModelValueForStructureTagDescription(value);
      } else {
        im._previousValue = im._innerModel;

        const valuesDifferent = valueAndPreviousAreDifferent(value);

        if (!updated && !valuesDifferent) {
          return;
        }

        if (updated || valuesDifferent || !isEqual(im._innerModel, value)) {
          im._innerModel = value;
          sharedFunctions.processInnerModelChanged();
        }
      }
    },

    initField: () => {
      registerField();
    },

    afterFieldInit: () => {
      if (isStructureTag() && im._innerModel) {
        setModelValueForStructureTagDescription(im._innerModel);
      }

      if (sharedFunctions.needXProcessTheField()) {
        sharedFunctions.processXFeatures();
      }

      initDone.value = true;
    },

    doOnMounted: () => {
      sharedFunctions.initField();

      // call this if description was set after model was set!
      sharedFunctions.afterFieldInit();
    },

    fillEmptyModel: () => {
      if (vm.model === undefined) {
        const defaultValue = sharedFunctions.getDefaultValue();

        if (defaultValue !== undefined) {
          vm.model = defaultValue;
        }
      }
    },

    getDefaultValue: () => {
      return props.description.xDefaultValue || props.description.default;
    },

    correctExistingRelatorsValue: () => {
      if (!vm.model) {
        return;
      }

      if (props.description.isJoin && props.description.values) {
        if (Array.isArray(vm.model)) {
          for (let i = 0; i < vm.model.length; ++i) {
            if (vm.model[i]) {
              vm.model[i] = sharedFunctions.findRelatorProperty(vm.model[i], props.description.values);
            }
          }

          vm.model = vm.model.filter((item: any) => item !== null);
        } else {
          vm.model = sharedFunctions.findRelatorProperty(vm.model, props.description.values);
        }
      }
    },

    possibleOldXPropertyNames: () => {
      return ['xHide', 'xTitle', 'xDefault', 'xSet', 'xMinItems', 'xMaxItems'];
    },

    possibleXPropertyNames: () => {
      return ['hide', 'title', 'if', 'switch'];
    },

    processXFeatures: () => {
      vm.context = {
        ...vm.context,
        // ...vm.context.resultModel,
        resultModel: vm.context.resultModel,
        indexes: vm.context.indexes,
        _cachedFunction: vm.context._cachedFunction,
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
          vm.context, props.description);
        processXSetForModelChanges(value);
      }

      const features = xFeaturesHelper.getControlFeatures(fieldDescription, vm.context);

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
    },

    shouldBeRequired: (description: any): boolean => {
      return !!schemaFormsProcessingHelper.shouldFieldBeRequired(description.xRequired, vm.context);
    },

    shouldBeConstructed: (description: any, context: any = null, prevValue: any = null,
                        updateModel: boolean = true): boolean => {

      const shouldBeInited = () => {
        const isArrayDirective = im?.refs?.self && 'canAddMore' in im?.refs?.self;

        if (description.persist || (description.xHide && description.xHide.persist)) {
          return false;
        }

        if ((description?.rawData?.hide || description.xHide) && vm.model === undefined &&
          (isArrayDirective || ['email', 'url', 'number', 'text', 'textarea', 'time', 'time24',
            'checkbox'].indexOf(description.formType) === -1)) {
          return true;
        }

        return false;
      };

      context = context || vm.context;

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
            sharedFunctions.initField();
          }
        } else if (!shouldBeConstructedResult && (prevValue || prevValue === null)) {
          const isRemoved = schemaFormsProcessingHelper.deepRemoveValueInContext(context, description.path);

          if (isRemoved) {
            schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
          }
        }
      }

      if (description.xHide && !isEqual(!shouldBeConstructedResult, description.xRemoveValue)) {
        description.xRemoveValue = !shouldBeConstructedResult;
      }

      return shouldBeConstructedResult;
    },

    doOnDeactivated: () => {
      unregister();
    },

    isValid: (): boolean => {
      return true;
    },

    touch: () => {
      //
    },

    findRelatorProperty: (modelValue: any, relatorChoices: any) => {
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
    },

    processInnerModelChanged: (value?: any) => {
      emits('modelChange', value || sharedFunctions.getModel());
    },

    createInnerFieldContext: (filedName: string, fieldPathIndex: number) => {
      if (im.innerContexts[fieldPathIndex]) {
        return im.innerContexts[fieldPathIndex];
      }

      const innerContext: any = {
        ...vm.context,
        indexes: cloneDeep(vm.context.indexes)
      };

      innerContext.indexes[filedName] = fieldPathIndex;

      // @ts-ignore
      im.innerContexts[fieldPathIndex] = innerContext;

      return innerContext;
    },

    getParentPath: (): string => {
      return sharedFunctions.getDescription().path.split('.').slice(0, -1).join('.');
    },

    getDescription: () => {
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
    },

    getFormName: (): string => {
      if (im.refs?.form) {
        return im.refs.form.formName;
      }

      return '';
    },

    getDescriptionText: (item?: any) => {
      const description = item ? item.description : props.description;

      if (!description) {
        return '';
      }

      if (description.xDescriptionValue) {
        return description.xDescriptionValue;
      }

      if (description.header) {
        return description.header.description;
      } else if (description.description) {
        return description.description;
      }

      return '';
    },

    correctModelBeforeSet: (value: any) => {
      return value;
    },

    shouldSetValueForRealModelValue: (): boolean => {
      return isStructureTag() && vm.context;
    },

    isReadonly: (): boolean => {
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
    },

    getPlaceholder: () => {
      if (props.noPlaceholder) {
        return ' ';
      }

      return sharedFunctions.getTitle();
    },

    getParentByName: (instance: any, name: string) => {
      while (true) {
        const parent = instance.parent;

        if (!parent) {
          return null;
        }

        if (parent.type.__name === name) {
          return parent;
        }

        if (parent.type.__name === 'SchemaForm') {
          return null;
        }

        instance = parent;
      }
    },

    needXProcessTheField: (): boolean => {
      for (const propertyName of sharedFunctions.possibleOldXPropertyNames()) {
        if (_getPropertyDescription(propertyName)) {
          return true;
        }
      }

      for (const propertyName of sharedFunctions.possibleXPropertyNames()) {
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
    },

    processXFeaturesWrapped: () => {
      sharedFunctions.processXFeatures();
    }
  }

  updateInnerModel(props.model);

  function updateInnerModel(value: any) {
    vm.model = value;

    value = sharedFunctions.correctModelBeforeSet(value);

    if (isStructureTag() && vm.context) {
      setModelValueForStructureTagDescription(value);
    } else {
      im._previousValue = im._innerModel;

      const valuesDifferent = valueAndPreviousAreDifferent(value);

      if (!valuesDifferent) {
        return;
      }

      if (valuesDifferent || !isEqual(im._innerModel, value)) {
        im._innerModel = value;
        sharedFunctions.processInnerModelChanged();
      }
    }
  }

  watch(() => props?.model, (value: any) => {
    updateInnerModel(value);
  });

  function unregister() {
    if (schemaFormsProcessingHelper.isFormRegistered(sharedFunctions.getFormName())) {
      schemaFormsProcessingHelper.unRegisterField(im.refs?.self);
      im.registered = false;
    }
  }

  function registerField() {
    if (schemaFormsProcessingHelper.isFormRegistered(sharedFunctions.getFormName()) &&
      !im.registered) {
      schemaFormsProcessingHelper.registerField(im.refs?.self,
        im.refs?.parentObjectField || im.refs?.parentGroupField);
      im.registered = true;
    }
  }

  function createModel() {
    vm.model = {};
  }

  function deleteModel() {
    vm.model = undefined;
  }

  function getCustomValidationErrorMessage(): string {
    return props.description?.rawData?.errorMessage;
  }

  function isStructureTag(): boolean {
    return sharedFunctions.getDescription() && sharedFunctions.getDescription().structureTagDescription;
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

  function processXHidedForModelChanges(value?: boolean) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.shouldFieldBeHidden(props.description,
        _getPropertyDescription('xHide'), vm.context);
    }

    if (!isEqual(value, props.description.xHideValue)) {
      props.description.xHideValue = value;

      if (im.refs?.parentObjectField && im.refs.parentObjectField.processInnerElementVisibilityChanged) {
        im.refs.parentObjectField.processInnerElementVisibilityChanged();
      }
    }
  }

  function processXTitleForModelChanges(value?: string) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXTitleValue(props.description.xTitle, vm.context,
        props.description);
    }

    if (!isEqual(value, props.description.xTitleValue)) {
      props.description.xTitleValue = value;
    }
  }

  function processXDescriptionForModelChanges(value: string) {
    sharedFunctions.getDescription().xDescriptionValue = value;
  }

  function processXDefaultForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXDefaultValue(props.description.xDefault, vm.context, props.description);
    } else {
      value = schemaFormsProcessingHelper.resolveSpecialValue(value, props.description, vm.context, false);
    }

    if (!isEqual(value, props.description.xDefaultValue)) {
      const previousXDefaultValue = props.description.xDefaultValue;

      props.description.xDefaultValue = value;

      if (vm.model === props.description.default || vm.model === previousXDefaultValue) {
        vm.model = undefined;
      }

      if (props.description.isJoin) {
        sharedFunctions.correctExistingRelatorsValue();
      }

      // if (Array.isArray(vm.model)) {
      //   if (vm.model.length === 0 && !vm.context.resultModel._doc) {
      //     vm.model = undefined;
      //   }
      // }

      sharedFunctions.fillEmptyModel();
    }
  }

  function processXSetForModelChanges(value: any) {
    props.description.xSetValue = value;

    if (!isEqual(value, vm.model) && value !== undefined) {
      const parentPath = sharedFunctions.getParentPath();
      const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);

      if (parentModel) {
        parentModel[sharedFunctions.getDescription().name] = value;
      }
    }
  }

  function _getPropertyDescription(name: string) {
    let fieldDescription;

    const descriptionDescription = props.description?.description;

    if (descriptionDescription && isObject(descriptionDescription)) {
      fieldDescription = descriptionDescription;
    } else {
      fieldDescription = props.description;
    }

    let propertyDescription = fieldDescription.header?.[name];

    if (propertyDescription) {
      return propertyDescription;
    }

    propertyDescription = fieldDescription?.[name];

    if (propertyDescription) {
      return propertyDescription;
    }

    return null;
  }

  function setModelValueForStructureTagDescription(value: any) {
    const parentPath = sharedFunctions.getParentPath();
    const parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, parentPath);

    if (isUndefined(im._previousValue) && isUndefined(value)) {
      return;
    }

    const name = sharedFunctions.getDescription().name;

    im._previousValue = parentModel[name];

    if (!valueAndPreviousAreDifferent(value)) {
      return;
    }

    parentModel[name] = value;

    im._innerModel = undefined;

    sharedFunctions.processInnerModelChanged();
    schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
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
    im,
    vm,
    initDone,
    sharedFunctions
  }
}
