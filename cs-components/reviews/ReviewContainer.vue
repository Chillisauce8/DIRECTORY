<template>
  <section-wrapper
    class="review-container"
    :title="title"
    :id="id">
    <ReviewSummary :reviewScore="reviewScore" :reviewCount="reviewCount" :trustpilot="trustpilot"></ReviewSummary>

    <list-wrapper class="slider" @getNextData="onGetNextData">
      <template v-for="review in reviews">
        <AReview :review="review" :trustpilot="trustpilot" ></AReview>
      </template>
    </list-wrapper>
  </section-wrapper>
</template>

<script>
export default {
  props: ['id', 'reviewScore', 'reviewCount', 'reviews', 'title', 'trustpilot'],
  methods: {
    onGetNextData() {
      this.$emit('getNextData');
    },
  },
}
</script>

<style lang="scss"></style>
