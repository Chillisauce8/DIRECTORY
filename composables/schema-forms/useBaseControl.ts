import {schemaFormsProcessingHelper} from '~/service/schema-forms/schemaFormsProcessing.service';
import {xFeaturesHelper} from '~/service/schema-forms/xFeaturesHelper';
import { BaseFieldEmits, BaseFieldProps, ComponentRefs } from '~/composables/schema-forms/useBaseField';
import { isUndefined, isEqual } from '~/service/utils';
import useBaseField from '~/composables/schema-forms/useBaseField';


export interface BaseControlProps extends BaseFieldProps {
  noPlaceholder: boolean;
}


export default function useBaseControl(props: BaseControlProps, emits: BaseFieldEmits, refs: ComponentRefs) {

  // @ViewChild('controlModel') public controlModel: NgModel;

  const baseFieldExport = useBaseField(props, emits, refs);

  const {
    getTitle,
    initField: initFieldBase,
    possibleOldXPropertyNames: possibleOldXPropertyNamesBase,
    possibleXPropertyNames: possibleXPropertyNamesBase,
    processXFeatures: processXFeaturesBase,
    fillEmptyModel,
    correctExistingRelatorsValue,
    shouldBeRequired,
    afterFieldInit,
  } = baseFieldExport;

  const im = {
    _needCorrectExistingValues: refs.form?.needCorrectExistingValues || false,
    placeholderValue: undefined,
  }


  function initField() {
    initFieldBase();

    refreshPlaceholder();

    if (props.model) {
      correctExistingValue();
    }

    fillDescriptionPattern();

    if (props.model === undefined || props.model === null) {
      fillEmptyModel();
    }
  }

  function doOnMounted() {
    initField();

    // call this if description was set after model was set!
    afterFieldInit();
  }

  function trackByIndexFn(index: number, item: any) {
    return index;
  }

  function getPlaceholder() {
    if (props.noPlaceholder) {
      return ' ';
    }

    return getTitle();
  }

  function refreshPlaceholder() {
    im.placeholderValue = getPlaceholder();
  }

  // TODO: ***
  function isValid(): boolean {
    // if (!controlModel) {
    //   return true;
    // }
    //
    // return controlModel.valid;

    return false;
  }

  // TODO: ***
  function touch() {
    // if (controlModel) {
    //   controlModel.control.markAsTouched();
    //   changeDetectorRef.markForCheck();
    // }

    throw 'Not implemented'
  }

  function correctExistingValue() {
    if (props.description.isJoin) {
      correctExistingRelatorsValue();
      return;
    }

    if (props.model && props.description.values) {
      if (Array.isArray(props.model)) {
        for (const item of props.model) {
          if (props.description.values.indexOf(item) === -1) {
            props.model = [];
            break;
          }
        }
      } else {
        if (props.description.values.indexOf(props.model) === -1) {
          props.model = null;
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

    refreshPlaceholder();

    return features;
  }

  function processXMinimumForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXNumberValue(props.description.xMinimum, props.context, props.description);
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
      value = schemaFormsProcessingHelper.getXNumberValue(props.description.xMaximum, props.context, props.description);
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
      value = shouldBeRequired(props.description);
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
      value = schemaFormsProcessingHelper.getXConcatenateValue(props.description.xConcatenate, props.context);
    }

    if (!isEqual(value, props.description.xConcatenateValue)) {
      props.description.xConcatenateValue = value;

      if (value !== undefined) {
        props.model = value.replace(/undefined/g, '').trim();
      }
    }
  }

  function processXCalculateForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXCalculatedValues(props.description, props.context);
    }

    if (!isEqual(value, props.description.xCalculateValue)) {
      props.description.xCalculateValue = value;

      if (value !== undefined) {
        props.model = value;
      }
    }
  }

  function processXReadOnlyForModelChanges(value?: any) {
    if (isUndefined(value)) {
      value = schemaFormsProcessingHelper.getXReadOnlyValue(props.description.xReadonly, props.context);
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
      value = schemaFormsProcessingHelper.getXEnumValues(props.description.xEnum, props.context);
    }

    if (!isEqual(value, props.description.xEnumValues)) {
      props.description.xEnumValues = value;
      refs.parentDynamicControl.processControlTypeChanges();
    }
  }

  function processXOptionsForModelChanges(value: any, plusMode: boolean = false) {
    if (!Array.isArray(value) && value.path) {
      const arrayValues = schemaFormsProcessingHelper.deepFindValueInContext(props.context, value.path);
      value = schemaFormsProcessingHelper.prepareEnumValues(arrayValues, value.titlePath, value.valuePath);
    }

    if (!isEqual(value, props.description.xOptionsValues)) {
      props.description.xOptionsValues = value;
      props.description.xOptionsPlus = plusMode;
      refs.parentDynamicControl.processControlTypeChanges();
    }
  }


  return {
    ...baseFieldExport,
    trackByIndexFn,
    getPlaceholder,
    initField,
    possibleOldXPropertyNames,
    possibleXPropertyNames,
    processXFeatures,
    doOnMounted,
  }
}
