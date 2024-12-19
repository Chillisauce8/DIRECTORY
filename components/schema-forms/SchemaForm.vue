<template>
    <section :id="props.id">
        <h1 v-if="props.title" class="title">{{ props.title }}</h1>
        <h2 v-if="props.subtitle" class="subtitle">{{ props.subtitle }}</h2>

        <div class="field-block" v-if="!!context">
            <template v-for="(contentDescription, contentIndex) in props.description.content">
                <DynamicFieldBlock :model="vm.model" @modelChange="onModelChange($event)" :context="context" :description="contentDescription" :formLabelType="formLabelType" :floatLabelVariant="floatLabelVariant"> </DynamicFieldBlock>
            </template>
        </div>
        <Toast />
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

// Combine types instead of extending
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

export interface FormEmits extends BaseFieldEmits {
    (e: 'formDone', value: boolean): void;
}

// @ts-ignore
const emits = defineEmits<{
    (e: 'formDone', value: boolean): void;
    (e: 'modelChange', value: any): void;
}>();

let formDoneSent = false;

const im = reactive({
    shouldHeaderBeConstructed: false,
    shouldContentBeConstructed: [],
    shouldAddHeaderNameToModelPathValues: undefined
});

const { vm, sharedFunctions } = useBaseField(props, emits);

const initFieldBase = sharedFunctions.initField;
const setModelBase = sharedFunctions.setModel;
const processInnerModelChangedBase = sharedFunctions.processInnerModelChanged;

const context = ref(null);

onMounted(() => {
    const refs = {
        self: null,
        form: {
            formName: props.formName,
            needCorrectExistingValues: true
        },
        parentObjectField: null,
        parentGroupField: null,
        parentDynamicControl: null
    };

    sharedFunctions.setRefs(refs);

    sharedFunctions.doOnMounted();
});

onDeactivated(() => {
    sharedFunctions.doOnDeactivated();
});

onUpdated(() => {
    if (formDoneSent) {
        return;
    }

    setTimeout(() => {
        emits('formDone', true);
        formDoneSent = true;
    }, 100);
});

watch(
    () => props?.model,
    (value: any) => {
        if (value) {
            context.value = {
                ...context.value,
                resultModel: value
            };
        }
    }
);

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

    vm.context = context.value;

    initShouldAddHeaderNameToModelPath();
}

function setModel(value: any, updated?: boolean) {
    return setModelBase(value, true);
}

function getFormName(): string {
    return props.formName;
}

function processInnerModelChanged(value?: any) {
    processInnerModelChangedBase(value);
    schemaFormsProcessingHelper.processFormChanges(getFormName());
}

function onModelChange(value: any) {
    vm.model = value;
    emits('modelChange', vm.model);

    // console.log(JSON.stringify(vm.model, null, 4));
}

function onModelChangeByPath(value: any) {
    if (!isEqual(vm.model[props.description.header.name], value)) {
        vm.model[props.description.header.name] = value;
        setModel(vm.model, true);
    } else {
        schemaFormsProcessingHelper.processFormChanges(sharedFunctions.getFormName());
    }
}

function initShouldAddHeaderNameToModelPath() {
    im.shouldAddHeaderNameToModelPathValues = [];

    for (let i = 0; i < props.description.content.length; ++i) {
        const value = shouldAddHeaderNameToModelPath(props.description.content[i]);
        im.shouldAddHeaderNameToModelPathValues.push(value);
    }
}

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

sharedFunctions.initField = initField;
sharedFunctions.setModel = setModel;
sharedFunctions.processInnerModelChanged = processInnerModelChanged;
</script>

<style lang="scss"></style>
