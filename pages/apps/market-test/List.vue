<script setup lang="ts">


</script>

<template>
  <div class="card">
    <h1>Markets TEST</h1>
  </div>

  <div class="card">
    <DataItem function="read" collection="markets"
              :find="{}"
              :schema="true"
              v-slot="{items}">

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
