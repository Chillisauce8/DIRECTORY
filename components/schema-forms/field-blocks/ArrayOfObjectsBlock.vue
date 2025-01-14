<template>
    <!-- Main container for the array of objects form block -->
    <section :class="sharedFunctions.prepareClasses('array')" :id="props.description.id">
        <!-- Only render if initialization is complete and header should be constructed -->
        <template v-if="initDone && sharedFunctions.shouldBeConstructed(props.description.header)" v-show="!props.description.xHideValue">
            <!-- Main form fields container -->
            <div class="field-block">
                <!-- Iterate through each row in the model -->
                <template v-for="(row, rowIndex) in vm.model" :key="rowIndex">
                    <!-- Header section with title and speed dial actions -->
                    <div class="array-of-object-header">
                        <!-- Title with optional info tooltip -->
                        <h1 class="title array-of-object" v-if="props.description.header.title">
                            <template v-if="rowIndex === 0">
                                {{ sharedFunctions.getTitle() }}

                                <!-- Information icon with tooltip -->
                                <span v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                                    <SvgIcon svg="info" />
                                </span>
                            </template>
                        </h1>

                        <!-- Speed dial menu for row actions (only shows if model has items) -->
                        <SpeedDial v-if="vm.model?.length" :model="createSpeedDialItems(rowIndex)" direction="left" />
                    </div>

                    <!-- Iterate through lines within each row -->
                    <template v-for="(line, lineIndex) in vm.linesForRows[rowIndex]" v-show="!isWholeLineHidden(line)">
                        <!-- Iterate through items within each line -->
                        <template v-for="(item, itemIndex) in line">
                            <!-- Container for each form field -->
                            <template :style="{ width: item.description.xFlex + '%' }" v-if="sharedFunctions.shouldItemBeConstructed(item.description, rowIndex)" v-tooltip.bottom="sharedFunctions.getDescriptionText(item)">
                                <!-- Render dynamic field for basic value inputs -->
                                <DynamicField
                                    v-if="item.blockComponent === BlockComponents.value"
                                    :description="item.description"
                                    :model="vm.model[rowIndex][item.description.name]"
                                    :context="sharedFunctions.createInnerFieldContext(props.context, props.description.header.name, rowIndex)"
                                    @modelChange="onModelChange(rowIndex, item.description.name, $event)"
                                    :formLabelType="props.formLabelType"
                                    :floatLabelVariant="props.floatLabelVariant"
                                >
                                </DynamicField>

                                <!-- Render dynamic field block for complex components -->
                                <template v-if="item.blockComponent !== BlockComponents.value">
                                    <DynamicFieldBlock
                                        :description="item"
                                        :model="vm.model[rowIndex]"
                                        :context="sharedFunctions.createInnerFieldContext(props.context, props.description.header.name, rowIndex)"
                                        @modelChange="onModelChange(rowIndex, null, $event)"
                                    >
                                    </DynamicFieldBlock>
                                </template>
                            </template>
                        </template>
                    </template>
                </template>

                <!-- Empty state with add buttons -->
                <div v-if="!vm.model?.length">
                    <div class="array-of-object-header">
                        <h1 class="title array-of-object" v-if="props.description.header.title">
                            {{ sharedFunctions.getTitle() }}

                            <span v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                                <SvgIcon svg="info" />
                            </span>
                        </h1>
                        <!-- Add button for selection mode -->
                        <Button icon="pi pi-plus" aria-label="Add First Row" v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore() && vm.isSelectionMode"> </Button>
                        <!-- Add button for normal mode -->
                        <Button icon="pi pi-plus" aria-label="Add First Row" v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore() && !vm.isSelectionMode" @click="addFirstRow()"> </Button>
                    </div>
                </div>
            </div>

            <!-- Context menu for selection mode -->
            <ContextMenu ref="menu" :model="getContextMenuItems(vm.selectionValues)" />

            <!-- Replace multiple FieldError components with single enhanced version -->
            <FieldError
                :validations="{
                    maxItems: sharedFunctions.isValidMaxItems,
                    minItems: sharedFunctions.isValidMinItems,
                    uniqueItems: ifValidUniqueItems
                }"
                :messages="{
                    maxItems: `Max items value is ${props.description.xMaxItemsValue}`,
                    minItems: `Min items value is ${props.description.xMinItemsValue}`,
                    uniqueItems: 'Items are not unique'
                }"
            />
        </template>
    </section>
</template>

<script setup lang="ts">
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { uniqWith } from '~/service/utils';
import { getCurrentInstance } from 'vue';
import { BlockComponents } from '~/service/schema-forms/blockComponents';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';
import FieldError from '../FieldError.vue';

interface ArrayProps extends BaseFieldProps {
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
}

// @ts-ignore
const props = defineProps<ArrayProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

let { vm, sharedFunctions, initDone } = useBaseArrayFieldControl(props, emits);

const initFieldBase = sharedFunctions.initField;
const addRowAfterBase = sharedFunctions.addRowAfter;
const addFirstRowBase = sharedFunctions.addFirstRow;
const onRowsDescriptionChangedBase = sharedFunctions.onRowsDescriptionChanged;

vm.isSelectionMode = false;
vm.selectionValues = [];
vm.linesForRows = [];
vm.selectedSelectionValue = undefined;
vm.selectionRowIndex = -1;

watch(
    () => props?.model,
    (value: any) => {
        initField();
    }
);

/**
 * Main initialization function that sets up the component's state.
 * It checks if we're in selection mode and gets selection data if needed.
 */
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

/**
 * Checks if the current array state is valid by verifying:
 * - Maximum items limit
 * - Minimum items requirement
 * - Uniqueness of items (if required)
 */
function isValid(): boolean {
    return sharedFunctions.isValidMaxItems() && sharedFunctions.isValidMinItems() && sharedFunctions.ifValidUniqueItems();
}

/**
 * Placeholder function for handling touch events
 */
function touch() {
    //
}

/**
 * Determines if the speed dial menu should be shown for a specific item
 * Shows it only for the last item in a row when not in readonly mode
 */
function showSpeedDeal(lineIndex: number, line: any[], rowIndex: number, itemIndex: number): boolean {
    return !sharedFunctions.isReadonly() && lineIndex === vm.linesForRows[rowIndex].length - 1 && itemIndex === line.length - 1;
}

/**
 * Creates menu items for the selection dropdown
 * Each item will trigger onSelectionClick when chosen
 */
function getContextMenuItems(selectionValues: string[]) {
    return selectionValues.map((item: string) => {
        return {
            label: item,
            command: () => onSelectionClick(item)
        };
    });
}

/**
 * Creates the speed dial menu items (floating action buttons)
 * Includes actions like add, delete, move up/down, and copy row
 */
function createSpeedDialItems(index: number) {
    // const index = vm.model.length - 1;
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

/**
 * Checks if the field is required based on header configuration
 */
function isRequired(): boolean {
    return props.description.header.required;
}

/**
 * Opens the context menu for selecting items
 * Currently not implemented
 */
function openContextMenu(index: number) {
    throw 'Not implemented';
}

/**
 * Updates the UI when row descriptions change
 * Rebuilds the lines layout for all rows
 */
function onRowsDescriptionChanged() {
    updateLinesForRows();

    onRowsDescriptionChangedBase();
}

/**
 * Updates the internal layout structure for how rows are displayed
 * Organizes items into lines based on their configuration
 */
function updateLinesForRows() {
    vm.linesForRows = [];

    if (!vm.rowDescriptions) {
        return;
    }

    for (let i = 0; i < vm.rowDescriptions.length; ++i) {
        vm.linesForRows.push(_getLinesItems(i));
    }
}

/**
 * Adds the first row to an empty array
 * Handles both normal and selection modes
 */
function addFirstRow() {
    if (!sharedFunctions.canAddMore()) {
        return;
    }

    if (vm.isSelectionMode) {
        return;
    }

    addFirstRowBase();
}

/**
 * Adds a new row after the specified row index
 * Handles both normal and selection modes
 */
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

/**
 * Handles when a selection is made from the dropdown
 * Creates a new row with the selected value
 */
function onSelectionClick(value: string) {
    vm.selectedSelectionValue = value;

    if (vm.selectionRowIndex !== -1) {
        addRowAfterBase(vm.selectionRowIndex);
        vm.selectionRowIndex = -1;
    } else {
        addFirstRowBase();
    }
}

/**
 * Organizes items into lines based on their line number configuration
 * Used for layout purposes to group fields together
 */
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

/**
 * Gets the line number for an item based on its configuration
 * Returns 0 if no line number is specified
 */
function _getLineNumber(description: any): number {
    let lineNumber = 0;
    if (description.xLine || description.rawData.line) {
        lineNumber = (description.xLine || description.rawData.line) - 1; // x-line uses lines starts form 1
    }

    return lineNumber;
}

/**
 * Creates a new empty row with default values
 * Handles special cases for different field types
 */
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

/**
 * Checks if all items in a line are hidden
 * Used to hide entire lines when all their fields are hidden
 */
function isWholeLineHidden(line: Array<Object>): boolean {
    return line.every((elem: any) => {
        return elem.description.xHideValue || elem.description.xRemoveValue;
    });
}

/**
 * Validates that all items in the array are unique
 * Only checks if uniqueness is required by configuration
 */
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

/**
 * Updates the model when any field in a row changes
 * Emits the change event with the updated model
 */
function onModelChange(rowIndex: number, descriptionName: string | null, $event: any) {
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
