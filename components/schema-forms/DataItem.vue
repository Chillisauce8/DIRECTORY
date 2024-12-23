<template>
  <div class="data-item">
    <template v-if="isCreateUpdate">
        <!-- Container element -->
        <div class="form-container">
            <SchemaForm
                :formName="formName"
                :fields="props.fields"
                :title="props.title"
                :subtitle="props.subtitle"
                :id="formName"
                v-if="formDescription"
                :description="formDescription"
                :model="vm.model"
                @modelChange="onModelChange($event)"
                :needCorrectExistingValues="false"
                :formLabelType="props.formLabelType"
                :floatLabelVariant="props.floatLabelVariant"
                class="form"
            >
            </SchemaForm>
        </div>
        <Button v-if="props.saveButton" icon="pi pi-save" aria-label="Save Form" @click="saveModel()"> Save </Button>
    </template>
    <template v-else-if="props.function === 'read'">
        <template v-if="targetItem || targetItems">
            <template v-if="isReadSingle && props.defaultView">
                <SchemaForm :formName="formName" :title="props.title" :subtitle="props.subtitle" :id="formName" v-if="formDescription" :description="formDescription" :model="targetItem" :needCorrectExistingValues="false"> </SchemaForm>
            </template>
            <template v-else>
                <slot :item="targetItem" :items="targetItems" :schema="schemaItem"></slot>
            </template>
        </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import useSchemaFormController from '~/composables/schema-forms/useSchemaFormController';
import { httpService } from '~/service/http/http.service';
import { DEFAULT_FORM_LABEL_TYPE, DEFAULT_FLOAT_LABEL_VARIANT } from '~/types/schema-forms';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';

interface FieldProps {
    collection: string;
    function: 'create' | 'read' | 'update';
    find?: Object;
    fields?: Object;
    id?: string;
    title?: string;
    subtitle?: string;
    schema?: boolean;
    initialData?: any;
    defaultView?: boolean;
    saveButton?: boolean;
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
}

// @ts-ignore
const props = withDefaults(defineProps<FieldProps>(), {
    formLabelType: DEFAULT_FORM_LABEL_TYPE,
    floatLabelVariant: DEFAULT_FLOAT_LABEL_VARIANT
});
// @ts-ignore
const emits = defineEmits(['mounted', 'changed']);

const isCreateUpdate = ['create', 'update'].includes(props.function);
const isReadSingle = props.function === 'read' && !!props.id;
const isReadMulti = props.function === 'read' && !props.id;
const needSchema = props.schema;

const collectionName = props.collection;

const formName = props.collection + '-form';
const { vm, formDescription, sharedFunctions } = useSchemaFormController(formName, props.fields);

let dataToSave: any;

const targetItem = ref(null);
const targetItems = ref(null);
const schemaItem = ref(null);

sharedFunctions.getSchemaName = () => {
    return collectionName;
};

sharedFunctions.createTarget = async (dataToSave: any): Promise<any> => {
    return httpService.post(`/api/create/${collectionName}`, dataToSave).then((response: any) => {
        return response.data;
    });
};

sharedFunctions.updateTarget = async (dataToSave: any): Promise<any> => {
    return httpService.update(`/api/update/${collectionName}`, dataToSave).then((response: any) => {
        return response.data;
    });
};

sharedFunctions.deleteTarget = async (dataId: string): Promise<boolean> => {
    return httpService.delete(`/api/delete/${collectionName}/${dataId}`).then((response: any) => {
        return response.ok;
    });
};

sharedFunctions.getTargetName = (): string => {
    return collectionName;
};

sharedFunctions.getTarget = async (): Promise<any> => {
    if (props.id) {
        return httpService.get(`/api/get/${collectionName}/${props.id}`).then((response: any) => {
            return response.data;
        });
    }

    return {};
};

const getDefinition = async (): Promise<any> => {
    return httpService.get(`/api/sys/definitions/${props.collection}`).then((response: any) => {
        return response.data;
    });
};

sharedFunctions.buildFormDescription = async (showTitles = true): Promise<any> => {
    const readonly = props.function === 'read';
    return vm.schemaFormsBuildHelper.buildFormDescription(showTitles, readonly);
};

sharedFunctions.isEditMode = () => {
    return !!props.id;
};

onMounted(async () => {
    emits('mounted', { hooks: { saveRawFunc: saveRaw, deleteRawFunc: deleteRaw } });

    if (isCreateUpdate) {
        sharedFunctions.doOnMounted();

        if (props.initialData) {
            vm.model = { ...vm.model, ...props.initialData };
        }
    } else {
        if (needSchema) {
            schemaItem.value = await getDefinition();
        }

        if (isReadSingle) {
            const response = await httpService.get(`/api/get/${collectionName}/${props.id}`, {
                h: { $fields: props.fields }
            });

            if (needSchema) {
                targetItem.value = mergeSchemaAndItem(schemaItem.value, response.data);
            } else {
                targetItem.value = response.data;
            }

            if (props.defaultView) {
                sharedFunctions.doOnMounted();
            }
        } else if (isReadMulti) {
            const response = await httpService.get(`/api/query`, {
                collection: collectionName,
                q: props.find,
                h: { $fields: props.fields }
            });

            if (needSchema) {
                targetItems.value = response.data.map((nodeItem: any) => mergeSchemaAndItem(schemaItem.value, nodeItem));
            } else {
                targetItems.value = response.data;
            }
        }
    }
});

onDeactivated(() => {
    sharedFunctions.onDeactivated();
});

function onModelChange(value: any) {
    dataToSave = value;
    emits('changed', { data: dataToSave, saveDataFunc: saveModel });
}

async function saveModel() {
    return sharedFunctions.save(dataToSave);
}

async function saveRaw(dataToSave: any) {
    return sharedFunctions.saveRaw(dataToSave);
}

async function deleteRaw(dataId: string) {
    return sharedFunctions.deleteRaw(dataId);
}

function mergeSchemaAndItem(schemaPart: any, nodePart: any) {
    let value: any;

    if (schemaPart._type === 'collections') {
        value = {};
        for (const key in schemaPart.properties) {
            if (!nodePart[key]) {
                continue;
            }

            value[key] = mergeSchemaAndItem(schemaPart.properties[key], nodePart[key]);
        }

        return value;
    } else if (schemaPart.type === 'object') {
        value = {};
        for (const key in schemaPart.properties) {
            if (!nodePart[key]) {
                continue;
            }

            value[key] = mergeSchemaAndItem(schemaPart.properties[key], nodePart[key]);
        }

        return {
            value,
            schema: schemaPart
        };
    } else if (schemaPart.type === 'array') {
        value = [];

        if (nodePart?.length) {
            for (const arrayItem of nodePart) {
                value.push(mergeSchemaAndItem(schemaPart['items'], arrayItem));
            }
        }

        return { value, schema: schemaPart };
    } else {
        return { value: nodePart, schema: schemaPart };
    }
}
</script>

<style lang="scss">
// Add wrapper container
.form-container {
    // Main
    --background-color: white;
    --text-color: black;
    --base-font-size: 14px;

    // Title
    --form-title-size: 2em;
    --form-title-color: var(--text-color);

    // Subtitle
    --form-subtitle-size: 1.2em;
    --form-subtitle-color: var(--text-color);

    --section-title-color: black;
    --section-side-color: lightgrey;
    --field-subtext-color: grey;
    --error-message-color: crimson;

    // Enable container queries
    width: 100%; // Required - container needs dimension
    container-type: inline-size;
    container-name: form;
    // min-height: 100%;

    .form {
        // Container query rules
        @container form (min-width: 1001px) {
            --background-color: rgb(205, 205, 219);
            --base-font-size: 16px;
        }
        @container form (max-width: 1000px) {
            --background-color: rgb(220, 203, 203);
            --base-font-size: 14px;
        }
        @container form  (max-width: 600px) {
            --background-color: rgb(221, 224, 221);
            --base-font-size: 12px;
        }
        @container form (max-width: 400px) {
            --background-color: white;
            --base-font-size: 10px;
        }

        background-color: var(--background-color);
        font-size: var(--base-font-size);

        > .title {
            font-size: var(--form-title-size);
            color: var(--form-title-color);
            text-align: center;
        }
        > .subtitle {
            font-size: var(--form-subtitle-size);
            color: var(--form-subtitle-color);
            text-align: center;
        }

        // Needed to make input size change
        .p-inputtext {
            font-size: var(--base-font-size);
        }

        section {
            // margin: 10px 0 10px;
            // padding-left: 20px;
            // border-left: 3px solid var(--section-side-color); //  border-radius: 10px;
            &.row .field-block {
                display: flex;
                gap: 1em;
                & > * {
                    flex-grow: 1;
                }
            }
        }

        h1 {
            font-weight: 600;
            //  font-size: 14px;
            color: var(--section-title-color);
            text-transform: uppercase;
            letter-spacing: 2px;
            // margin: 5px;
        }

        .field-wrapper {
            display: flex;
            flex-direction: column;
            margin-bottom: 10px;
            label {
                font-weight: 500;
                letter-spacing: 2px;

                // margin-bottom: 4px;
            }
            .subtext {
                //  font-size: 12px;
                color: var(--field-subtext-color);
            }
            .error-message {
                // font-size: 14px;
                // font-weight: 600;
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
                scale: 1;
            }
        }

        .p-speeddial-action {
            // Modifies the button colour on speedial open.
            background-color: rgb(200, 200, 200);
        }

        .array-of-object-header {
            display: flex;
            justify-content: space-between;
            .p-button:first-of-type {
                background-color: grey;
                border-color: grey;
            }
        }
    }
}
</style>
