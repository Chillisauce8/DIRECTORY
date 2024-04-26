<template>
  <card-wrapper class="vehicle-card card">
    <image-wrapper
      v-if="images"
      :images="images"
      :max="1"
      :width="290"
      :height="145"
      loading="lazy"
    >
      <div v-if="nickname" class="nickname1">" {{ nickname }} "</div>
    </image-wrapper>
    <card-text-wrapper>
      <div v-if="nickname" class="nickname">"{{ nickname }}"</div>
      <h1 class="name">{{ year }} {{ make }} {{ name }}</h1>
    </card-text-wrapper>
  </card-wrapper>
</template>

<script setup lang="ts">
const props = defineProps(["images", "name", "nickname", "make", "year"]);
</script>

<style lang="scss">
.vehicle-card {
  width: 300px;
  figure {
    @include aspect-ratio(3, 2);
  }
  header {
    @include aspect-ratio(3, 1);
    //     min-height: 150px;
  }

  .name {
    font-family: $ff2;
    font-size: 14px;
    font-weight: 100;
  }
  .nickname {
    font-size: 16px;
    font-family: $ff2;
    font-weight: 600;
    letter-spacing: 0.3rem;
    text-transform: uppercase;
  }
}
</style>
