<script setup lang="ts">
interface IItem {
    _doc: string;
    completed: any;
}

import { ref, onBeforeMount } from 'vue';
import List from './List.vue';

const dataLoaded = ref(false);
const dialogVisible = ref(false);
const dialogHeader = ref('');
const selectedItem = ref<IItem | null>(null);

onBeforeMount(async () => {
    dataLoaded.value = true;
});

let saveRawFunc: (data: any) => Promise<void>;
let deleteRawFunc: (dataId: string) => Promise<void>;

function onDataItemMounted(result: { hooks: any }) {
    saveRawFunc = result.hooks?.saveRawFunc;
    deleteRawFunc = result.hooks?.deleteRawFunc;
}

const onCheckboxChange = async (updatedItem: IItem) => {
    if (saveRawFunc) {
        await saveRawFunc(updatedItem);
    }
    reloadData();
};

const onDeleteItem = async (deletedItem: IItem) => {
    await deleteRawFunc(deletedItem._doc);
    reloadData();
};

const openEditDialog = (item: IItem) => {
    selectedItem.value = item;
    dialogHeader.value = 'Edit Item';
    dialogVisible.value = true;
};

const openCreateDialog = () => {
    selectedItem.value = null;
    dialogHeader.value = 'Create Item';
    dialogVisible.value = true;
};

function reloadData() {
    return new Promise<void>((resolve) => {
        dataLoaded.value = false;
        setTimeout(() => {
            dataLoaded.value = true;
            resolve();
        }, 500);
    });
}
</script>

<template>
    <div class="card">
        <template v-if="dataLoaded">
            <div class="flex justify-content-between align-items-center mb-5">
                <span class="text-900 text-xl font-semibold">Item List</span>
                <Button class="font-semibold" outlined icon="pi pi-plus" label="Create Item" @click="openCreateDialog()"></Button>
            </div>

            <DataItem function="read" collection="events" :find="{ completed: { $ne: true } }" v-slot="{ items }" @mounted="onDataItemMounted">
                <List :task-list="items" title="ToDo" @checkbox:change="onCheckboxChange" @delete:task="onDeleteItem" @open:edit:dialog="openEditDialog"> </List>
            </DataItem>

            <DataItem function="read" collection="events" :find="{ completed: true }" v-slot="{ items }">
                <List :task-list="items" title="Completed" @checkbox:change="onCheckboxChange" @delete:task="onDeleteItem" @open:edit:dialog="openEditDialog"> </List>
            </DataItem>
        </template>

        <DataItem
            collection="events"
            :function="selectedItem?._doc ? 'update' : 'create'"
            :id="selectedItem?._doc"
            :initialItem="selectedItem"
            @save="reloadData"
            saveButton
            cancelButton
            dialogEdit
            :visible="dialogVisible"
            @update:visible="(val) => (dialogVisible = val)"
            :dialogHeader="dialogHeader"
        />
    </div>
</template>
