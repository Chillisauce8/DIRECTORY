<template>
    <div ref="formRef" class="schema-form">
        <template v-if="!!context">
            <template v-for="(groupDescription, groupIndex) in props.description" :key="groupIndex">
                <FormGroup :model="vm.model" @modelChange="onModelChange($event)" :description="groupDescription" :context="context"> </FormGroup>
            </template>
        </template>
        <Toast />
    </div>
</template>

<script setup lang="ts">
import { isObject } from '~/service/utils';
import { schemaFormsProcessingHelper } from '~/service/schema-forms/schemaFormsProcessing.service';
import { xFeaturesHelper } from '~/service/schema-forms/xFeaturesHelper';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import FormGroup from '~/components/schema-forms/FormGroup.vue';
import useBaseField from '~/composables/schema-forms/useBaseField';

export interface FormProps extends BaseFieldProps {
    formName: string;
    needCorrectExistingValues?: boolean;
}

export interface FormEmits extends BaseFieldEmits {
    (e: 'formDone', value: boolean): void;
}

// @ts-ignore
const props = withDefaults(defineProps<FormProps>(), {
    needCorrectExistingValues: true
});

// @ts-ignore
const emits = defineEmits<FormEmits>();

let formDoneSent = false;

const formRef = ref(null);

const formName = props.formName;

const { vm, sharedFunctions } = useBaseField(props, emits);

const initFieldBase = sharedFunctions.initField;
const setModelBase = sharedFunctions.setModel;
const processInnerModelChangedBase = sharedFunctions.processInnerModelChanged;

const context = ref();

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
}

sharedFunctions.initField = initField;
sharedFunctions.setModel = setModel;
sharedFunctions.processInnerModelChanged = processInnerModelChanged;
</script>

<style lang="scss">
.schema-form {
    width: 100%;
}
</style>
