<template>
    <template v-if="blockText">
      <div class="row space-between-start"></div>
      <header>
        <div class="row">{{ blockText }}</div>
      </header>
    </template>
</template>

<script>
export default {
  name: "ImageTextBlock",
  props: ['blockText']
}
</script>

<style scoped>

</style>
