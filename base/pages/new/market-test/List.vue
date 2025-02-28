<script setup lang="ts">


</script>

<template>
  <div>
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


      </DataItem>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
