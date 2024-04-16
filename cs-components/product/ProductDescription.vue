<template>
  <section-wrapper v-if="description"
    class="product-description W1"
    :title="title"
    :id="id" 
    itemprop="description">
    {{ description }}
  </section-wrapper>
</template>

<script>
export default {
  props: ['id', 'title', 'description'],
}
</script>

<style lang="scss"></style>
