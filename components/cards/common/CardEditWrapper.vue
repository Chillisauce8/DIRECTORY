<template>
    <transition name="card-edit">
        <div class="card-edit-wrapper" v-if="showWrapper">
            <CrudControl :collection="collection" function="update" :dialogEdit="false" :itemId="dataItem._id" :initialItem="dataItem" noButton preventDefault @save="onSave" />
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useSelectionStore } from '~/stores/useSelectionStore';
import { useModeStore } from '~/stores/useModeStore';

const props = defineProps({
    collection: { type: String, required: true },
    dataItem: { type: Object, required: true }
});

const emit = defineEmits(['save']);
const selectionStore = useSelectionStore();
const modeStore = useModeStore();

const showWrapper = computed(() => modeStore.isEditMode && selectionStore.isSelected(props.dataItem._id));

function onSave(event: any) {
    emit('save', event);
    selectionStore.deselect(props.dataItem._id);
}
</script>

<style lang="scss">
.card-edit-wrapper {
    padding: 1rem;
}
</style>
