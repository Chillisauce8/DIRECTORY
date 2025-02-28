<template>
  <section-wrapper v-if="text" class="description W2" :title="title" :id="id">
    <div class="W3">{{ text }}</div>
  </section-wrapper>
</template>

<script>
export default {
  name: "Description",
  props: ["id", "text", "title"],
  /*  computed: {
    preparedTitle() {
      return this.title.replace(/(\n|\\n)/g, '<br>');
    }
  }
*/
};
</script>

<style scoped></style>
