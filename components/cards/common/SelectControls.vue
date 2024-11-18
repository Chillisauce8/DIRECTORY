<template>
    <div v-if="mode === 'edit' || mode === 'select'" class="select-controls">
        <ToggleButton v-model="selectAll" class="select-all" onLabel="Deselect All" offLabel="Select All" onIcon="pi pi-check-circle" offIcon="pi pi-circle" aria-label="Do you confirm" />
        <template v-if="hasSelectedCards">
            <Button v-if="mode === 'select'" label="Add Selected" class="add-selected" icon="pi pi-plus-circle" outlined raised @click="$emit('add-selected')" />
            <template v-if="mode === 'edit'">
                <Button label="Delete Selected" class="delete-selected" icon="pi pi-trash" outlined raised @click="confirmDelete" />
                <slot name="edit-controls" />
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PropType } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

interface Category {
    name: string;
    id: number;
}

const props = defineProps({
    mode: {
        type: String as PropType<'view' | 'select' | 'edit' | 'order'>,
        required: true
    },
    selectedItems: {
        type: Array as PropType<string[]>,
        default: () => []
    },
    categoryOptions: {
        type: Array as PropType<Category[]>,
        default: () => []
    }
});

const emit = defineEmits<{
    'select-all': [boolean];
    'delete-selected': [];
    'add-selected': [];
}>();

const confirm = useConfirm();
const toast = useToast();

const selectAll = ref(false);
const hasSelectedCards = computed(() => props.selectedItems.length > 0);

function confirmDelete() {
    confirm.require({
        header: 'Confirm Delete',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger'
        },
        accept: () => {
            emit('delete-selected');
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Selected items have been deleted',
                life: 3000
            });
        }
    });
}

// Remove handleAdd and handleRemove functions - they're not needed anymore

watch(selectAll, (newValue) => {
    emit('select-all', newValue);
});

watch(
    () => props.selectedItems,
    (newVal) => {
        console.log('SelectControls selectedItems changed:', newVal);
    },
    { deep: true }
);
</script>
