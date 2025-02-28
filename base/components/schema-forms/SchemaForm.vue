<template>
    <section :id="props.id">
        <ConfirmDialog></ConfirmDialog>

        <h1 v-if="props.title" class="title">{{ props.title }}</h1>
        <h2 v-if="props.subtitle" class="subtitle">{{ props.subtitle }}</h2>

        <div class="field-block" v-if="!!context">
            <template v-for="(contentDescription, contentIndex) in props.description.content">
                <DynamicFieldBlock :model="vm.model" @modelChange="onModelChange($event)" :context="context"
                                   :description="contentDescription" :formLabelType="formLabelType"
                                   :floatLabelVariant="floatLabelVariant">
                </DynamicFieldBlock>
            </template>
        </div>
      
    </section>
</template>

<script setup lang="ts">
import { isEqual, isObject } from '~/service/utils';
import { schemaFormsProcessingHelper } from '~/service/schema-forms/schemaFormsProcessing.service';
import { xFeaturesHelper } from '~/service/schema-forms/xFeaturesHelper';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import useBaseField from '~/composables/schema-forms/useBaseField';
import DynamicFieldBlock from '~/components/schema-forms/DynamicFieldBlock.vue';
import type { FormLabelProps } from '~/types/schema-forms';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';

/**
 * Combined props type for form configuration
 * Extends BaseFieldProps with additional form-specific properties
 */
export type FormProps = BaseFieldProps & {
    id?: string;
    title?: string;
    subtitle?: string;
    formName?: string;
    needCorrectExistingValues?: boolean;
    fields?: Object;
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
};

// @ts-ignore
const props = withDefaults(defineProps<FormProps>(), {
    needCorrectExistingValues: true,
    id: 'form',
    formName: 'form'
});

// Add computed properties to handle undefined props
const formLabelType = computed(() => props.formLabelType);
const floatLabelVariant = computed(() => props.floatLabelVariant);


// @ts-ignore
const emits = defineEmits<{
    (e: 'formDone', value: boolean): void;
    (e: 'modelChange', value: any): void;
}>();

// Track if we've notified parent that form is ready
let formDoneSent = false;

// Internal reactive state for form construction
const im = reactive({
    shouldHeaderBeConstructed: false,
    shouldContentBeConstructed: [],
    shouldAddHeaderNameToModelPathValues: undefined
});

// Get base field functionality
const { vm, sharedFunctions } = useBaseField(props, emits);

const initFieldBase = sharedFunctions.initField;
const setModelBase = sharedFunctions.setModel;
const processInnerModelChangedBase = sharedFunctions.processInnerModelChanged;

// Store the form's context (holds form data and global variables)
const context = ref(null);

// Lifecycle hooks
onMounted(() => {
    // Set up form references when component mounts
    const refs = {
        self: null,
        form: {
            formName: props.formName,
            needCorrectExistingValues: true
        },
        parentObjectField: null,
        parentGroupField: null,
        parentDynamicField: null
    };

    sharedFunctions.setRefs(refs);

    sharedFunctions.doOnMounted();
});

// Clean up when component is deactivated
onDeactivated(() => {
    sharedFunctions.doOnDeactivated();
});

// Emit form ready event after slight delay
onUpdated(() => {
    if (formDoneSent) {
        return;
    }

    setTimeout(() => {
        emits('formDone', true);
        formDoneSent = true;
    }, 100);
});

// Watch for changes in the form model
watch(
    () => vm?.model,
    (value: any) => {
        if (value) {
            context.value = {
                ...context.value,
                resultModel: value
            };
        }
    }
);

/**
 * Initialize the form field and set up the context
 * - Sets up initial model structure
 * - Creates context with global variables
 * - Initializes header path settings
 */
function initField() {
    initFieldBase();

    const headerName = props.description?.header ? props.description.header.name : undefined;

    if (vm.model && headerName) {
        if (props.description.header.type === 'object' && (!isObject(vm.model[headerName]) || Array.isArray(vm.model[headerName]))) {
            vm.model[headerName] = {};
        } else if (props.description.header.type === 'array' && !Array.isArray(vm.model[headerName])) {
            vm.model[headerName] = [];
        }
    } else if (!vm.model) {
        vm.model = {};
    }

    // rawDataService.getDataTypes()
    //   .subscribe(typeList => {
    context.value = {
        resultModel: vm.model,
        global: {
            ...xFeaturesHelper.getGlobalVariablesForContext()
            // dataTypes: typeList
        },
        indexes: {},
        _cachedFunction: {}
    };
    // });

    // vm.context = context.value;

    initShouldAddHeaderNameToModelPath();
}

/**
 * Updates the form's model with new values
 * @param value New model value
 * @param updated Whether the model was updated
 */
function setModel(value: any, updated?: boolean) {
    return setModelBase(value, true);
}

/**
 * Gets the name of the current form
 * @returns Form name string
 */
function getFormName(): string {
    return props.formName;
}

/**
 * Processes changes to inner form models
 * @param value Changed model value
 */
function processInnerModelChanged(value?: any) {
    processInnerModelChangedBase(value);
    schemaFormsProcessingHelper.processFormChanges(getFormName());
}

/**
 * Handles model changes and emits to parent
 * @param value New model value
 */
function onModelChange(value: any) {
    vm.model = value;
    emits('modelChange', vm.model);

    // console.log(JSON.stringify(vm.model, null, 4));
}

/**
 * Handles model changes for a specific path
 * @param value New value for the path
 */
function onModelChangeByPath(value: any) {
    if (!isEqual(vm.model[props.description.header.name], value)) {
        vm.model[props.description.header.name] = value;
        setModel(vm.model, true);
    } else {
        schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
    }
}

/**
 * Initializes header name to model path settings
 */
function initShouldAddHeaderNameToModelPath() {
    im.shouldAddHeaderNameToModelPathValues = [];

    for (let i = 0; i < props.description.content.length; ++i) {
        const value = shouldAddHeaderNameToModelPath(props.description.content[i]);
        im.shouldAddHeaderNameToModelPathValues.push(value);
    }
}

/**
 * Determines if header name should be added to model path
 * @param contentDescription Description of content field
 * @returns boolean indicating if header name should be added
 */
function shouldAddHeaderNameToModelPath(contentDescription: any): boolean {
    if (!Object.keys(props.description.header).length || !props.description.header.path) {
        return false;
    }

    if (props.description.header.type === 'container') {
        return false;
    }

    if (contentDescription.description.header) {
        return contentDescription.description.header.path !== props.description.header.path;
    } else {
        return contentDescription.description.path !== props.description.header.path;
    }
}

// Assign local implementations to shared functions
sharedFunctions.initField = initField;
sharedFunctions.setModel = setModel;
sharedFunctions.processInnerModelChanged = processInnerModelChanged;
</script>

<style lang="scss"></style>
