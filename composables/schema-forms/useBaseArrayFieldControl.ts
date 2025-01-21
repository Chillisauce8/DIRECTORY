import {schemaFormsProcessingHelper} from '~/service/schema-forms/schemaFormsProcessing.service';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { isUndefined, isEqual, isNumber, cloneDeep, uniq } from '~/service/utils';
import type { ComponentInternalInstance } from '@vue/runtime-core';
import useBaseField from '~/composables/schema-forms/useBaseField';


export default function useBaseArrayFieldControl(props: BaseFieldProps, emits: BaseFieldEmits): any {

  const baseFieldExport = useBaseField(props, emits);

  const confirm = useConfirm();

  let {
    vm,
    sharedFunctions,
    initDone,
  } = baseFieldExport;

  vm.initialDescription = undefined;
  vm.rowDescriptions = [];
  vm.needCheckUniq = false;
  vm.defaultMinimum = undefined;
  vm.defaultMaximum = undefined;

  const doOnMountedBase = sharedFunctions.doOnMounted;
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
        vm.model.push(sharedFunctions.createModelRow());
      }
    }

    _createDescriptionsForAllRows();

    initFieldBase();
  }

  function doOnMounted(instance: ComponentInternalInstance | null) {
    doOnMountedBase(instance);
    initField();
    // call this if description was set after model was set!
    sharedFunctions.afterFieldInit();
  }

  function isValid(): boolean {
    return sharedFunctions.isValidMaxItems() && sharedFunctions.isValidMinItems() && sharedFunctions.ifValidUniqueItems();
  }

  function isRequired(): boolean {
    return props.description.required;
  }

  function _createDescriptionsForAllRows() {
    // @ts-ignore
    vm.model.forEach(() => vm.rowDescriptions.push(_createModelDescription()));

    sharedFunctions.onRowsDescriptionChanged();
  }

  function createModelRow() {
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
    if (!sharedFunctions.canAddMore()) {
      return;
    }

    vm.model.push(sharedFunctions.createModelRow());

    // @ts-ignore
    vm.rowDescriptions.push(_createModelDescription());

    sharedFunctions.onRowsDescriptionChanged();
  }

  function addRowAfter(index: number) {
    if (!sharedFunctions.canAddMore()) {
      return;
    }

    vm.model.splice(index + 1, 0, sharedFunctions.createModelRow());

    // @ts-ignore
    vm.rowDescriptions.splice(index + 1, 0, _createModelDescription());

    sharedFunctions.onRowsDescriptionChanged();
  }

  function copyRow(index: number) {
    if (!sharedFunctions.canAddMore()) {
      return;
    }

    vm.model.splice(index + 1, 0, cloneDeep(vm.model[index]));

    // @ts-ignore
    vm.rowDescriptions.splice(index + 1, 0, cloneDeep(vm.rowDescriptions[index]));

    sharedFunctions.onRowsDescriptionChanged();
  }

  function deleteRow(index: number) {
    if (!sharedFunctions.canRemoveMore()) {
      return;
    }

    if (vm.model.length === 1 && isRequired()) {
      return;
    }

    if (index < vm.model.length - 1 && needToShowDeleteArrayItemsDialog()) {
      confirm.require({
        message: 'What should be Deleted?',
        header: 'Delete Array Items',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: 'Delete this and all rows below',
          // severity: 'secondary',
          outlined: true
        },
        acceptProps: {
          label: 'Delete this row',
        },
        accept: () => {
          deleteArrayItems(index, 1);
        },
        reject: () => {
          deleteArrayItems(index, vm.model.length - index);
        }
      });
    } else {
      deleteArrayItems(index, 1);
    }
  }

  function moveRowUp(index: number) {
    vm.model.splice(index - 1, 0, vm.model.splice(index, 1)[0]);
    vm.rowDescriptions.splice(index - 1, 0, vm.rowDescriptions.splice(index, 1)[0]);

    sharedFunctions.onRowsDescriptionChanged();
  }

  function moveRowDown(index: number) {
    vm.model.splice(index + 1, 0, vm.model.splice(index, 1)[0]);
    vm.rowDescriptions.splice(index + 1, 0, vm.rowDescriptions.splice(index, 1)[0]);

    sharedFunctions.onRowsDescriptionChanged();
  }

  function onRowsDescriptionChanged() {
    vm.needCheckUniq = true;
    sharedFunctions.processInnerModelChanged();
    schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
  }

  function shouldItemBeConstructed(description: any, index: number) {
    const filedName = description.header ? description.header.name : description.name;
    const context = sharedFunctions.createInnerFieldContext(props.context, filedName, index);
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
      props.context, props.description);

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
      props.context, props.description);

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
    sharedFunctions.onRowsDescriptionChanged();
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
  sharedFunctions.createModelRow = createModelRow;


  return {
    vm,
    sharedFunctions,
    initDone,
  };
}
