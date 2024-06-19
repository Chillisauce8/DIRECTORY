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


const dialogConfig = ref({
  visible: false,
  task: null
});

const selectedTask = ref(null);

onBeforeMount(async () => {

});

const onCheckboxChange = (updatedTask: ITask) => {
  // taskList.value.find((task: ITask) => task._doc === updatedTask._doc).completed = updatedTask.completed;
  //
  // categorize(taskList.value);
};
const onDeleteTask = (deletedTask: ITask) => {
  // taskList.value = taskList.value.filter((task: ITask) => task._doc !== deletedTask._doc);
  //
  // categorize(taskList.value);
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
  if (task) {

    toast.add({
      severity: 'success',
      summary: 'Edited',
      detail: `Task "${task.name}" edited successfully.`,
      life: 3000
    });
  } else {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Task "${task.name}" created successfully.`,
      life: 3000
    });
  }

  dialogConfig.value.visible = false;
}
</script>

<template>
  <div class="card">
    <div class="flex justify-content-between align-items-center mb-5">
      <span class="text-900 text-xl font-semibold">Task List</span>
      <Button class="font-semibold" outlined icon="pi pi-plus" label="Create Task" @click="openCreateDialog()"></Button>
    </div>

    <DataItem function="read" collection="tasklisttest" v-slot="{items}" :find="{completed: {$ne: true}}">
      <List :task-list="items" title="ToDo" @checkbox:change="onCheckboxChange"
            @delete:task="onDeleteTask" @open:edit:dialog="openEditDialog">
      </List>
    </DataItem>

    <DataItem function="read" collection="tasklisttest" v-slot="{items}" :find="{completed: true}">
      <List :task-list="items" title="Completed" @checkbox:change="onCheckboxChange"
            @delete:task="onDeleteTask" @open:edit:dialog="openEditDialog">
      </List>
    </DataItem>
  </div>

  <Dialog :header="dialogConfig.header || ''" v-model:visible="dialogConfig.visible" modal class="mx-3 sm:mx-0 sm:w-full md:w-8 lg:w-6" contentClass="border-round-bottom border-top-1 surface-border p-0">
    <CreateTaskDialogWithDb :selected-task-id="selectedTask._doc"
                            @close="onCloseDialog()" @save="onSaveDialog">
    </CreateTaskDialogWithDb>
  </Dialog>
</template>

