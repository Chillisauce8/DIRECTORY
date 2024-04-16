<template>
  <TheDialog :title="title"
             :fullscreen="fullscreen"
             :form-name="formName"
             class="dialog-with-form">
    <slot></slot>
  </TheDialog>
</template>

<script lang="ts">
export default {
  props: ['title', 'fullscreen', 'formName'],
}
</script>

<style lang="scss">
.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  align-items: center;

  .product-tool-dialog-text, .tool-dialog-text {
    font-size: $fc-font-size;
  }
}

</style>
