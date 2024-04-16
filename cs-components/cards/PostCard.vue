<template>
    <card-wrapper class="post-card card" :link="link" :search-terms="searchTerms" :search-hide="searchHide">
      <ImageWrapper type="activities" :cloudinaryId="imageId" :width="290"/>
      <card-text-wrapper>
        <h1>{{title}}</h1>
      </card-text-wrapper>
    </card-wrapper>
</template>

<script>
export default {
  props: ['link', 'imageId', 'title', 'searchTerms', 'searchHide'],
  methods: {
  }
}
</script>

<style lang="scss">
.post-card {
  width: 300px;
  & figure {
    @include aspect-ratio(3, 2);
  }
  & header {
    @include aspect-ratio(4, 3);
  }
  & h1 {
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 4px;
    line-height: 1.5;
  }
}
</style>
