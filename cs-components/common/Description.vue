<template>
  <section-wrapper v-if="text"
                   class="product-description W1"
                   :title="preparedTitle"
                   :id="id">
<!--    <h3 v-html="preparedTitle"></h3>-->
    <Markdown v-if="text" :data="text"></Markdown>
  </section-wrapper>
</template>

<script>
export default {
  name: 'Description',
  props: ['id', 'text', 'title'],
  computed: {
    preparedTitle() {
      return this.title.replace(/(\n|\\n)/g, '<br>');
    }
  }
};
</script>

<style scoped>

</style>
