import { schemaFormsProcessingHelper } from '~/service/schema-forms/schemaFormsProcessing.service';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import { isEqual, isObject, isUndefined, difference, differenceWith, uniqBy, uniq } from '~/service/utils';


export default function useBaseSelectableControl(props: BaseControlProps, emits: BaseControlEmits): any {

  const baseFieldExport = useBaseControl(props, emits);

  let {
    vm,
    im,
    sharedFunctions,
  } = baseFieldExport;

  const initFieldBase = sharedFunctions.initField;
  const possibleXPropertyNamesBase = sharedFunctions.possibleXPropertyNames;
  const processXFeaturesBase = sharedFunctions.processXFeatures;
  const setModelBase = sharedFunctions.setModel;
  const getModelBase = sharedFunctions.getModel;
  const getDefaultValueBase = sharedFunctions.getDefaultValue;
  const fillEmptyModelBase = sharedFunctions.fillEmptyModel;
  const processXOptionsForModelChangesBase = sharedFunctions.processXOptionsForModelChanges;


  vm.filteredSelectValues = [];

  im.cachedPossibleValues = [];


  function initField() {
    initFieldBase();

    im.cachedPossibleValues = filterPossibleValues();
    _prepareSelectValues();
  }

  // TODO: test it
  watch(() => props, (value: any) => {
    _prepareSelectValues();
  });


  function querySearch(query: string, _possibleValues?: any[]): Array<any>  {
    const possibleValues = _possibleValues || filterPossibleValues();
    im.cachedPossibleValues = possibleValues;

    let notSelectedValues;

    if (props.model) {
      const valuesToExclude = Array.isArray(props.model) ? props.model : [props.model];

      notSelectedValues = differenceWith(possibleValues, valuesToExclude, function (arrVal: any, othVal: any) {
        if (arrVal.id) {
          return arrVal.id === othVal.id;
        }

        return arrVal === othVal;
      });
    } else {
      notSelectedValues = possibleValues;
    }

    const result = query ? notSelectedValues.filter(_createFilterFor(query)) : notSelectedValues;

    if (props.description.xRequireMatch === false || props.description.xOptionsPlus === true
      && query && !result.length) {
      result.push(query);
    }

    return result;
  }

  function autocompleteItemChange(item: any) {
    vm.model = item;
  }

  function getModel() {
    return getOptionForValueIfNeed(getModelBase());
  }

  function setModel(value: any) {
    if (props.description?.xOptionsValues && value?.value) {
      value = value.value;
    }

    setModelBase(value);
  }

  function processXFeatures() {
    const features = processXFeaturesBase();

    if (props.description.filter || props.description.xFilter || props.description.rawData?.filter) {
      _prepareSelectValues();

      if (im.needCorrectExistingValues) {
        correctExistingRelatorsValue();
      }
    }

    return features;
  }

  function fillEmptyModel() {
    fillEmptyModelBase();

    if (props.model === undefined) {
      const defaultValue = getDefaultValue();

      if (defaultValue === undefined) {
        if (props.description.values && !props.description.required) {
          vm.model = undefined;
        }
      }
    }
  }

  function _prepareSelectValues() {
    im.cachedPossibleValues = filterPossibleValues();

    let parentModel = schemaFormsProcessingHelper.deepFindValueInContext(vm.context,
      props.description.path, true);

    if (parentModel && Array.isArray(parentModel)) {
      // exclude self value
      parentModel = parentModel.filter((item: any) => {
        return item && item !== props.model;
      });
    } else {
      parentModel = [];
    }

    if (parentModel.length) {
      vm.filteredSelectValues = difference(im.cachedPossibleValues, parentModel);
    } else {
      vm.filteredSelectValues = im.cachedPossibleValues;
    }
  }

  function possibleXPropertyNames() {
    return possibleXPropertyNamesBase().concat(['filter']);
  }

  function getDefaultValue(): any {
    const defaultValue = getDefaultValueBase();
    if (isUndefined(defaultValue)) {
      return undefined;
    }

    let possibleValues = im.cachedPossibleValues;

    if (possibleValues && possibleValues[0] && isObject(possibleValues[0])) {
      possibleValues = possibleValues.map((item: any) => item.value || item.id);
    }

    if (possibleValues) {
      if (defaultValue instanceof Array) {
        return defaultValue.filter((item: any) => {
          return possibleValues.indexOf(item.id ?? item) !== -1;
        });
      } else {
        if (possibleValues.indexOf(defaultValue.id ?? defaultValue) === -1) {
          return undefined;
        }
      }
    }

    return defaultValue;
  }

  function filterPossibleValues(): Array<any> {
    let possibleValues;

    if (props.description.options) {
      possibleValues = props.description.options;
    } else if (props.description.xFilter) {
      possibleValues = schemaFormsProcessingHelper.filterFieldValues(props.description.xFilter,
        props.description.values, vm.context);
    } else if (props.description.rawData?.filter) {
      possibleValues = schemaFormsProcessingHelper.filterFieldValues2(props.description,
        props.description.values, vm.context);
    } else if (props.description.xEnumValues) {
      possibleValues = props.description.xEnumValues;
    } else if (props.description.xOptionsValues) {
      possibleValues = props.description.xOptionsValues;
    } else {
      possibleValues = props.description.values || [];
    }

    if (!im.needCorrectExistingValues && props.model) {
      if (Array.isArray(props.model)) {
        possibleValues = possibleValues.concat(props.model);
      } else if (possibleValues) {
        possibleValues.push(props.model);
      }
    }

    if (possibleValues) {
      if (isObject(possibleValues[0]) && possibleValues[0]['id']) {
        possibleValues = uniqBy(possibleValues, 'id');
      } else {
        possibleValues = uniq(possibleValues);
      }
    }

    return possibleValues;
  }

  function processXOptionsForModelChanges(value: any, plusMode: boolean = false) {
    processXOptionsForModelChangesBase(value, plusMode);

    if (!isUndefined(props.description.xOptionsValues)) {
      if (!plusMode) {
        updateModelOnValuesChanged(props.description.xOptionsValues);
      }

      _prepareSelectValues();
    }

    fillEmptyModel();
  }

  function processXEnumForModelChanges(value: boolean) {
    if (!isEqual(value, props.description.xEnumValues)) {
      props.description.xEnumValues = value;

      if (props.description.xEnumValues !== undefined) {
        if (props.description.xEnumValues === null) {
          // nothing to do
        } else if (props.description.xRequireMatch !== false) {
          updateModelOnValuesChanged(props.description.xEnumValues);
        }

        _prepareSelectValues();
      }

      fillEmptyModel();
    }
  }

  function updateModelOnValuesChanged(values: any[]) {
    if (values[0] && isObject(values[0])) {
      values = values.map((item: any) => item.value);
    }

    if (Array.isArray(props.model)) {
      vm.model = vm.model.filter((item: any) => {
        return item && values.indexOf(item.value || item) !== -1;
      });

      // if (vm.model.length === 0 && !vm.context.resultModel._doc) {
      //   vm.model = null;
      // }

    } else {
      if (props.model && values.indexOf(props.model.value || props.model) === -1) {
        vm.model = null;
      }
    }
  }

  function correctExistingRelatorsValue() {
    if (!props.model) {
      return;
    }

    const possibleValues = im.cachedPossibleValues;

    if (props.description.isJoin && possibleValues && im.needCorrectExistingValues) {
      if (Array.isArray(props.model)) {
        props.model.filter((item: any) => {
          return !!item && !!sharedFunctions.findRelatorProperty(item, possibleValues);
        });

        props.model.forEach((modelItem: any) => {
          const possibleRelator = sharedFunctions.findRelatorProperty(modelItem, possibleValues);
          if (possibleRelator) {
            modelItem.title = possibleRelator.title;
          }
        });
      } else if (props.model) {
        const possibleRelator = sharedFunctions.findRelatorProperty(props.model, possibleValues);

        if (!possibleRelator) {
          vm.model = undefined;
        } else {
          vm.model.title = possibleRelator.title;
        }
      }
    }
  }

  function getOptionForValueIfNeed(value: any) {
    if (props.description && props.description.xOptionsValues &&
      isObject(props.description.xOptionsValues[0])) {
      const optionValue = props.description.xOptionsValues.find((item: any) => item.value === value);

      if (optionValue) {
        return optionValue;
      }
    }

    return value;
  }

  function _createFilterFor(query: string): any {
    const lowercaseQuery = query.toLowerCase();
    return function filterFn(value: any) {
      return ((value.title || value).toLowerCase().indexOf(lowercaseQuery) !== -1);
    };
  }


  sharedFunctions.initField = initField;
  sharedFunctions.possibleXPropertyNames = possibleXPropertyNames;
  sharedFunctions.processXFeatures = processXFeatures;
  sharedFunctions.setModel = setModel;
  sharedFunctions.getModel = getModel;
  sharedFunctions.getDefaultValue = getDefaultValue;
  sharedFunctions.fillEmptyModel = fillEmptyModel;
  sharedFunctions.processXOptionsForModelChanges = processXOptionsForModelChanges;
  sharedFunctions.processXEnumForModelChanges = processXEnumForModelChanges;
  sharedFunctions.filterPossibleValues = filterPossibleValues;
  sharedFunctions.querySearch = querySearch;

  return {
    vm,
    im,
    sharedFunctions,
  }
}
