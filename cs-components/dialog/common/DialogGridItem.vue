<template>
  <nuxt-link :to="link" v-if="link">
    <article class="dialog-grid-item Row">
      <ImageWrapper :max="1" :src="src"/>
      <header>
        <h1 class="title">{{title}}</h1>
        <div class="subtitle">{{subtitle}}</div>
      </header>
    </article>
  </nuxt-link>
  <div v-else>
    <article class="dialog-grid-item Row">
      <ImageWrapper :max="1" :src="src"/>
      <header>
        <h1 class="title">{{title}}</h1>
        <div class="subtitle">{{subtitle}}</div>
      </header>
    </article>
  </div>
</template>

<script>
export default {
  props: ['link', 'title', 'subtitle', 'src'],
}
</script>

<style lang="scss">
.dialog-grid-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 2s ease;
  // background-color: $CB;
  &:hover {
    background-color: $CB-1;
  }
  & figure {
    width: 64px;
    @include aspect-ratio(1, 1);
    & img {
      border-radius: 50%;
      @include shadow-soft();
    }
  }
  & header {
    padding-left: 1rem;
  }
  & .title {
    font-size: 18px;
    line-height: 1.2;
  }
  & .subtitle {
    font-size: 14px;
  }
}
</style>
