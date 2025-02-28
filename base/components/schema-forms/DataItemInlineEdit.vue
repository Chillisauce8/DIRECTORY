<template>
  <DataItem class="edit-form"
            function="update"
            :collection="props.collection"
            :id="props.dataItem._id"
            :fields="props.fields"
            :initial-data="props.dataItem"
            @changed="onDataItemChange">
  </DataItem>
  <Button v-if="submitPossible" type="button" severity="secondary" label="Submit" @click="onSubmit"/>
</template>

<script setup lang="ts">
interface DataItem {
  _id: string;
  [prop: string]: any;
}


interface DateItemInlineEditProps<Data extends DataItem = any> {
  dataItem: Data;
  collection: string;
  fields: Record<string, 0 | 1>;
}


interface DateItemInlineEditEmits {
  (e: 'update:dataItem', dataItem: DataItem): void;
}


const props = defineProps<DateItemInlineEditProps>();
const emits = defineEmits<DateItemInlineEditEmits>();

const submitPossible = ref(false);

let saveDataFunc: () => Promise<DataItem>;
let updateDataItem: DataItem;


async function onDataItemChange(changeResult: {data: DataItem, saveDataFunc: () => Promise<DataItem>}) {
  updateDataItem = unref(changeResult.data);
  saveDataFunc = changeResult.saveDataFunc;
  submitPossible.value = true;
}

async function onSubmit() {
  await saveDataFunc();

  emits('update:dataItem', updateDataItem);
}
</script>

<style scoped lang="scss">

</style>
