import {schemaFormsProcessingHelper} from '~/service/schema-forms/schemaFormsProcessing.service';
import type { BaseFieldEmits, BaseFieldProps, ComponentRefs } from '~/composables/schema-forms/useBaseField';
import { isUndefined, isEqual } from '~/service/utils';
import useBaseField from '~/composables/schema-forms/useBaseField';
import type { ComponentInternalInstance } from '@vue/runtime-core';


export interface BaseControlProps extends BaseFieldProps {

}

export interface BaseControlEmitsValue {
  componentName?: string;
}


export interface BaseControlEmits extends BaseFieldEmits {
  (e: 'initDone', value: BaseControlEmitsValue): void;
}


export default function useBaseControl(props: BaseControlProps, emits: BaseControlEmits): any {

  // @ViewChild('controlModel') public controlModel: NgModel;

  const baseFieldExport = useBaseField(props, emits);

  const {
    vm,
    im,
    sharedFunctions,
    initDone,
  } = baseFieldExport;


  const initFieldBase = sharedFunctions.initField;
  const doOnMountedBase = sharedFunctions.doOnMounted;
  const possibleOldXPropertyNamesBase = sharedFunctions.possibleOldXPropertyNames;
  const possibleXPropertyNamesBase = sharedFunctions.possibleXPropertyNames;
  const processXFeaturesBase = sharedFunctions.processXFeatures;


  function initField() {
    initFieldBase();

    refreshTitle();

    if (vm.model) {
      correctExistingValue();
    }

    fillDescriptionPattern();

    if (vm.model === undefined || vm.model === null) {
      sharedFunctions.fillEmptyModel();
    }

    emits('initDone', {componentName: vm.componentName});
  }


  function doOnMounted(componentInternalInstance: ComponentInternalInstance | null, validator?: any) {
    if (validator) {
      sharedFunctions.setValidation(validator);
    }

    doOnMountedBase(componentInternalInstance);
  }

  function refreshTitle() {
    props.description.controlTitle = sharedFunctions.getTitle();
  }

  function isValid(): boolean {
    if (im.$v) {
      return !im.$v.$error;
    }

    return true;
  }

  function touch() {
    if (im.$v) {
      im.$v.$touch();
    }
  }

  function trackByIndexFn(index: number, item: any) {
    return index;
  }

  function correctExistingValue() {
    if (props.description.isJoin) {
      sharedFunctions.correctExistingRelatorsValue();
      return;
    }

    if (vm.model && props.description.values) {
      if (Array.isArray(vm.model)) {
        for (const item of vm.model) {
          if (props.description.values.indexOf(item) === -1) {
            vm.model = [];
            break;
          }
        }
      } else {
        if (props.description.values.indexOf(vm.model) === -1) {
          vm.model = null;
        }
      }
    }
  }

  function fillDescriptionPattern() {
    if (props.description.pattern) {
      return;
    }
  }

  function possibleOldXPropertyNames() {
    return possibleOldXPropertyNamesBase().concat(['xCalculate', 'xReadonly', 'xConcatenate',
      'xMinimum', 'xMaximum', 'xRequired', 'xEnum']);
  }

  function possibleXPropertyNames() {
    // 'xEnum' should be here because it is possible to have text control that can be changed to
    // a select control with xEnum and ngModel changes
    return possibleXPropertyNamesBase().concat(['default', 'set', 'calculate', 'readonly', 'concatenate',
      'minimum', 'maximum', 'required', 'enum', 'x-enum']);
  }

  function processXFeatures() {
    const features: any = processXFeaturesBase();

    if (props.description.xCalculate) {
      processXCalculateForModelChanges();
    }

    if (props.description.xReadonly) {
      processXReadOnlyForModelChanges();
    }

    if (props.description.xConcatenate) {
      processXConcatenateForModelChanges();
    }

    if (props.description.xMinimum) {
      processXMinimumForModelChanges();
    }

    if (props.description.xMaximum) {
      processXMaximumForModelChanges();
    }

    if (props.description.xRequired) {
      processXRequiredForModelChanges();
    }

    if (props.description.xEnum) {
      processXEnumForModelChanges();
    }

    if ('calculate' in features) {
      if (isNaN(features['calculate'])) {
        processXCalculateForModelChanges(0);
      } else {
        processXCalculateForModelChanges(features['calculate']);
      }
    }

    if ('readOnly' in features) {
      processXReadOnlyForModelChanges(features['readOnly']);
    }

    if ('concatenate' in features) {
      processXConcatenateForModelChanges(features['concatenate']);
    }

    if ('minimum' in features) {
      processXMinimumForModelChanges(features['minimum']);
    }

    if ('maximum' in features) {
      processXMaximumForModelChanges(features['maximum']);
    }

    if ('required' in features) {
      processXRequiredForModelChanges(features['required']);
    }

    if ('enum' in features) {
      processXEnumForModelChanges(features['enum']);
    }

    if ('options' in features) {
      processXOptionsForModelChanges(features['options']);
    }

    if ('optionsPlus' in features) {
      processXOptionsForModelChanges(features['optionsPlus'], true);
    }

    if ('readonly' in features) {
      processXReadOnlyForModelChanges(features['readonly']);
    }

    refreshTitle();

    return features;
  }

  function processXMinimumForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXNumberValue(props.description.xMinimum, vm.context, props.description);
    }

    if (!isEqual(value, props.description.xMinimumValue)) {
      props.description.xMinimumValue = value;

      if (value !== undefined) {
        props.description.minimum = value;
      }
    }
  }

  function processXMaximumForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXNumberValue(props.description.xMaximum, vm.context, props.description);
    }

    if (!isEqual(value, props.description.xMaximumValue)) {
      props.description.xMaximumValue = value;

      if (value !== undefined) {
        props.description.maximum = value;
      }
    }
  }

  function processXRequiredForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = sharedFunctions.shouldBeRequired(props.description);
    }

    if (!isEqual(value, props.description.xRequiredValue)) {
      props.description.xRequiredValue = value;

      if (value !== undefined) {
        props.description.required = value;
      }
    }
  }

  function processXConcatenateForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXConcatenateValue(props.description.xConcatenate, vm.context);
    }

    if (!isEqual(value, props.description.xConcatenateValue)) {
      props.description.xConcatenateValue = value;

      if (value !== undefined) {
        vm.model = value.replace(/undefined/g, '').trim();
      }
    }
  }

  function processXCalculateForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXCalculatedValues(props.description, vm.context);
    }

    if (!isEqual(value, props.description.xCalculateValue)) {
      props.description.xCalculateValue = value;

      if (value !== undefined) {
        vm.model = value;
      }
    }
  }

  function processXReadOnlyForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXReadOnlyValue(props.description.xReadonly, vm.context);
    }

    if (!isEqual(value, props.description.xReadOnlyValue)) {

      props.description.xReadOnlyValue = value;

      if (value !== undefined) {
        props.description.readonly = value;
      }
    }
  }

  function processXEnumForModelChanges(value?: any) {
    if (isUndefined(value) || value['enum']) {
      value = schemaFormsProcessingHelper.getXEnumValues(props.description.xEnum, vm.context);
    }

    if (!isEqual(value, props.description.xEnumValues)) {
      props.description.xEnumValues = value;
      im.refs?.parentDynamicControl.setupState.sharedFunctions.processControlTypeChanges();
    }
  }

  function processXOptionsForModelChanges(value: any, plusMode: boolean = false) {
    if (!Array.isArray(value) && value.path) {
      const arrayValues = schemaFormsProcessingHelper.deepFindValueInContext(vm.context, value.path);
      value = schemaFormsProcessingHelper.prepareEnumValues(arrayValues, value.titlePath, value.valuePath);
    }

    if (!isEqual(value, props.description.xOptionsValues)) {
      props.description.xOptionsValues = value;
      props.description.xOptionsPlus = plusMode;
      im.refs?.parentDynamicControl.setupState.sharedFunctions.processControlTypeChanges();
    }
  }


  sharedFunctions.initField = initField;
  sharedFunctions.doOnMounted = doOnMounted;
  sharedFunctions.trackByIndexFn = trackByIndexFn;
  sharedFunctions.possibleOldXPropertyNames = possibleOldXPropertyNames;
  sharedFunctions.possibleXPropertyNames = possibleXPropertyNames;
  sharedFunctions.processXOptionsForModelChanges = processXOptionsForModelChanges;
  sharedFunctions.processXFeatures = processXFeatures;
  sharedFunctions.isValid = isValid;
  sharedFunctions.touch = touch;
  sharedFunctions.correctExistingValue = correctExistingValue;
  sharedFunctions.fillDescriptionPattern = fillDescriptionPattern;


  return {
    vm,
    im,
    sharedFunctions,
    initDone,
  }
}
