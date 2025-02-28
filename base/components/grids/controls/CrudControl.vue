<template>
    <div class="crud-control">
        <slot v-if="!noButton" :onClick="toggleDialog">
            <Button :label="defaultLabels[props.function]" :icon="defaultIcons[props.function]" :severity="defaultSeverity[props.function]" outlined raised @click="toggleDialog" />
        </slot>

        <DataItem
            v-if="(dialogVisible || !props.dialogEdit) && props.collection"
            :collection="collection"
            :function="props.function"
            :id="props.itemId"
            :initialItem="props.initialItem"
            @save="handleSave"
            :dialogEdit="props.dialogEdit"
            :visible="dialogVisible"
            @update:visible="(val) => (dialogVisible = val)"
            :dialogHeader="`${defaultLabels[props.function]} ${collection}`"
            saveButton
            :deleteButton="props.deleteButton && props.function === 'update'"
            @delete="handleDelete"
            @click="preventDefault ? $event.preventDefault() : null"
        />
    </div>
</template>

<script setup lang="ts">
type CrudFunction = 'create' | 'update' | 'delete';

const props = withDefaults(
    defineProps<{
        collection?: string;
        function: CrudFunction;
        itemId?: string;
        initialItem?: any;
        noButton?: boolean;
        dialogEdit?: boolean;
        preventDefault?: boolean;
        deleteButton?: boolean; // Add this prop
    }>(),
    {
        function: 'create',
        noButton: false,
        dialogEdit: true,
        preventDefault: false,
        deleteButton: false // Add this default
    }
);

const emit = defineEmits<{
    save: [any];
    delete: [any];
}>();

const dialogVisible = ref(false);

const defaultLabels: Record<CrudFunction, string> = {
    create: 'Add',
    update: 'Edit',
    delete: 'Delete'
};

const defaultIcons: Record<CrudFunction, string> = {
    create: 'pi pi-plus',
    update: 'pi pi-pencil',
    delete: 'pi pi-trash'
};

const defaultSeverity: Record<CrudFunction, string> = {
    create: 'primary',
    update: 'secondary',
    delete: 'danger'
};

async function handleSave(savedData: any) {
    console.log('CrudControl - Save started', {
        collection: props.collection,
        savedData
    });
    console.log('CrudControl - Handling save');
    dialogVisible.value = false;
    emit('save', savedData);
    console.log('CrudControl - Save handled');
}

async function handleDelete(deletedData: any) {
    dialogVisible.value = false;
    emit('delete', deletedData);
}

function toggleDialog() {
    if (props.dialogEdit) {
        dialogVisible.value = true;
    }
    // When not in dialog mode, the form is already visible
}

// Expose these methods for external use
defineExpose({
    toggleDialog,
    handleSave,
    handleDelete
});

// Add condition logging
watch(
    () => props.collection,
    (newVal) => {
        console.log('CrudControl - Collection changed:', {
            collection: newVal,
            dialogVisible: dialogVisible.value,
            dialogEdit: props.dialogEdit,
            shouldShow: (dialogVisible.value || !props.dialogEdit) && newVal
        });
    }
);
</script>
