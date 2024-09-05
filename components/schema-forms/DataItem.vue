<template>
  <template v-if="isCreateUpdate">
    <Button v-if="props.saveButton" icon="pi pi-save" aria-label="Save Form" @click="saveModel()">
    </Button>

    <SchemaForm :formName="formName"
                :id="formName"
                v-if="formDescription"
                :description="formDescription"
                :model="vm.model"
                @modelChange="onModelChange($event)"
                :needCorrectExistingValues="false">
    </SchemaForm>
  </template>
  <template v-else-if="props.function === 'read'">
    <template v-if="targetItem || targetItems">
      <slot :item="targetItem" :items="targetItems"></slot>
    </template>
  </template>
</template>


<script setup lang="ts">
import useSchemaFormController from '~/composables/schema-forms/useSchemaFormController';
import { httpService } from '~/service/http/http.service';


interface FieldProps {
  collection: string;
  function: 'create'|'read'|'update';
  find?: Object;
  fields?: Object;
  id?: string;
}

// @ts-ignore
const props = defineProps<FieldProps>();
// @ts-ignore
const emits = defineEmits(['mounted', 'changed']);

const isCreateUpdate = ['create', 'update'].includes(props.function);
const isReadSingle = props.function === 'read' && !!props.id;
const isReadMulti = props.function === 'read' && !props.id;

const collectionName = props.collection;

const formName = props.collection + '-form';
const {vm, formDescription, sharedFunctions} = useSchemaFormController(formName);

let dataToSave: any;

const targetItem = ref(null);
const targetItems = ref(null);

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
  return httpService.update(`/api/update/${collectionName}`, dataToSave)
    .then((response: any) => {
      return response.data;
    });
}

sharedFunctions.deleteTarget = async (dataId: string): Promise<boolean> => {
  return httpService.delete(`/api/delete/${collectionName}/${dataId}`)
    .then((response: any) => {
      return response.ok;
    });
}

sharedFunctions.getTargetName = (): string => {
  return collectionName;
}

sharedFunctions.getTarget = async (): Promise<any> => {
  if (props.id) {
    return httpService.get(`/api/get/${collectionName}/${props.id}`)
      .then((response: any) => {
        return response.data;
      });
  }

  return {};
}

sharedFunctions.buildFormDescription = async (showTitles=true): Promise<any> => {
  const readonly = props.function === 'read';
  return vm.schemaFormsBuildHelper.buildFormDescription(showTitles, readonly);
}

sharedFunctions.isEditMode = () => {
  return !!props.id;
}

onMounted(() => {
  emits('mounted', {hooks: {saveRawFunc: saveRaw, deleteRawFunc: deleteRaw}});

  if (isCreateUpdate) {
    sharedFunctions.doOnMounted();
  } else if (isReadSingle) {
    httpService.get(`/api/get/${collectionName}/${props.id}`, {
        h: {$fields: props.fields}
      })
      .then((response: any) => {
        targetItem.value = response.data;
      });
  } else if (isReadMulti) {
    httpService.get(`/api/query`, {
        collection: collectionName,
        q: props.find,
        h: {$fields: props.fields},
      })
      .then((response: any) => {
        targetItems.value = response.data;
      });
  }
});

onDeactivated(() => {
  sharedFunctions.onDeactivated();
})

function onModelChange(value: any) {
  dataToSave = value;
  emits('changed', {data: dataToSave, saveDataFunc: saveModel});
}

async function saveModel() {
  return sharedFunctions.save(dataToSave);
}

async function saveRaw(dataToSave: any) {
  return sharedFunctions.saveRaw(dataToSave);
}

async function deleteRaw(dataId: string) {
  return sharedFunctions.deleteRaw(dataId);
}

</script>

<style scoped>

</style>
