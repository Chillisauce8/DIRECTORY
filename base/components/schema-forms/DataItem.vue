<template>
    <div class="data-item">
        <Dialog v-if="props.dialogEdit" :visible="props.visible" @update:visible="(val) => emits('update:visible', val)" :modal="true" :style="{ width: '50rem' }" :closable="true" :header="props.dialogHeader" @hide="cancelForm">
            <!-- Form content for dialog -->
            <template v-if="isCreateUpdate">
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

                    <div class="form-button-container">
                        <Button v-if="props.deleteButton && props.initialItem?._id" class="delete-button form-button" icon="pi pi-trash" v-bind="{ ...defaultDeleteButtonProps, ...props.deleteButtonProps }" @click="handleDelete" />
                        <Button v-if="props.cancelButton" class="cancel-button form-button" icon="pi pi-times" v-bind="{ ...defaultCancelButtonProps, ...props.cancelButtonProps }" @click="cancelForm" />
                        <Button v-if="props.saveButton" class="save-button form-button" icon="pi pi-check" v-bind="{ ...defaultSaveButtonProps, ...props.saveButtonProps }" @click="saveModel" />
                    </div>
                </div>
            </template>
        </Dialog>

        <div v-else>
            <!-- Non-dialog content -->
            <template v-if="isCreateUpdate">
                <div class="form-container">
                    <!-- Same form content as above -->
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
                    <div class="form-button-container">
                        <Button v-if="props.deleteButton && props.initialItem?._id" class="delete-button form-button" icon="pi pi-trash" v-bind="{ ...defaultDeleteButtonProps, ...props.deleteButtonProps }" @click="handleDelete" />
                        <Button v-if="props.cancelButton" class="cancel-button form-button" icon="pi pi-times" v-bind="{ ...defaultCancelButtonProps, ...props.cancelButtonProps }" @click="cancelForm" />
                        <Button v-if="props.saveButton" class="save-button form-button" icon="pi pi-check" v-bind="{ ...defaultSaveButtonProps, ...props.saveButtonProps }" @click="saveModel" />
                    </div>
                </div>
            </template>
            <template v-else-if="props.function === 'read'">
                <!-- Existing read template content -->
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
    </div>
</template>

<script setup lang="ts">
// This component is a versatile data management component that can:
// 1. Create new items
// 2. Read existing items (single or multiple)
// 3. Update existing items
// 4. Delete items
// It can work either in a dialog mode or inline mode

// Import core functionality
import useSchemaFormController from '~/composables/schema-forms/useSchemaFormController';
import { httpService } from '~/service/http/http.service';
import { DEFAULT_FORM_LABEL_TYPE, DEFAULT_FLOAT_LABEL_VARIANT } from '~/types/schema-forms';
import type { FormLabelType, FloatLabelVariant } from '~/types/schema-forms';
import { useToast } from 'primevue/usetoast';

// Define what props (input parameters) the component accepts
interface FieldProps {
    collection: string; // The database collection to work with
    function: 'create' | 'read' | 'update'; // What operation to perform
    find?: Object; // Search criteria for reading multiple items
    fields?: Object; // Which fields to include/exclude
    id?: string; // ID of item when reading/updating single item
    title?: string;
    subtitle?: string;
    schema?: boolean;
    initialData?: any;
    dialogEdit?: boolean;
    defaultView?: boolean;
    saveButton?: boolean;
    cancelButton?: boolean;
    formLabelType?: FormLabelType;
    floatLabelVariant?: FloatLabelVariant;
    saveButtonProps?: Object;
    cancelButtonProps?: Object;
    dialogHeader?: string;
    visible?: boolean;
    initialItem?: any; // Changed from initialTask
    deleteButton?: boolean;
    deleteButtonProps?: Object;
}

// Default properties for our buttons
const defaultSaveButtonProps = {
    label: 'Save',
    type: 'button',
    severity: 'secondary'
};

const defaultCancelButtonProps = {
    label: 'Cancel',
    type: 'button',
    severity: 'secondary'
};

const defaultDeleteButtonProps = {
    label: 'Delete',
    type: 'button',
    severity: 'danger'
};

// Main component setup
// @ts-ignore
const props = withDefaults(defineProps<FieldProps>(), {
    formLabelType: DEFAULT_FORM_LABEL_TYPE,
    floatLabelVariant: DEFAULT_FLOAT_LABEL_VARIANT,
    saveButtonProps: () => ({}),
    cancelButtonProps: () => ({}),
    dialogEdit: false,
    dialogHeader: '',
    visible: false,
    deleteButtonProps: () => ({}),
    defaultView: false,
    saveButton: true,
    cancelButton: true,
    deleteButton: false
});
// @ts-ignore
const emits = defineEmits(['mounted', 'changed', 'cancel', 'save', 'delete', 'update:visible']);

// Helper flags to determine component behavior
const isCreateUpdate = ['create', 'update'].includes(props.function); // Are we creating/updating?
const isReadSingle = props.function === 'read' && !!props.id; // Are we reading one item?
const isReadMulti = props.function === 'read' && !props.id; // Are we reading multiple items?
const needSchema = props.schema;

const collectionName = props.collection;

// Setup form controller and data management
const formName = props.collection + '-form';
const { vm, formDescription, sharedFunctions } = useSchemaFormController(formName, props.fields);

// References to hold our data
const targetItem = ref(null); // For single item operations
const targetItems = ref(null); // For multiple item operations
const schemaItem = ref(null); // Holds the data structure definition

const toast = useToast();

sharedFunctions.getSchemaName = () => {
    return collectionName;
};

// API interaction functions
sharedFunctions.createTarget = async (dataToSave: any): Promise<any> => {
    // Create new item in database
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
    emits('mounted', { hooks: { deleteRawFunc: deleteRaw } });

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

// Track form data like CreateTaskDialogWithDb did
const formData = ref(null);
const item = ref({}); // Changed from task

// Watch for changes in the form
function onModelChange(value: any) {
    // When form data changes, update our local copy and preserve ID if updating
    if (props.function === 'update' && props.initialItem?._id) {
        item.value = { ...value, _id: props.initialItem._id };
    } else {
        item.value = value;
    }
    formData.value = value;
    emits('changed', { data: item.value, saveDataFunc: saveRaw });
}

// Add new refs and methods for dialog handling
const selectedItem = ref(props.initialItem || null); // Changed from selectedTask

// Save functionality
async function saveModel() {
    try {
        // Handle both create and update cases
        // For updates, ensure we're using the correct function and ID
        if (props.function === 'update' && props.initialItem?._id) {
            const savedData = await sharedFunctions.save({ ...item.value, _id: props.initialItem._id });

            if (!savedData) {
              return;
            }

            emits('save', savedData);
        } else {
            const savedData = await sharedFunctions.save(item.value);

            if (!savedData) {
              return;
            }

            emits('save', savedData);
        }

        // Reset form state
        vm.model = {};
        formData.value = null;
        item.value = {};
        selectedItem.value = null;
        emits('update:visible', false); // Add this line

        toast.add({ severity: 'success', summary: 'Success', detail: 'Saved successfully', life: 3000 });
    } catch (error) {
        console.error('Save failed:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save', life: 3000 });
        throw error;
    }
}

// Reset form functionality
function cancelForm() {
    // Clear all form data and close dialog if open
    // Reset all form state
    vm.model = {};
    formData.value = null;
    item.value = {};
    selectedItem.value = null;
    emits('update:visible', false); // Add this line
    emits('cancel');
}

// Delete functionality
async function handleDelete() {
    try {
        // Delete item and clean up form
        if (props.initialItem?._id) {
            await sharedFunctions.deleteTarget(props.initialItem._id);
            emits('delete');

            // Reset form state
            vm.model = {};
            formData.value = null;
            item.value = {};
            selectedItem.value = null;
            emits('update:visible', false);

            toast.add({ severity: 'success', summary: 'Success', detail: 'Deleted successfully', life: 3000 });
        }
    } catch (error) {
        console.error('Delete failed:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete', life: 3000 });
        throw error;
    }
}

// Watch for initialItem changes
watch(
    () => props.initialItem,
    (newItem) => {
        // Update form when initial item changes
        selectedItem.value = newItem;
        if (newItem) {
            vm.model = { ...newItem };
            item.value = { ...newItem };
        }
    },
    { immediate: true }
);

// Add expose at the end of script setup
defineExpose({
    saveModel,
    cancelForm,
    handleDelete
});

// Add watch for visible prop to handle initialItem
watch(
    () => props.visible,
    (newVisible) => {
        if (newVisible && props.initialItem) {
            vm.model = { ...props.initialItem };
        }
    },
    { immediate: true }
);

async function saveRaw(dataToSave: any) {
    return sharedFunctions.saveRaw(dataToSave);
}

async function deleteRaw(dataId: string) {
    return sharedFunctions.deleteRaw(dataId);
}

// Helper function to merge schema definition with actual data
function mergeSchemaAndItem(schemaPart: any, nodePart: any) {
    // Recursively combines schema definition with actual data
    // Used to ensure data follows the correct structure
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
    --form-max-width: 600px;

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

    --min-button-width: 100px;

    // Enable container queries
    width: 100%; // Required - container needs dimension
    container-type: inline-size;
    container-name: form;
    display: flex;
    flex-direction: column;
    align-items: center;

    // min-height: 100%;

    .form {
        background-color: var(--background-color);
        font-size: var(--base-font-size);
        width: 100%;
        max-width: var(--form-max-width);

        @container form (min-width: 600px) {
            //      --background-color: rgb(220, 203, 203);
            & {
                --base-font-size: 14px;
            }
        }
        
        @container form (max-width: 500px) {
            //     --background-color: rgb(221, 224, 221);
            & {
                --base-font-size: 12px;
            }
        }
        
        @container form (max-width: 400px) {
            //     --background-color: white;
            & {
                --base-font-size: 10px;
            }
        }

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
        .toggle-visibility {
            // display: none;
            opacity: 0;
            &.show {
                // display: block;
                opacity: 0;
                animation: fadein 1s ease-in forwards, update-height 1s ease-in forwards;
            }
            &.hide {
                opacity: 0;
                animation: fadeout 0.5s ease-in forwards, collapse-height 0.5s ease-in forwards;
            }
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
    .form-button-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        gap: 1em;
        margin-top: 1em;
        .form-button {
            min-width: var(--min-button-width);
            flex-grow: 1;
        }
    }
}
</style>
