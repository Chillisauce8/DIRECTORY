<script setup lang="ts">

interface ITask {
  _doc: string;
  completed: any;
}

import { ref, onBeforeMount } from 'vue';
import List from './List.vue';
import CreateTaskDialogWithDb from './CreateTaskDialogWithDb.vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const dataLoaded = ref(false);

const dialogConfig = ref({
  visible: false,
  task: null
});

const selectedTask = ref(null);

onBeforeMount(async () => {
  dataLoaded.value = true;
});


let saveRawFunc: (data: any) => Promise<void>;
let deleteRawFunc: (dataId: string) => Promise<void>;

function onDataItemMounted(result: {hooks: any}) {
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
  dialogConfig.value.visible = true;
  dialogConfig.value.header = 'Edit Task';

  selectedTask.value = task;
};

const openCreateDialog = () => {
  dialogConfig.value.visible = true;
  dialogConfig.value.header = 'Create Task';

  selectedTask.value = null;
};

const onCloseDialog = () => {
  dialogConfig.value.visible = false;
};

const onSaveDialog = (task: any) => {
  // if (task) {
  //   toast.add({
  //     severity: 'success',
  //     summary: 'Edited',
  //     detail: `Task "${task.name}" edited successfully.`,
  //     life: 3000
  //   });
  // } else {
  //   toast.add({
  //     severity: 'success',
  //     summary: 'Success',
  //     detail: `Task "${task.name}" created successfully.`,
  //     life: 3000
  //   });
  // }

  dialogConfig.value.visible = false;

  reloadData();
}

function reloadData() {
  dataLoaded.value = false;

  setTimeout(() => {
    dataLoaded.value = true;
  }, 100);
}
</script>

<template>
  <div class="card">
    <template v-if="dataLoaded">
      <div class="flex justify-content-between align-items-center mb-5">
        <span class="text-900 text-xl font-semibold">Task List</span>
        <Button class="font-semibold" outlined icon="pi pi-plus" label="Create Task" @click="openCreateDialog()"></Button>
      </div>

      <DataItem function="read" collection="events" :find="{'completed': {'$ne': true}}" v-slot="{items}"
          @mounted="onDataItemMounted">
        <List :task-list="items" title="ToDo" @checkbox:change="onCheckboxChange"
              @delete:task="onDeleteTask" @open:edit:dialog="openEditDialog">
        </List>
      </DataItem>

      <DataItem function="read" collection="events" :find="{'completed': true}" v-slot="{items}">
        <List :task-list="items" title="Completed" @checkbox:change="onCheckboxChange"
              @delete:task="onDeleteTask" @open:edit:dialog="openEditDialog">
        </List>
      </DataItem>
    </template>

    <Dialog :header="dialogConfig.header || ''" v-model:visible="dialogConfig.visible" modal
            :style="{ width: '50rem' }">
      <CreateTaskDialogWithDb :selected-task-id="selectedTask?._doc"
                              @close="onCloseDialog()" @save="onSaveDialog">
      </CreateTaskDialogWithDb>
    </Dialog>
  </div>
</template>

