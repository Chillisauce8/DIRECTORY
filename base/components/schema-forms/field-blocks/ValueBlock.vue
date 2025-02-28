<template>
    <DynamicField
        v-if="sharedFunctions.shouldBeConstructed(props.description)"
        :description="props.description"
        :model="vm.model"
        @modelChange="onModelChange($event)"
        :context="props.context"
        :formLabelType="props.formLabelType"
        :floatLabelVariant="props.floatLabelVariant"
    >
    </DynamicField>
</template>

<script setup lang="ts">
import type { BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import useBaseField from '~/composables/schema-forms/useBaseField';
import DynamicField from '~/components/schema-forms/DynamicField.vue';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from '@vue/runtime-core';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';

// Props interface that extends base field properties with additional display options
export interface ValueFieldProps extends BaseFieldProps {
    showTitle?: boolean;
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
}

// Initialize props and emits
// @ts-ignore
const props = defineProps<ValueFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

// Get shared functionality from base field
let { vm, sharedFunctions } = useBaseField(props, emits);

// Store references to base functions that will be enhanced
const processXFeaturesBase = sharedFunctions.processXFeatures;
const doOnMountedBase = sharedFunctions.doOnMounted;

// Initialize view model properties
vm.descriptionText = '';
vm.showTitle = props.showTitle;

// Controls whether the field should be shown based on conditions
const shouldFieldBeConstructed = ref(false);

/**
 * Handles all initialization when component is mounted
 * Checks if field should be shown and sets up initial state
 */
function doOnMounted(instance: ComponentInternalInstance | null) {
    if (shouldFieldBeConstructed) {
        refreshDescription();
        initField();
    }

    doOnMountedBase(instance);
}

/**
 * Sets up the initial state of the field
 * - Creates a model if none exists
 * - Determines if title should be shown
 * - Handles special case for checkboxes
 */
function initField(): void {
    if (vm.model === undefined || vm.model === null) {
        createModel();
    }

    if (props.description.showTitle !== undefined) {
        vm.showTitle = props.description.showTitle;
    }

    if (props.showTitle === undefined) {
        if (props.description.component === 'Checkbox') {
            vm.showTitle = false;
        } else {
            vm.showTitle = true;
        }
    }
}

// Vue lifecycle hooks for mounting and deactivating
onMounted(() => {
    const instance = getCurrentInstance();
    doOnMounted(instance);
});

onDeactivated(() => {
    sharedFunctions.onDeactivated();
});

/**
 * Handles when the field's value changes
 * Updates the local model and emits the change to parent
 */
function onModelChange($event: any) {
    vm.model = $event;

    emits('modelChange', $event);
}

/**
 * Creates an initial value for the field based on its type
 * - Arrays for multiselect and chips
 * - Undefined for other types
 */
function _createModel(): any {
    if (props.description.component === 'Multiselect') {
        return [];
    }

    if (props.description.component === 'Chips') {
        return [];
    }

    return undefined;
}

/**
 * Public method to create a new model
 */
function createModel(): void {
    vm.model = _createModel();
}

/**
 * Resets the field's value to undefined
 */
function deleteModel(): void {
    vm.model = undefined;
}

/**
 * Updates the description text shown for the field
 */
function refreshDescription() {
    vm.descriptionText = sharedFunctions.getDescriptionText();
}

/**
 * Processes any special features (x-prefixed properties)
 * Updates field visibility and description afterward
 */
function processXFeatures() {
    const result = processXFeaturesBase();
    refreshDescription();
    return result;
}

// Assign enhanced methods back to shared functions
sharedFunctions.initField = initField;
sharedFunctions.createModel = createModel;
sharedFunctions.deleteModel = deleteModel;
sharedFunctions.processXFeatures = processXFeatures;
</script>

<style></style>
