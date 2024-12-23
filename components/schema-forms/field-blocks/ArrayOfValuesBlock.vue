<template>
    <!-- Main wrapper for the array field component -->
    <div class="field-wrapper" :class="innerComponentName" :id="props.description.id">
        <!-- Only show content if initialization is done and component should be constructed -->
        <template v-if="initDone && sharedFunctions?.shouldBeConstructed(props.description)"
                  v-show="!props.description.xHideValue">
            <!-- Field label with optional tooltip for description -->
            <label v-if="props.description.title">
                {{ sharedFunctions.getTitle() }}

                <span v-if="sharedFunctions.getDescriptionText()" v-tooltip.bottom="sharedFunctions.getDescriptionText()">
                    <i class="pi pi-question padding_-5"></i>
                </span>
            </label>

            <!-- Loop through each item in the array to create dynamic fields -->
            <template v-for="(line, index) in vm.model" :key="index">
                <template v-if="sharedFunctions.shouldItemBeConstructed(vm.rowDescriptions[index], index)">
                    <DynamicField
                        :description="vm.rowDescriptions[index]"
                        :model="vm.model[index]"
                        @modelChange="onModelChange($event, index)"
                        :context="sharedFunctions.createInnerFieldContext(props.description.name, index)"
                        :index="index"
                        :noWrapper="true"
                        @initDone="onControlInitDone($event)"
                        :formLabelType="props.formLabelType"
                        :floatLabelVariant="props.floatLabelVariant"
                    >
                        <SpeedDial :model="createSpeedDialItems(index)" v-if="!sharedFunctions.isReadonly()" direction="left" style="position: relative" />
                    </DynamicField>
                </template>
            </template>

            <!-- Show add button when array is empty -->
            <div class="empty row start-center" v-if="!vm?.model?.length">
                <Button icon="pi pi-plus" aria-label="Add First Row" v-if="!sharedFunctions.isReadonly() && sharedFunctions.canAddMore()" @click="sharedFunctions.addFirstRow()"> </Button>
            </div>

            <!-- Validation error messages -->
            <div v-if="!sharedFunctions.isValidMaxItems()" class="text-color_red field_wrap">Max items value is {{ props.description.xMaxItemsValue }}</div>

            <div v-if="!sharedFunctions.isValidMinItems()" class="text-color_red field_wrap">Min items value is {{ props.description.xMinItemsValue }}</div>

            <div v-if="!sharedFunctions.ifValidUniqueItems()" class="text-color_red field_wrap">Items are not unique</div>
        </template>
    </div>
</template>

<script setup lang="ts">
// Import necessary composables and types
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance } from 'vue';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';

// Props interface extending base field properties
interface ArrayValuesProps extends BaseFieldProps {
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
}

// Setup props and emits
// @ts-ignore
const props = defineProps<ArrayValuesProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

// Reference for the inner component name (used for styling)
const innerComponentName = ref();

// Initialize the array field control with shared functions and reactive state
const { vm, sharedFunctions, initDone } = useBaseArrayFieldControl(props, emits);

// Lifecycle Hooks
onMounted(() => {
    // Initialize component when mounted
    const instance = getCurrentInstance();
    sharedFunctions.doOnMounted(instance);
});

onDeactivated(() => {
    // Cleanup when component is deactivated
    sharedFunctions.onDeactivated();
});

/**
 * Creates the speed dial menu items for each array row
 * Returns buttons for: add, delete, move up, and move down
 */
function createSpeedDialItems(index: number) {
    return [
        {
            icon: 'pi pi-plus',
            command: () => sharedFunctions.addRowAfter(index),
            visible: () => sharedFunctions.canAddMore()
        },
        {
            icon: 'pi pi-times',
            command: () => sharedFunctions.deleteRow(index),
            visible: () => sharedFunctions.canRemoveMore()
        },
        {
            icon: 'pi pi-chevron-up',
            command: () => sharedFunctions.moveRowUp(index)
        },
        {
            icon: 'pi pi-chevron-down',
            command: () => sharedFunctions.moveRowDown(index)
        }
    ];
}

/**
 * Creates a new empty row for the array
 * Returns null as default value for new items
 */
function createModelRow() {
    return null;
}

/**
 * Handles changes to individual items in the array
 * Updates the model and emits the change event
 */
function onModelChange($event: any, index: number) {
    vm.model[index] = $event;
    emits('modelChange', vm.model);
}

/**
 * Validates the array field
 * Checks max items, min items, and uniqueness constraints
 */
function isValid(): boolean {
    return sharedFunctions.isValidMaxItems() && sharedFunctions.isValidMinItems() && sharedFunctions.ifValidUniqueItems();
}

/**
 * Placeholder for touch functionality
 * Used to mark field as touched for validation
 */
function touch() {
    //
}

/**
 * Handles initialization completion of child components
 * Sets the inner component name for styling
 */
function onControlInitDone($event: any) {
    innerComponentName.value = $event.componentName;
}

// Assign local functions to shared functions object for external use
sharedFunctions.createModelRow = createModelRow;
sharedFunctions.isValid = isValid;
sharedFunctions.touch = touch;
</script>

<style></style>
