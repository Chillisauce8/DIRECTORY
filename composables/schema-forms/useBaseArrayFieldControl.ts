import {schemaFormsProcessingHelper} from '~/service/schema-forms/schemaFormsProcessing.service';
import type { BaseFieldEmits, BaseFieldProps, ComponentRefs } from '~/composables/schema-forms/useBaseField';
import { isUndefined, isEqual, isNumber, cloneDeep, uniq } from '~/service/utils';
import { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { extend } from 'vue-extend-reactive';


export default function useBaseArrayFieldControl(props: BaseControlProps, emits: BaseFieldEmits): any {

  // @ViewChild('controlModel') public controlModel: NgModel;

  const baseFieldExport = useBaseControl(props, emits);

  let {
    vm,
    sharedFunctions,
  } = baseFieldExport;

  vm = extend(vm, {
    initialDescription: undefined,
    rowDescriptions: [],
    needCheckUniq: false,
    defaultMinimum: undefined,
    defaultMaximum: undefined,
  });

  const initFieldBase = sharedFunctions.initField;
  const processXFeaturesBase = sharedFunctions.processXFeatures;


  function initField() {
    vm.initialDescription = cloneDeep(props.description);

    vm.rowDescriptions = [];
    vm.defaultMinimum = props.description.minimum;
    vm.defaultMaximum = props.description.maximum;

    if (!vm.model || !Array.isArray(vm.model)) {
      vm.model = [];
    }

    if (isRequired()) {
      if (!vm.model.length) {
        vm.model.push(_createModelRow());
      }
    }

    _createDescriptionsForAllRows();

    initFieldBase();
  }

  function doOnMounted() {
    initField();
    // call this if description was set after model was set!
    sharedFunctions.afterFieldInit();
  }

  function isValid(): boolean {
    return isValidMaxItems() && isValidMinItems() && ifValidUniqueItems();
  }

  function isRequired(): boolean {
    return props.description.required;
  }

  function _createDescriptionsForAllRows() {
    // @ts-ignore
    vm.model.forEach(() => vm.rowDescriptions.push(_createModelDescription()));

    onRowsDescriptionChanged();
  }

  function _createModelRow() {
    return {};
  }

  function _createModelDescription(): any {
    return cloneDeep(vm.initialDescription);
  }

  function canAddMore(): boolean {
    if (!vm.model) {
      return false;
    }

    if (isUndefined(props.description.maximum) || props.description.maximum === null) {
      return true;
    }

    return vm.model.length < props.description.maximum;
  }

  function canRemoveMore(): boolean {
    if (!vm.model) {
      return false;
    }

    if (isUndefined(props.description.minimum)) {
      return true;
    }

    return vm.model.length > props.description.minimum;
  }

  function addFirstRow() {
    if (!canAddMore()) {
      return;
    }

    vm.model.push(_createModelRow());

    // @ts-ignore
    vm.rowDescriptions.push(_createModelDescription());

    onRowsDescriptionChanged();
  }

  function addRowAfter(index: number) {
    if (!canAddMore()) {
      return;
    }

    vm.model.splice(index + 1, 0, _createModelRow());

    // @ts-ignore
    vm.rowDescriptions.splice(index + 1, 0, _createModelDescription());

    onRowsDescriptionChanged();
  }

  function copyRow(index: number) {
    if (!canAddMore()) {
      return;
    }

    vm.model.splice(index + 1, 0, cloneDeep(vm.model[index]));

    // @ts-ignore
    vm.rowDescriptions.splice(index + 1, 0, cloneDeep(vm.rowDescriptions[index]));

    onRowsDescriptionChanged();
  }

  function deleteRow(index: number) {
    if (!canRemoveMore()) {
      return;
    }

    if (vm.model.length === 1 && isRequired()) {
      return;
    }

    if (index < vm.model.length - 1 && needToShowDeleteArrayItemsDialog()) {
      // TODO:
      // deleteArrayItemsDialog.show()
      //   .pipe(
      //     tap((result: ICommonDialogResult) => {
      //       if (result?.canceled || !result?.data) {
      //         return;
      //       }
      //
      //       switch (result.data) {
      //         case DeleteArrayItemsAction.deleteThisRow:
      //           deleteArrayItems(index, 1);
      //           break;
      //         case DeleteArrayItemsAction.deleteThisAndAllRowsBelow:
      //           deleteArrayItems(index, vm.model.length - index);
      //           break;
      //         default:
      //           break;
      //       }
      //     }),
      //   )
      //   .subscribe();
    } else {
      deleteArrayItems(index, 1);
    }
  }

  function moveRowUp(index: number) {
    vm.model.splice(index - 1, 0, vm.model.splice(index, 1)[0]);
    vm.rowDescriptions.splice(index - 1, 0, vm.rowDescriptions.splice(index, 1)[0]);

    onRowsDescriptionChanged();
  }

  function moveRowDown(index: number) {
    vm.model.splice(index + 1, 0, vm.model.splice(index, 1)[0]);
    vm.rowDescriptions.splice(index + 1, 0, vm.rowDescriptions.splice(index, 1)[0]);

    onRowsDescriptionChanged();
  }

  function onRowsDescriptionChanged() {
    vm.needCheckUniq = true;
    sharedFunctions.processInnerModelChanged();
    schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
  }

  function shouldItemBeConstructed(description: any, index: number) {
    const filedName = props.description.header ? props.description.header.name : props.description.name;
    const context = sharedFunctions.createInnerFieldContext(filedName, index);
    return sharedFunctions.shouldBeConstructed(description, context);
  }

  function isValidMaxItems(): boolean {
    if (!vm.model || isUndefined(props.description.maximum) || props.description.maximum === null) {
      return true;
    }

    return vm.model.length <= props.description.maximum;
  }

  function isValidMinItems(): boolean {
    if (!vm.model || isUndefined(props.description.minimum) || props.description.minimum === null) {
      return true;
    }

    return vm.model.length >= props.description.minimum;
  }

  function ifValidUniqueItems(): boolean {
    if (!vm.needCheckUniq) {
      return true;
    }

    if (props.description.xUniqueItems === false) {
      return true;
    }

    if (!vm.model || !vm.model.length) {
      return true;
    }

    return vm.model.length === uniq(vm.model).length;
  }

  function isSelection(): boolean {
    return !!props.description?.rawData?.selection;
  }

  function getSelectionData(): string[] {
    return props.description?.rawData?.selection;
  }

  function needToShowDeleteArrayItemsDialog(): boolean {
    return true;
  }

  function processXFeatures() {
    const features = processXFeaturesBase();

    if (props.description.xMinItems) {
      processXMinItemsForModelChanges();
    }

    if (props.description.xMaxItems) {
      processXMaxItemsForModelChanges();
    }

    return features;
  }

  function processXMinItemsForModelChanges() {
    if (isNumber(props.description.xMinItems)) {
      return props.description.xMinItems;
    }

    const res = schemaFormsProcessingHelper.getXNumberValue(props.description.xMinItems,
      vm.context, props.description);

    if (!isEqual(res, props.description.xMinItemsValue)) {

      props.description.xMinItemsValue = res;

      if (res !== undefined) {
        props.description.minimum = res;
      } else {
        props.description.minimum = vm.defaultMinimum;
      }
    }
  }

  function processXMaxItemsForModelChanges() {
    if (isNumber(props.description.xMaxItems)) {
      return props.description.xMaxItems;
    }

    const res = schemaFormsProcessingHelper.getXNumberValue(props.description.xMaxItems,
      vm.context, props.description);

    if (!isEqual(res, props.description.xMaxItemsValue)) {

      props.description.xMaxItemsValue = res;

      if (res !== undefined) {
        props.description.maximum = res;
      } else {
        props.description.maximum = vm.defaultMaximum;
      }
    }
  }

  function deleteArrayItems(start: number, deleteCount?: number) {
    vm.model.splice(start, deleteCount);
    vm.rowDescriptions.splice(start, deleteCount);
    onRowsDescriptionChanged();
  }


  sharedFunctions.initField = initField;
  sharedFunctions.doOnMounted = doOnMounted;
  sharedFunctions.onRowsDescriptionChanged = onRowsDescriptionChanged;
  sharedFunctions.isSelection = isSelection;
  sharedFunctions.getSelectionData = getSelectionData;
  sharedFunctions.processXFeatures = processXFeatures;
  sharedFunctions.shouldItemBeConstructed = shouldItemBeConstructed;
  sharedFunctions.canAddMore = canAddMore;
  sharedFunctions.canRemoveMore = canRemoveMore;
  sharedFunctions.addFirstRow = addFirstRow;
  sharedFunctions.addRowAfter = addRowAfter;
  sharedFunctions.copyRow = copyRow;
  sharedFunctions.deleteRow = deleteRow;
  sharedFunctions.moveRowUp = moveRowUp;
  sharedFunctions.moveRowDown = moveRowDown;
  sharedFunctions.isValidMaxItems = isValidMaxItems;
  sharedFunctions.isValidMinItems = isValidMinItems;
  sharedFunctions.ifValidUniqueItems = ifValidUniqueItems;


  return {
    vm,
    sharedFunctions,
  };
}
