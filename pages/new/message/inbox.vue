
<script setup lang="ts">
import MessageContainer from '~/components/message/MessageContainer.vue';

definePageMeta({
  layout: 'messages'
});
</script>

<template>
  <div class="inbox-page">
    <MessageContainer />
  </div>
</template>
