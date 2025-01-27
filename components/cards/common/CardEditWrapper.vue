<template>
    <transition name="card-edit">
        <div class="card-edit-wrapper" v-if="showEdit">
            <CrudControl :collection="collection" function="update" :dialogEdit="false" :itemId="dataItem._id" :initialItem="dataItem" noButton preventDefault @save="onSave" />
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
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

const showEdit = computed(() => modeStore.isEditMode && selectionStore.isSelected(props.dataItem._id));

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

function onSave(event: any) {
    cardStore.updateCard(props.collection, props.dataItem._id, event);
    emit('save', event);
    selectionStore.deselect(props.dataItem._id);
}
</script>

<style lang="scss">
.card-edit-wrapper {
    padding: 1rem;
}
</style>
