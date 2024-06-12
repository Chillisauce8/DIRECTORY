<template>
  <template v-if="['create', 'update'].includes(props.function)">
    <Button icon="pi pi-save" aria-label="Save Form" @click="saveModel()"></Button>

    <SchemaForm :formName="formName"
                v-if="formDescription"
                :description="formDescription"
                :model="vm.model"
                @modelChange="onModelChange($event)"
                :needCorrectExistingValues="false">
    </SchemaForm>
  </template>
  <template v-else-if="props.function === 'read'">
    <template v-if="vm.model">
      <slot :data="vm.model"></slot>
    </template>
  </template>
</template>


<script setup lang="ts">
import useSchemaFormController from '~/composables/schema-forms/useSchemaFormController';
import { httpService } from '~/service/http/http.service';


interface FieldProps {
  collection: string
  id?: string;
  function: 'create'|'read'|'update'
}

// @ts-ignore
const props = defineProps<FieldProps>();

const formName = props.collection + '-form';
const {vm, formDescription, sharedFunctions} = useSchemaFormController(formName);

let dataToSave: any;
const collectionName = props.collection;

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

sharedFunctions.buildGroupsDescription = async (): Promise<any> => {
  const useOneGroup = false;
  const showTitles = true;
  const readonly = props.function === 'read';
  return vm.schemaFormsBuildHelper.buildFormDescription(useOneGroup, showTitles, readonly);
}

sharedFunctions.isEditMode = () => {
  return true;
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
  sharedFunctions.save(dataToSave);
}

</script>

<style scoped>

</style>
