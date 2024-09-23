<script setup lang="ts">


let saveRawFunc: (data: any) => Promise<void>;
let deleteRawFunc: (dataId: string) => Promise<void>;


function onDataItemMounted(result: {hooks: any}) {
  saveRawFunc = result.hooks?.saveRawFunc;
  deleteRawFunc = result.hooks?.deleteRawFunc;
}



//
// const onDeleteItem = async (item: any) => {
//   await deleteRawFunc(deletedTask._doc);
//   reloadData();
// };

// const openEditDialog = (item: any) => {
//   dialogConfig.value.visible = true;
//   dialogConfig.value.header = 'Edit Task';
//
//   selectedTask.value = task;
// };
//
// function reloadData() {
//   dataLoaded.value = false;
//
//   setTimeout(() => {
//     dataLoaded.value = true;
//   }, 100);
// }

</script>

<template>
  <div class="card">
    <h1>Markets TEST</h1>
  </div>

  <div class="card">
    <DataItem function="read" collection="markets"
              :find="{}"
              :schema="true"
              v-slot="{items}"
              @mounted="onDataItemMounted">

      <template v-for="item in items">
        <p> {{item.name.schema.title}}:  {{item.name.value}}   </p>
      </template> (edited)

      <!--      <DataTable :value="items" tableStyle="min-width: 50rem">-->
<!--        <Column field="code" header="Code"></Column>-->
<!--        <Column field="name" header="Name"></Column>-->
<!--        <Column field="category" header="Category"></Column>-->
<!--        <Column field="quantity" header="Quantity"></Column>-->
<!--      </DataTable>-->

    </DataItem>
  </div>
</template>

<style scoped lang="scss">

</style>
