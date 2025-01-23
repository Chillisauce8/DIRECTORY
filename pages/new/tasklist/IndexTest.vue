<script setup lang="ts">
interface thisItem {
    _id: string;
}

import { ref, onBeforeMount } from 'vue';
import List from './List.vue';
import CrudControl from '~/components/grids/controls/CrudControl.vue';

const dataLoaded = ref(false);

onBeforeMount(async () => {
    dataLoaded.value = true;
});

let deleteRawFunc: (dataId: string) => Promise<void>;

function onDataItemMounted(result: { hooks: any }) {
    deleteRawFunc = result.hooks?.deleteRawFunc;
}

const onDeleteItem = async (deletedItem: thisItem) => {
    await deleteRawFunc(deletedItem._id);
    reloadData();
};

const openEditDialog = (item: thisItem) => {
    selectedItem.value = item;
    dialogHeader.value = 'Edit Item';
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
                <CrudControl collection="events" function="create" @save="reloadData">
                    <template #default="{ onClick }">
                        <Button class="font-semibold" outlined icon="pi pi-plus" label="Create Item" @click="onClick" />
                    </template>
                </CrudControl>
            </div>

            <DataItem function="read" collection="events" :find="{ completed: { $ne: true } }" v-slot="{ items }" @mounted="onDataItemMounted">
                <List :task-list="items" title="ToDo" @delete:task="onDeleteItem" @save:task="reloadData"> </List>
            </DataItem>

            <DataItem function="read" collection="events" :find="{ completed: true }" v-slot="{ items }">
                <List :task-list="items" title="Completed" @delete:task="onDeleteItem" @open:edit:dialog="openEditDialog"> </List>
            </DataItem>
        </template>

        <!-- Remove this since functionality is now in AddControl -->
        <!-- <DataItem
            collection="events"
            :function="selectedItem?._id ? 'update' : 'create'"
            :id="selectedItem?._id"
            :initialItem="selectedItem"
            @save="reloadData"
            @delete="reloadData"
            deleteButton
            saveButton
            cancelButton
            dialogEdit
            :visible="dialogVisible"
            @update:visible="(val) => (dialogVisible = val)"
            :dialogHeader="dialogHeader"
        /> -->
    </div>
</template>
