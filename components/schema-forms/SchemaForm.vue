<template>
    <section :class="props.classes ? props.classes : 'form'" :id="props.id">
        <h1 v-if="props.title" class="title">{{ props.title }}</h1>
        <h2 v-if="props.subtitle" class="subtitle">{{ props.subtitle }}</h2>

        <template v-if="!!context">
            <template v-for="(groupDescription, groupIndex) in props.description" :key="groupIndex">
                <FormGroup :model="vm.model" @modelChange="onModelChange($event)" :description="groupDescription" :context="context"> </FormGroup>
            </template>
        </template>
        <Toast />
    </section>
</template>

<script setup lang="ts">
import { isObject } from '~/service/utils';
import { schemaFormsProcessingHelper } from '~/service/schema-forms/schemaFormsProcessing.service';
import { xFeaturesHelper } from '~/service/schema-forms/xFeaturesHelper';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import FormGroup from '~/components/schema-forms/FormGroup.vue';
import useBaseField from '~/composables/schema-forms/useBaseField';

export interface FormProps extends BaseFieldProps {
    id?: string;
    classes?: string;
    title?: string;
    subtitle?: string;
    formName?: string;
    needCorrectExistingValues?: boolean;
}

export interface FormEmits extends BaseFieldEmits {
    (e: 'formDone', value: boolean): void;
}

// @ts-ignore
const props = withDefaults(defineProps<FormProps>(), {
    needCorrectExistingValues: true,
    id: 'form',
    formName: 'form'
});

// @ts-ignore
const emits = defineEmits<FormEmits>();

let formDoneSent = false;

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
.form {
    --background-color: white;
    --text-color: black;
    --form-title-color: black;
    --form-subtitle-color: grey;
    --section-title-color: black;
    --section-side-color: lightgrey;
    --field-subtext-color: grey;
    --error-message-color: crimson;

    background-color: var(--background-color);
    & * {
        font-size: 14px;
        color: var(--text-color);
        font-weight: 400;
        letter-spacing: 1px;
        //  font-family: system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    }
    input {
        //    background-color: lightblue;
    }
    & section {
        &:nth-child(2n) {
            //  background: #f0f2f7;
        }
        &:nth-child(2n + 1) {
            //   background: #f5f6fa;
        }
    }
    & section {
        margin: 10px 0 10px;
        padding-left: 20px;
        border-left: 3px solid var(--section-side-color); //  border-radius: 10px;
        &.row .field-block {
            display: flex;
        }
    }
    h1 {
        font-weight: 600;
        font-size: 14px;
        color: var(--section-title-color);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin: 5px;
    }
    > h1 {
        font-size: 24px;
        text-align: center;
        color: var(--form-title-color);
    }
    h2 {
        font-size: 18px;
        text-align: center;
        color: var(--form-subtitle-color);
    }

    .field-wrapper {
        display: flex;
        flex-direction: column;
        margin: 10px;
        label {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .subtext {
            font-size: 12px;
            color: var(--field-subtext-color);
        }
        .error-message {
            font-size: 14px;
            font-weight: 600;
            color: var(--error-message-color);
        }
        .field {
            display: flex;
            flex-direction: row;
            margin-bottom: 0;
            .input-wrapper {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
        }
    }
    .field-group {
        &.row-start {
            display: flex;
            flex-wrap: wrap;
        }
    }
    .p-speeddial {
        position: relative;
        button {
            scale: 0.6;
        }
    }

    .p-speeddial-action {
        // Modifies the button colour on speedial open.
        background-color: rgb(200, 200, 200);
    }
}
</style>
