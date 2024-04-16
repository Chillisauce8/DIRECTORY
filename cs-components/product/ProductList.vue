<template>
  <section-wrapper class="product-list CB-2" :title="props.title" :id="props.id">
    <slot />
  </section-wrapper>
</template>

<script>
export default {
  props: ['props'],
}
</script>

<style lang="scss"></style>
