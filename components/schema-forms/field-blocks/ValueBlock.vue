<template>
    <DynamicField
        v-if="shouldFieldBeConstructed" v-show="!props.description.xHideValue"
        :description="props.description" :model="vm.model"
        @modelChange="onModelChange($event)"
        :context="props.context">
    </DynamicField>
</template>

<script setup lang="ts">
import type { BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import useBaseField from '~/composables/schema-forms/useBaseField';
import DynamicField from '~/components/schema-forms/DynamicField.vue';
import { getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from '@vue/runtime-core';


export interface ValueFieldProps extends BaseFieldProps {
    showTitle?: boolean;
}

// @ts-ignore
const props = defineProps<ValueFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

let { vm, sharedFunctions } = useBaseField(props, emits);

const processXFeaturesBase = sharedFunctions.processXFeatures;
const doOnMountedBase = sharedFunctions.doOnMounted;

vm.descriptionText = '';
vm.showTitle = props.showTitle;

const shouldFieldBeConstructed = ref(false);

function doOnMounted(instance: ComponentInternalInstance | null) {
    refreshShouldBeConstructedValues();

    if (shouldFieldBeConstructed) {
        refreshDescription();
        initField();
    }

    doOnMountedBase(instance);
}

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

onMounted(() => {
    const instance = getCurrentInstance();
    doOnMounted(instance);
});

onDeactivated(() => {
    sharedFunctions.onDeactivated();
});

function onModelChange($event: any) {
    vm.model = $event;

    emits('modelChange', $event);
}

function _createModel(): any {
    if (props.description.component === 'Multiselect') {
        return [];
    }

    if (props.description.component === 'Chips') {
        return [];
    }

    return undefined;
}

function createModel(): void {
    vm.model = _createModel();
}

function deleteModel(): void {
    vm.model = undefined;
}

function refreshShouldBeConstructedValues() {
    shouldFieldBeConstructed.value = sharedFunctions.shouldBeConstructed(props.description, undefined, shouldFieldBeConstructed.value);
}

function refreshDescription() {
    vm.descriptionText = sharedFunctions.getDescriptionText();
}

function processXFeatures() {
    const result = processXFeaturesBase();
    refreshShouldBeConstructedValues();
    refreshDescription();
    return result;
}

sharedFunctions.initField = initField;
sharedFunctions.createModel = createModel;
sharedFunctions.deleteModel = deleteModel;
sharedFunctions.processXFeatures = processXFeatures;
</script>

<style></style>
