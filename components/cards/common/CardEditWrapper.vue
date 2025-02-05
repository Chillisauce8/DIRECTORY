<template>
    <div class="card-edit-wrapper">
        <CrudControl :collection="collection" function="update" :dialogEdit="false" :itemId="itemId" :initialItem="props.dataItem" noButton preventDefault @save="onSave" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { createSelectedStore } from '~/stores/useSelectedStore';
import { useCardStore } from '~/stores/useCardStore';

const props = defineProps({
    collection: { type: String, required: true },
    dataItem: { type: Object, required: true },
    gridId: { type: String, required: true }
});

const emit = defineEmits(['save']);
const selectionStore = createSelectedStore(props.gridId)();
const cardStore = useCardStore();

const itemId = computed(() => props.dataItem?._id || props.dataItem?.id);

async function onSave(event: any) {
    const id = itemId.value;
    await cardStore.updateCard(props.collection, id, event);
    emit('save', event);
    await selectionStore.deselect(props.dataItem._id);
}
</script>

<style lang="scss">
.card-edit-wrapper {
    padding: 1rem;
}
</style>
