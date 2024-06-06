<script setup lang="ts">
// import { ref, onBeforeMount } from 'vue';
// import List from './List.vue';
// import CreateTaskDialog from './CreateTaskDialog.vue';

// const toast = useToast();



import useSchemaFormController from '~/composables/schema-forms/useSchemaFormController';
import { httpService } from '~/service/http/http.service';


const {vm, formDescription, sharedFunctions, initDone} = useSchemaFormController('tasks');

let dataToSave: any;
const collectionName = 'test';

sharedFunctions.getSchemaName = () => {
  return collectionName;
}

sharedFunctions.createTarget = async (dataToSave: any): Promise<any> => {
  return httpService.post(`/api/create/${collectionName}`, dataToSave)
    .then((response: any) => {
      return response.data;
    });
}

sharedFunctions.updateTarget = async (dataToSave: any): Promise<any> => {
  return httpService.post(`/api/update/${collectionName}`, dataToSave)
    .then((response: any) => {
      return response.data;
    });
}

sharedFunctions.getTargetName = (): string => {
  return 'test';
}

sharedFunctions.getTarget = async (): Promise<any> => {
  return {};
}

sharedFunctions.buildGroupsDescription = async (): Promise<any> => {
  return vm.schemaFormsBuildHelper.buildFormDescription();
}

onMounted(() => {
  sharedFunctions.doOnMounted();
});


onDeactivated(() => {
  sharedFunctions.onDeactivated();
})


function onModelChange(value: any) {
  dataToSave = value;
}

function saveModel() {
  console.log(JSON.stringify(dataToSave));

  sharedFunctions.save(dataToSave);
}

</script>

<template>
    <div class="card">
        <Button icon="pi pi-save" aria-label="Save Form" @click="saveModel()">
        </Button>

        <SchemaForm formName="tasks"
                    v-if="initDone"
                    :description="formDescription"
                    :model="vm.model"
                    @modelChange="onModelChange($event)"
                    :needCorrectExistingValues="false">
        </SchemaForm>
    </div>

<!--    <Dialog :header="dialogConfig.header || ''" v-model:visible="dialogConfig.visible" modal class="mx-3 sm:mx-0 sm:w-full md:w-8 lg:w-6" contentClass="border-round-bottom border-top-1 surface-border p-0">-->
<!--        <CreateTaskDialog :selected-task="selectedTask" @close="onCloseDialog()" @save="onSaveDialog"></CreateTaskDialog>-->
<!--    </Dialog>-->
</template>
