<template>
    <section :class="sharedFunctions.prepareClasses('array')" :id="props.description.id">
        <template v-if="initDone && sharedFunctions.shouldBeConstructed(props.description.header)"
             v-show="!props.description.xHideValue">
          <div class="array-of-object-header">
            <h1 class="title array-of-object" v-if="props.description.header.title">
                {{ sharedFunctions.getTitle() }}

                <span v-if="sharedFunctions.getDescriptionText()"
                      v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                    <SvgIcon svg="info" />
                </span>
              </h1>

              <SpeedDial v-if="vm.model?.length" :model="createSpeedDialItems()" direction="left" />
            </div>

            <div class="field-block">
              <template v-for="(row, rowIndex) in vm.model" :key="rowIndex">
                  <template v-for="(line, lineIndex) in vm.linesForRows[rowIndex]" v-show="!isWholeLineHidden(line)">
                    <template v-for="(item, itemIndex) in line">
                          <template :style="{ width: item.description.xFlex + '%' }"
                               v-if="sharedFunctions.shouldItemBeConstructed(item.description, rowIndex)"
                               v-tooltip.bottom="sharedFunctions.getDescriptionText(item)">
                              <DynamicField
                                  v-if="item.blockComponent === BlockComponents.value"
                                  :description="item.description"
                                  :model="vm.model[rowIndex][item.description.name]"
                                  :context="sharedFunctions.createInnerFieldContext(props.description.header.name, rowIndex)"
                                  @modelChange="onModelChange(rowIndex, item.description.name, $event)">
                              </DynamicField>

                            <template v-if="item.blockComponent !== BlockComponents.value">
                              <DynamicFieldBlock
                                  :description="item"
                                  :model="vm.model[rowIndex]"
                                  :context="sharedFunctions.createInnerFieldContext(props.description.header.name, rowIndex)"
                                  @modelChange="onModelChange(rowIndex, null, $event)">
                              </DynamicFieldBlock>
                          </template>
                      </template>
                  </template>
                </template>
              </template>

              <div v-if="!vm.model?.length">
                  <Button icon="pi pi-plus" aria-label="Add First Row"
                          v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore() && vm.isSelectionMode">
                  </Button>

                  <Button icon="pi pi-plus" aria-label="Add First Row"
                          v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore() && !vm.isSelectionMode"
                          @click="addFirstRow()">
                  </Button>
              </div>
            </div>

            <ContextMenu ref="menu" :model="getContextMenuItems(vm.selectionValues)" />

            <div v-if="!sharedFunctions.isValidMaxItems()"
                 class="text-color_red field_wrap">Max items value is {{ props.description.xMaxItemsValue }}</div>

            <div v-if="!sharedFunctions.isValidMinItems()"
                 class="text-color_red field_wrap">Min items value is {{ props.description.xMinItemsValue }}</div>

            <div v-if="!ifValidUniqueItems()" class="text-color_red field_wrap">Items are not unique</div>
        </template>
    </section>
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { uniqWith } from '~/service/utils';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import { getCurrentInstance } from 'vue';
import { BlockComponents } from '~/service/schema-forms/blockComponents';

// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


let { vm, sharedFunctions, initDone } = useBaseArrayFieldControl(props, emits);

const initFieldBase = sharedFunctions.initField;
const addRowAfterBase = sharedFunctions.addRowAfter;
const addFirstRowBase = sharedFunctions.addFirstRow;
const onRowsDescriptionChangedBase = sharedFunctions.onRowsDescriptionChanged;

vm = extend(vm, {
    isSelectionMode: false,
    selectionValues: [],
    linesForRows: [],
    selectedSelectionValue: undefined,
    selectionRowIndex: -1
});

watch(
    () => props?.model,
    (value: any) => {
        initField();
    }
);

function initField() {
    vm.isSelectionMode = sharedFunctions.isSelection();

    if (vm.isSelectionMode) {
        vm.selectionValues = sharedFunctions.getSelectionData();
    }

    initFieldBase();
}

onMounted(() => {
    const instance = getCurrentInstance();
    sharedFunctions.doOnMounted(instance);
});

onDeactivated(() => {
    sharedFunctions.onDeactivated();
});

function isValid(): boolean {
    return sharedFunctions.isValidMaxItems() && sharedFunctions.isValidMinItems() && sharedFunctions.ifValidUniqueItems();
}

function touch() {
    //
}

function showSpeedDeal(lineIndex: number, line: any[], rowIndex: number, itemIndex: number): boolean {
  return !sharedFunctions.isReadonly() &&
    lineIndex === vm.linesForRows[rowIndex].length - 1 &&
    itemIndex === line.length - 1;
}

function getContextMenuItems(selectionValues: string[]) {
    return selectionValues.map((item: string) => {
        return {
            label: item,
            command: () => onSelectionClick(item)
        };
    });
}

function createSpeedDialItems() {
    const index = vm.model.length - 1;
    return [
        {
            icon: 'pi pi-plus',
            command: () => openContextMenu(index),
            visible: () => sharedFunctions.canAddMore() && vm.isSelectionMode
        },
        {
            icon: 'pi pi-plus',
            command: () => addRowAfter(index),
            visible: () => sharedFunctions.canAddMore() && !vm.isSelectionMode
        },
        {
            icon: 'pi pi-times',
            command: () => sharedFunctions.deleteRow(index),
            visible: () => sharedFunctions.canRemoveMore() && !(props.description.header.required && index === 0 && vm.model.length === 1)
        },
        {
            icon: 'pi pi-chevron-up',
            command: () => sharedFunctions.moveRowUp(index),
            visible: () => index !== 0
        },
        {
            icon: 'pi pi-chevron-down',
            command: () => sharedFunctions.moveRowDown(index),
            visible: () => index !== vm.model.length - 1
        },
        {
            icon: 'pi pi-clone',
            command: () => sharedFunctions.copyRow(index),
            visible: () => sharedFunctions.canAddMore()
        }
    ];
}

function isRequired(): boolean {
    return props.description.header.required;
}

function openContextMenu(index: number) {
    throw 'Not implemented';
}

function onRowsDescriptionChanged() {
    updateLinesForRows();

    onRowsDescriptionChangedBase();
}

function updateLinesForRows() {
    vm.linesForRows = [];

    if (!vm.rowDescriptions) {
        return;
    }

    for (let i = 0; i < vm.rowDescriptions.length; ++i) {
        vm.linesForRows.push(_getLinesItems(i));
    }
}

function addFirstRow() {
    if (!sharedFunctions.canAddMore()) {
        return;
    }

    if (vm.isSelectionMode) {
        return;
    }

    addFirstRowBase();
}

function addRowAfter(rowIndex: number) {
    if (!sharedFunctions.canAddMore()) {
        return;
    }

    if (vm.isSelectionMode) {
        vm.selectionRowIndex = rowIndex;
        return;
    }

    addRowAfterBase(rowIndex);
}

function onSelectionClick(value: string) {
    vm.selectedSelectionValue = value;

    if (vm.selectionRowIndex !== -1) {
        addRowAfterBase(vm.selectionRowIndex);
        vm.selectionRowIndex = -1;
    } else {
        addFirstRowBase();
    }
}

function _getLinesItems(rowIndex: number): Array<Array<any>> {
    const lines = [[]];

    vm.rowDescriptions[rowIndex].content.forEach((item: any) => {
        const lineNumber = _getLineNumber(item.description);

        while (lineNumber >= lines.length) {
            lines.push([]);
        }

        if (item.description && item.description.values) {
            item.description.values = [...item.description.values];
        } else if (item.values) {
            item.values = [...item.values];
        }

        lines[lineNumber].push(item as never);
    });

    return lines;
}

function _getLineNumber(description: any): number {
    let lineNumber = 0;
    if (description.xLine || description.rawData.line) {
        lineNumber = (description.xLine || description.rawData.line) - 1; // x-line uses lines starts form 1
    }

    return lineNumber;
}

function createModelRow() {
    const row: any = {};
    props.description.content.forEach((item: any) => {
        let initValue = undefined;
        const description = item.description;

        if (description.type === 'multiselect') {
            initValue = [];
        } else if (description.type === 'date') {
            initValue = null;
        }

        if (description.name === 'show' && vm.selectedSelectionValue) {
            initValue = vm.selectedSelectionValue;
            vm.selectedSelectionValue = null;
        }

        row[props.description.name] = initValue || description.default;
    });

    return row;
}

function isWholeLineHidden(line: Array<Object>): boolean {
    return line.every((elem: any) => {
        return elem.description.xHideValue || elem.description.xRemoveValue;
    });
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

    return (
        vm.model.length ===
        uniqWith(vm.model, (item: any) => {
            const result: any = JSON.stringify(item);
            return result;
        }).length
    );
}

function onModelChange(rowIndex: number, descriptionName: string|null, $event: any) {
    const modelClone = [...vm.model];

    if (descriptionName) {
        modelClone[rowIndex][descriptionName] = $event;
    } else {
        modelClone[rowIndex] = $event;
    }

    sharedFunctions.setModel(modelClone, true);

    emits('modelChange', modelClone);
}

sharedFunctions.initField = initField;
sharedFunctions.addRowAfter = addRowAfter;
sharedFunctions.addFirstRow = addFirstRow;
sharedFunctions.onRowsDescriptionChanged = onRowsDescriptionChanged;
sharedFunctions.createModelRow = createModelRow;
sharedFunctions.isValid = isValid;
sharedFunctions.touch = touch;
</script>

<style></style>
