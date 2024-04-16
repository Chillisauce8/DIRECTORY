<template>
  <section-wrapper
    v-if="!noWrapper"
    class="features-list W1"
    title="Features">
    <VenueFeatureListInternal :venue="venue"></VenueFeatureListInternal>
  </section-wrapper>
  <div v-else class="features-list">
    <VenueFeatureListInternal :venue="venue"></VenueFeatureListInternal>
  </div>
</template>

<script>

export default {
  props: ['venue', 'noWrapper']
}
</script>

<style lang="scss"></style>
