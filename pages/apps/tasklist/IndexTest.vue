<script setup lang="ts">
interface ITask {
    _doc: string;
    completed: any;
}

import { ref, onBeforeMount } from 'vue';
import List from './List.vue';

const dataLoaded = ref(false);

const dialogVisible = ref(false); // New ref for dialog visibility
const dialogHeader = ref(''); // New ref for dialog header

const selectedTask = ref(null);

onBeforeMount(async () => {
    dataLoaded.value = true;
});

let saveRawFunc: (data: any) => Promise<void>;
let deleteRawFunc: (dataId: string) => Promise<void>;

function onDataItemMounted(result: { hooks: any }) {
    saveRawFunc = result.hooks?.saveRawFunc;
    deleteRawFunc = result.hooks?.deleteRawFunc;
}

const onCheckboxChange = async (updatedTask: ITask) => {
    if (saveRawFunc) {
        await saveRawFunc(updatedTask);
    }

    reloadData();
};

const onDeleteTask = async (deletedTask: ITask) => {
    await deleteRawFunc(deletedTask._doc);
    reloadData();
};

const openEditDialog = (task: ITask) => {
    selectedTask.value = task;
    dialogHeader.value = 'Edit Task';
    dialogVisible.value = true;
};

const openCreateDialog = () => {
    selectedTask.value = null;
    dialogHeader.value = 'Create Task';
    dialogVisible.value = true;
};

// Remove onDialogSave and onDialogCancel functions

function reloadData() {
    return new Promise<void>((resolve) => {
        dataLoaded.value = false;
        setTimeout(() => {
            dataLoaded.value = true;
            resolve();
        }, 100);
    });
}
</script>

<template>
    <div class="card">
        <template v-if="dataLoaded">
            <div class="flex justify-content-between align-items-center mb-5">
                <span class="text-900 text-xl font-semibold">Task List</span>
                <Button class="font-semibold" outlined icon="pi pi-plus" label="Create Task" @click="openCreateDialog()"></Button>
            </div>

            <DataItem function="read" collection="events" :find="{ completed: { $ne: true } }" v-slot="{ items }" @mounted="onDataItemMounted">
                <List :task-list="items" title="ToDo" @checkbox:change="onCheckboxChange" @delete:task="onDeleteTask" @open:edit:dialog="openEditDialog"> </List>
            </DataItem>

            <DataItem function="read" collection="events" :find="{ completed: true }" v-slot="{ items }">
                <List :task-list="items" title="Completed" @checkbox:change="onCheckboxChange" @delete:task="onDeleteTask" @open:edit:dialog="openEditDialog"> </List>
            </DataItem>
        </template>

        <DataItem
            collection="events"
            :function="selectedTask?._doc ? 'update' : 'create'"
            :id="selectedTask?._doc"
            :initialItem="selectedTask"
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
