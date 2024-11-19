<template>
    <multi-select v-model="selectedItems" display="chip" :options="options" :optionLabel="optionLabel" filter :placeholder="placeholder" :maxSelectedLabels="maxSelectedLabels" :class="className">
        <template #footer>
            <div class="p-3 flex justify-between">
                <Button label="Add To Selected" class="add-to-selected" severity="secondary" text size="small" icon="pi pi-plus" @click="confirmAdd" />
                <Button label="Remove From Selected" class="remove-from-selected" severity="danger" text size="small" icon="pi pi-times" @click="confirmRemove" />
            </div>
        </template>
    </multi-select>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type { PropType } from 'vue';

// Add type for the injected function
type UpdateArrayFieldFn = (field: string, items: any[], action: 'add' | 'remove') => void;

// Type the injected function
const updateArrayField = inject<UpdateArrayFieldFn>('updateArrayField');

const emit = defineEmits<{
    'update:modelValue': [any[]];
    'update-field': [string, any[], 'add' | 'remove'];
}>();

const confirm = useConfirm();
const toast = useToast();

const props = defineProps({
    modelValue: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    options: {
        type: Array as PropType<any[]>,
        required: true
    },
    editField: {
        type: String,
        required: true
    },
    optionLabel: {
        type: String,
        default: 'name'
    },
    placeholder: {
        type: String,
        default: 'Select Items'
    },
    maxSelectedLabels: {
        type: Number,
        default: 2
    },
    className: {
        type: String,
        default: 'w-full md:w-80'
    },
    addLabel: {
        type: String,
        default: 'Add To Selected'
    },
    removeLabel: {
        type: String,
        default: 'Remove From Selected'
    },
    confirmAdd: {
        type: Boolean,
        default: true
    },
    confirmRemove: {
        type: Boolean,
        default: true
    }
});

const selectedItems = ref<any[]>([]);

watch(
    () => props.modelValue,
    (newValue) => {
        selectedItems.value = newValue;
    },
    { deep: true }
);

watch(
    selectedItems,
    (newValue) => {
        emit('update:modelValue', newValue);
    },
    { deep: true }
);

const confirmAdd = () => {
    if (!props.confirmAdd) {
        handleAdd();
        return;
    }

    confirm.require({
        header: 'Add Items',
        message: 'Are you sure you want to add these items to the selection?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => handleAdd(),
        reject: () => {
            selectedItems.value = [];
        }
    });
};

const confirmRemove = () => {
    if (!props.confirmRemove) {
        handleRemove();
        return;
    }

    confirm.require({
        header: 'Remove Items',
        message: 'Are you sure you want to remove these items from the selection?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => handleRemove(),
        reject: () => {
            selectedItems.value = [];
        }
    });
};

const handleAdd = () => {
    console.log('EditArrayControl handleAdd - Items to add:', selectedItems.value);

    if (updateArrayField) {
        const itemsToAdd = selectedItems.value.map((item) => ({
            id: item.id,
            name: item.name
        }));

        updateArrayField(props.editField, itemsToAdd, 'add');

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Items have been added to selection',
            life: 3000
        });
        selectedItems.value = [];
    }
};

const handleRemove = () => {
    console.log('EditArrayControl handleRemove - Items to remove:', selectedItems.value);

    if (updateArrayField) {
        const itemsToRemove = selectedItems.value.map((item) => ({
            id: item.id,
            name: item.name
        }));

        updateArrayField(props.editField, itemsToRemove, 'remove');

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Items have been removed from selection',
            life: 3000
        });
        selectedItems.value = [];
    }
};
</script>
