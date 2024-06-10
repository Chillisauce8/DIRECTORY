<template>
    <div ref="selfRef" class="schema-form-array-of-objects-field">
        <div v-if="initDone && sharedFunctions.shouldBeConstructed(props.description.header)" v-show="!props.description.xHideValue" class="array-wrap">
            <div v-for="(row, rowIndex) in vm.model" :key="rowIndex">
                <p v-if="rowIndex === 0 && props.description.header.title">
                    {{ sharedFunctions.getTitle() }}

                    <span v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                        <SvgIcon svg="info" />
                    </span>

                    <!--        <i class="pi pi-table padding_-5" v-if="props.description.xGrid"-->
                    <!--           v-tooltip.bottom="'Grid view'" style="cursor: pointer"-->
                    <!--           @click="showGridView()"></i>-->
                </p>
                <!-- <p class="label flex-none" v-if="props.description.header.title && rowIndex !== 0"></p> -->

                <div class="lines" v-for="line in vm.linesForRows[rowIndex]" v-show="!isWholeLineHidden(line)">
                    <template v-for="item in line">
                        <div class="line" :style="{ width: item.description.xFlex + '%' }" v-if="sharedFunctions.shouldItemBeConstructed(item.description, rowIndex)" v-tooltip.bottom="sharedFunctions.getDescriptionText(item)">
                            <DynamicControl
                                v-if="item.formDirective === 'valueField'"
                                :description="item.description"
                                :model="vm.model[rowIndex][item.description.name]"
                                :context="sharedFunctions.createInnerFieldContext(props.description.header.name, rowIndex)"
                                @modelChange="onModelChange(rowIndex, item.description.name, $event)"
                            >
                            </DynamicControl>

                            <DynamicField
                                class="inner-dynamic-field"
                                v-if="item.formDirective !== 'valueField'"
                                :description="item"
                                :model="vm.model[rowIndex]"
                                :context="sharedFunctions.createInnerFieldContext(props.description.header.name, rowIndex)"
                                @modelChange="onModelChange(rowIndex, null, $event)"
                            >
                            </DynamicField>
                        </div>
                    </template>
                </div>

                <SpeedDial :model="createSpeedDialItems(rowIndex)" v-if="!sharedFunctions.isReadonly()" direction="left" :style="{ top: 'calc(50% - 2rem)', right: 0 }" />
            </div>

            <div class="empty row start-center" v-if="!vm.model?.length">
                <p class="label flex">
                    {{ sharedFunctions.getTitle() }}

                    <span v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                        <!-- <i class="icon icon-question-mark padding_-5"></i> -->
                        <SvgIcon svg="help" />
                    </span>
                </p>

                <Button icon="pi pi-plus" aria-label="Add First Row" v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore() && vm.isSelectionMode">
                    <!--              #contextMenuTrigger [matMenuTriggerFor]="contextMenu"-->
                </Button>

                <Button icon="pi pi-plus" aria-label="Add First Row" v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore() && !vm.isSelectionMode" @click="addFirstRow()"> </Button>
            </div>

            <ContextMenu ref="menu" :model="getContextMenuItems(vm.selectionValues)" />

            <div v-if="!sharedFunctions.isValidMaxItems()" class="text-color_red field_wrap">Max items value is {{ props.description.xMaxItemsValue }}</div>

            <div v-if="!sharedFunctions.isValidMinItems()" class="text-color_red field_wrap">Min items value is {{ props.description.xMinItemsValue }}</div>

            <div v-if="!ifValidUniqueItems()" class="text-color_red field_wrap">Items are not unique</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { uniqBy, uniqWith } from '~/service/utils';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import { getCurrentInstance } from 'vue';

// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

const selfRef = ref(null);

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

    const parentObjectField = sharedFunctions.getParentByName(instance, 'ObjectField');
    const parentDynamicControl = sharedFunctions.getParentByName(instance, 'DynamicControl');
    const parentGroupField = sharedFunctions.getParentByName(instance, 'FormGroup');
    const schemaForm = sharedFunctions.getParentByName(instance, 'SchemaForm');

    const refs = {
        self: instance,
        form: {
            formName: schemaForm?.props.formName,
            needCorrectExistingValues: true
        },
        parentObjectField: parentObjectField,
        parentGroupField: parentGroupField,
        parentDynamicControl: parentDynamicControl
    };

    sharedFunctions.setRefs(refs);

    sharedFunctions.doOnMounted();
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

function getContextMenuItems(selectionValues: string[]) {
    return selectionValues.map((item: string) => {
        return {
            label: item,
            command: () => onSelectionClick(item)
        };
    });
}

function createSpeedDialItems(index: number) {
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
            command: () => sharedFunctions.opyRow(index),
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

// function showGridView() {
//   this.xGridShowDialogService.show(vm.model, props.description, vm.context)
//     .pipe(
//       take(1)
//     )
//     .subscribe((result: ICommonDialogResult) => {
//       agGridModelService.reset();
//
//       if (!result) {
//         return;
//       }
//
//       if (result && !result.canceled && result.data !== null) {
//         vm.model = result.data;
//         initField();
//       }
//     });
// }

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

function onModelChange(rowIndex: number, descriptionName: string, $event: any) {
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
