<template>
  <button-content-wrapper :class="{ disabled: disabled }">
    <template #main>
    <button class="button-wrapper">
      <div class="button-text"><slot />{{ text }}</div>
      <div v-if="icon" class="button-icon">
        <LazySvgIcon :svg="icon" class="inline" />
      </div>
    </button>
  </template>
  </button-content-wrapper>
</template>

<script>
export default {
  props: [ "text", "icon", "disabled"],
  data() {
    return {
      
    };
  },
};
</script>

<style lang="scss">
</style>
