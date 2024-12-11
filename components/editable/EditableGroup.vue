<script setup lang="ts">


import { sysService } from '~/service/http/sys.service';
import {
  schemaFormsBuildHelperFactory
} from '~/service/schema-forms/schemaFormsBuildHelper.factory';

export interface EditableGroupProps {
  collection: string;
  data: any;
  edit: boolean;
  saveOnSubmit: boolean;
}

export interface EditableGroupEmits {
  (e: 'submit', value: any): void;
}

const props = withDefaults(defineProps<EditableGroupProps>(), {
  edit: false,
  saveOnSubmit: true,
});

// @ts-ignore
const emits = defineEmits<EditableGroupEmits>();

let isSchemaLoaded = false;
let schemaFormsBuildHelperPromise;

function _loadSchemaFormsBuildHelper() {
  possibleToRenderComponent.value = false;
  schemaFormsBuildHelperPromise = sysService.getSchema(props.collection)
    .then(schema => {
      return schemaFormsBuildHelperFactory.getInstance(props.collection, schema);
    });
}


watch(() => props?.edit, async (value: any) => {
  if (!value) {
    possibleToRenderComponent.value = false;
  }

  if (!value || isSchemaLoaded) {
    return;
  }

  _loadSchemaFormsBuildHelper();
});

watch(() => props?.collection, async (value: any) => {
  if (!value || !props.edit) {
    return;
  }

  _loadSchemaFormsBuildHelper();
});


import { provide } from 'vue'
import { httpService } from '~/service/http/http.service';

const possibleToRenderComponent = ref(false);

async function generateFieldDescription(fieldPath: string) {
  const schemaFormsBuildHelper = await schemaFormsBuildHelperPromise;
  return schemaFormsBuildHelper.generateField(fieldPath)?.description;
}

let needToExecuteFetchRelator = false;

function processAfterFieldGeneration() {
  if (!needToExecuteFetchRelator) {
    needToExecuteFetchRelator = true;
    setTimeout(async () => {
      const schemaFormsBuildHelper = await schemaFormsBuildHelperPromise;
      await schemaFormsBuildHelper.fetchRelatorChoicesInBulk();
      schemaFormsBuildHelper.clearRelatorsBulkRequestParams();
      needToExecuteFetchRelator = false;
      possibleToRenderComponent.value = true;
    }, 300);
  }
}


provide('generateFieldDescription', generateFieldDescription);
provide('processAfterFieldGeneration', processAfterFieldGeneration);
provide('possibleToRenderComponent', possibleToRenderComponent);


async function updateTarget(dataToSave: any): Promise<any> {
  return httpService.update(`/api/update/${props.collection}`, dataToSave)
    .then((response: any) => {
      return response.data;
    });
}

async function handleSubmit() {
  let data = props.data;
  if (props.saveOnSubmit) {
    data = await updateTarget(props.data);
  }

  emits('submit', data);
}

</script>

<template>
  <div v-if="!props.edit" class="card-details">
    <slot></slot>
  </div>
  <form v-if="props.edit" class="form" @submit.prevent="handleSubmit" @click.stop>
    <slot></slot>
    <Button type="submit" severity="secondary" label="Submit" />
  </form>
</template>

<style scoped lang="scss">

</style>
