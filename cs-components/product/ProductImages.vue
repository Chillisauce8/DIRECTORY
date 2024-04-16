<template>
  <ImageWrapper type="activities" :src="src" :images="images"
                :width="width" :class="display" :alt="alt">
    <div v-if="label" class="label">
      {{ label }}
    </div>
  </ImageWrapper>
</template>

<script>
export default {
  props: ['label', 'src', 'images', 'display', 'alt'],
  data() {
    return {
      width: 290,
    };
  }
}
</script>

<style lang="scss">

</style>
