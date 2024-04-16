<template>
  <div v-html="markdownToHtml()"></div>
</template>

<script setup lang="ts">

interface MarkdownProps {
  data: string,
  isCustomSanitizing?: boolean,
}

const MarkdownDirectiveInstance = inject('MarkdownDirectiveInstance');


const props = defineProps<MarkdownProps>();

function markdownToHtml() {
  if (!props.data) {
    return;
  }

  const instance = new MarkdownDirectiveInstance(null);
  return instance.sanitizeData(props.data, props.isCustomSanitizing);
}

</script>

<style scoped>

</style>