<template>
    <!-- CardEditWrapper mount -->
    <transition name="card-edit">
        <div class="card-edit-wrapper" v-if="showEdit">
            <CrudControl :collection="collection" function="update" :dialogEdit="false" :itemId="itemId" :initialItem="props.dataItem" noButton preventDefault @save="onSave" />
        </div>
    </transition>
    <!-- CardEditWrapper end -->
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { useSelectedStore } from '~/stores/useSelectedStore';
import { useModeStore } from '~/stores/useModeStore';
import { useCardStore } from '~/stores/useCardStore';

const props = defineProps({
    collection: { type: String, required: true },
    dataItem: { type: Object, required: true }
});

const emit = defineEmits(['save']);
const selectionStore = useSelectedStore();
const modeStore = useModeStore();
const cardStore = useCardStore();

// Update itemId computation to check both _id and id
const itemId = computed(() => {
    const id = props.dataItem?._id || props.dataItem?.id;
    console.log('CardEditWrapper - Computing itemId:', {
        dataItem: props.dataItem,
        _id: props.dataItem?._id,
        id: props.dataItem?.id,
        finalId: id
    });
    return id;
});

const showEdit = computed(() => {
    const isEditMode = modeStore.isEditMode;
    const isItemSelected = selectionStore.isSelected(itemId.value);
    console.log('CardEditWrapper - Computing showEdit', {
        itemId: itemId.value,
        collection: props.collection,
        isEditMode,
        isItemSelected,
        result: isEditMode && isItemSelected
    });
    return isEditMode && isItemSelected;
});

// Optional debug watcher
watch(
    showEdit,
    (newValue) => {
        console.log('CardEditWrapper visibility:', {
            id: props.dataItem._id,
            mode: modeStore.currentMode,
            isSelected: selectionStore.isSelected(props.dataItem._id),
            showEdit: newValue
        });
    },
    { immediate: true }
);

async function onSave(event: any) {
    const id = itemId.value;
    console.log('CardEditWrapper - Starting save', { id });
    await cardStore.updateCard(props.collection, id, event);
    console.log('CardEditWrapper - Card updated');

    emit('save', event);
    console.log('CardEditWrapper - Save emitted');

    console.log('CardEditWrapper - Before deselect', {
        isSelected: selectionStore.isSelected(props.dataItem._id)
    });

    await selectionStore.deselect(props.dataItem._id);

    // Wait for state updates
    await nextTick();

    console.log('CardEditWrapper - After deselect', {
        isSelected: selectionStore.isSelected(props.dataItem._id)
    });
}
</script>

<style lang="scss">
.card-edit-wrapper {
    padding: 1rem;
}
</style>
