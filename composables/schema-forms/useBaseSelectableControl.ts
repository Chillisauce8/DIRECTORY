import { schemaFormsProcessingHelper } from '~/service/schema-forms/schemaFormsProcessing.service';
import useBaseControl, { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import { BaseFieldEmits, ComponentRefs } from '~/composables/schema-forms/useBaseField';
import { isEqual, isObject, isUndefined, difference, differenceWith, uniqBy, uniq } from '~/service/utils';


export default function useBaseSelectableControl(props: BaseControlProps, emits: BaseFieldEmits, refs: ComponentRefs): any {

  // @ViewChild('controlModel') public controlModel: NgModel;

  const baseFieldExport = useBaseControl(props, emits, refs);

  const {
    initField: initFieldBase,
    possibleOldXPropertyNames: possibleOldXPropertyNamesBase,
    possibleXPropertyNames: possibleXPropertyNamesBase,
    processXFeatures: processXFeaturesBase,
    setModel: setModelBase,
    getModel: getModelBase,
    getDefaultValue: getDefaultValueBase,
    fillEmptyModel: fillEmptyModelBase,
    processXOptionsForModelChanges: processXOptionsForModelChangesBase,
    afterFieldInit,
    findRelatorProperty,
    im,
  } = baseFieldExport;

  let filteredSelectValues = ref([]);
  let cachedPossibleValues: Array<any>;


  function initField() {
    initFieldBase();

    cachedPossibleValues = _filterPossibleValues();
    _prepareSelectValues();
  }

  // TODO:
  // ngOnChanges(changes: SimpleChanges) {
  //   if (!!cachedPossibleValues) {
  //     this._prepareSelectValues();
  //   }
  // }

  function doOnMounted() {
    initField();

    // call this if description was set after model was set!
    afterFieldInit();
  }

  function querySearch(query: string, _possibleValues?: any[]): Array<any>  {
    const possibleValues = _possibleValues || _filterPossibleValues();
    cachedPossibleValues = possibleValues;

    const notSelectedValues = differenceWith(possibleValues, props.model, function(arrVal: any, othVal: any) {
      if (arrVal.id) {
        return arrVal.id === othVal.id;
      }

      return arrVal === othVal;
    });

    const result = query ? notSelectedValues.filter(_createFilterFor(query)) : notSelectedValues;

    if (props.description.xRequireMatch === false || props.description.xOptionsPlus === true
      && query && !result.length) {
      result.push(query);
    }

    return result;
  }

  function autocompleteItemChange(item: any) {
    props.model = item;
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

      if (im._needCorrectExistingValues) {
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
          props.model = undefined;
        }
      }
    }
  }

  function _prepareSelectValues() {
    cachedPossibleValues = _filterPossibleValues();

    let parentModel = schemaFormsProcessingHelper.deepFindValueInContext(props.context,
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
      filteredSelectValues.values = difference(cachedPossibleValues, parentModel);
    } else {
      filteredSelectValues.values = cachedPossibleValues;
    }
  }

  function possibleOldXPropertyNames() {
    return possibleOldXPropertyNamesBase().concat(['xFilter']);
  }

  function possibleXPropertyNames() {
    return possibleXPropertyNamesBase().concat(['filter']);
  }

  function getDefaultValue(): any {
    const defaultValue = getDefaultValueBase();
    if (isUndefined(defaultValue)) {
      return undefined;
    }

    let possibleValues = cachedPossibleValues;

    if (possibleValues && possibleValues[0] && isObject(possibleValues[0])) {
      possibleValues = possibleValues.map(item => item.value || item.id);
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

  function _filterPossibleValues(): Array<any> {
    let possibleValues;

    if (props.description.xFilter) {
      possibleValues = schemaFormsProcessingHelper.filterFieldValues(props.description.xFilter,
        props.description.values, props.context);
    } else if (props.description.rawData?.filter) {
      possibleValues = schemaFormsProcessingHelper.filterFieldValues2(props.description,
        props.description.values, props.context);
    } else if (props.description.xEnumValues) {
      possibleValues = props.description.xEnumValues;
    } else if (props.description.xOptionsValues) {
      possibleValues = props.description.xOptionsValues;
    } else {
      possibleValues = props.description.values || [];
    }

    if (!im._needCorrectExistingValues && props.model) {
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

  function processXEnumForModelChanges(value?: boolean) {
    if (!value) {
      value = schemaFormsProcessingHelper.getXEnumValues(props.description.xEnum, props.context);
    }

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
      props.model = props.model.filter((item: any) => {
        return item && values.indexOf(item.value || item) !== -1;
      });

      // if (props.model.length === 0 && !props.context.resultModel._doc) {
      //   props.model = null;
      // }
    } else {
      if (props.model && values.indexOf(props.model.value || props.model) === -1) {
        props.model = null;
      }
    }
  }

  function correctExistingRelatorsValue() {
    if (!props.model) {
      return;
    }

    const possibleValues = cachedPossibleValues;

    if (props.description.isJoin && possibleValues && im._needCorrectExistingValues) {
      if (Array.isArray(props.model)) {
        props.model.filter((item: any) => {
          return !!item && !!findRelatorProperty(item, possibleValues);
        });

        props.model.forEach((modelItem: any) => {
          const possibleRelator = findRelatorProperty(modelItem, possibleValues);
          if (possibleRelator) {
            modelItem.title = possibleRelator.title;
          }
        });
      } else if (props.model) {
        const possibleRelator = findRelatorProperty(props.model, possibleValues);

        if (!possibleRelator) {
          props.model = undefined;
        } else {
          props.model.title = possibleRelator.title;
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

  return {
    ...baseFieldExport,
    doOnMounted,
  }
}
