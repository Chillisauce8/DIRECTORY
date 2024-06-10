<template>
    <div ref="selfRef" class="schema-form-group" :id="'pf-' + props.description.header.name">
        <!--       <div class="form_header row start-center" v-show="!props.description.noHeaderDisplay">
            <h4>{{ props.description.header.title }}</h4>
        </div> -->

        <!-- <div class="schema-wrapper bg-color_white"> -->
        <template v-for="(contentDescription, contentIndex) in props.description.content">
            <template v-if="im.shouldContentBeConstructed[contentIndex]">
                <template v-if="im.shouldAddHeaderNameToModelPathValues[contentIndex]">
                    <DynamicField :model="vm.model[props.description.header.name]" @modelChange="onModelChangeByPath($event)" :context="vm.context" :description="contentDescription"> </DynamicField>
                </template>
                <template v-if="!im.shouldAddHeaderNameToModelPathValues[contentIndex]">
                    <DynamicField :model="vm.model" @modelChange="onModelChange($event)" :context="vm.context" :description="contentDescription"> </DynamicField>
                </template>
            </template>
        </template>
        <!--  </div> -->
    </div>
</template>

<script setup lang="ts">
import { SchemaParser } from '~/service/schema-forms/schemaParser.factory';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { isEqual, isObject } from '~/service/utils';
import useBaseField from '~/composables/schema-forms/useBaseField';
import { schemaFormsProcessingHelper } from '~/service/schema-forms/schemaFormsProcessing.service';
import DynamicField from '~/components/schema-forms/DynamicField.vue';
// @ts-ignore
import { getCurrentInstance } from 'vue';

const im = reactive({
    shouldHeaderBeConstructed: false,
    shouldContentBeConstructed: [],
    shouldAddHeaderNameToModelPathValues: undefined
});

// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

const selfRef = ref(null);

const { vm, sharedFunctions } = useBaseField(props, emits);

const initFieldBase = sharedFunctions.initField;
const setModelBase = sharedFunctions.setModel;
const processXFeaturesBase = sharedFunctions.processXFeatures;

watch(
    () => props?.model,
    (value: any) => {
        if (value && vm.context) {
            vm.context = {
                ...vm.context,
                // ...model,
                resultModel: value
            };
        }
    }
);

onMounted(() => {
    const instance = getCurrentInstance();

    const parentObjectField = sharedFunctions.getParentByName(instance, 'ObjectField');
    const schemaForm = sharedFunctions.getParentByName(instance, 'SchemaForm');

    const refs = {
        self: instance,
        form: {
            formName: schemaForm?.props.formName,
            needCorrectExistingValues: true
        },
        parentObjectField: parentObjectField
    };

    sharedFunctions.setRefs(refs);

    sharedFunctions.doOnMounted();
});

onDeactivated(() => {
    sharedFunctions.doOnDeactivated();
});

function initField() {
    refreshShouldBeConstructedValues();

    initFieldBase();

    initShouldAddHeaderNameToModelPath();

    if (im.shouldHeaderBeConstructed) {
        initModelIfNeed();
    }
}

function refreshShouldBeConstructedValues() {
    im.shouldHeaderBeConstructed = sharedFunctions.shouldBeConstructed(props.description.header, vm.context, im.shouldHeaderBeConstructed);

    const refreshedShouldContentBeConstructed = [];

    const shouldUsePrevValues = props.description.content.length === im.shouldContentBeConstructed.length;

    for (let i = 0; i < props.description.content.length; ++i) {
        const value = sharedFunctions.shouldBeConstructed(props.description.content[i]['description'], vm.context, shouldUsePrevValues ? im.shouldContentBeConstructed[i] : null);
        refreshedShouldContentBeConstructed.push(value);
    }

    im.shouldContentBeConstructed = refreshedShouldContentBeConstructed;
}

function initShouldAddHeaderNameToModelPath() {
    im.shouldAddHeaderNameToModelPathValues = [];

    for (let i = 0; i < props.description.content.length; ++i) {
        const value = shouldAddHeaderNameToModelPath(props.description.content[i]);
        im.shouldAddHeaderNameToModelPathValues.push(value);
    }
}

function initModelIfNeed() {
    if (vm.model) {
        const headerName = props.description.header.name;

        if (props.description.header.type === 'object' && (!isObject(vm.model[headerName]) || Array.isArray(vm.model[headerName]))) {
            if (props.description.fakeObject) {
                vm.model[headerName] = undefined;
            } else {
                vm.model[headerName] = {};
            }
        } else if (props.description.header.type === 'array' && !Array.isArray(vm.model[headerName])) {
            vm.model[headerName] = [];
        }
    } else {
        vm.model = {};
    }
}

function onModelChange(value: any) {
    vm.model = value;
    emits('modelChange', vm.model);
}

function onModelChangeByPath(value: any) {
    if (!isEqual(vm.model[props.description.header.name], value)) {
        vm.model[props.description.header.name] = value;
        setModel(vm.model, true);
    } else {
        schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
    }
}

function shouldAddHeaderNameToModelPath(contentDescription: any): boolean {
    if (!Object.keys(props.description.header).length || !props.description.header.path) {
        return false;
    }

    if (SchemaParser.isStructureTag(props.description.header.path)) {
        return false;
    }

    if (contentDescription.description.header) {
        return contentDescription.description.header.path !== props.description.header.path;
    } else {
        return contentDescription.description.path !== props.description.header.path;
    }
}

function setModel(value: any, updated?: boolean) {
    return setModelBase(value, true);
}

function processXFeatures(): any {
    const result = processXFeaturesBase();
    refreshShouldBeConstructedValues();
    return result;
}

sharedFunctions.initField = initField;
sharedFunctions.setModel = setModel;
sharedFunctions.processXFeatures = processXFeatures;
</script>

<style scoped></style>
