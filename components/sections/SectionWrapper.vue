<template>
  <section class="section-wrapper" >
    <client-only>
      <div class="anchor" :id="id"/>
    </client-only>
    <CloseButton v-if="closeButton"  @click="closed = !closed; $emit('closeClicked')"/>
    <header :class="display" class="W3" v-if="title || subTitle">
      <h1 v-if="title" class="section-title">
        <span v-if="titleNumber" class="title-number">{{ titleNumber }}</span>
        {{ title }}</h1>
     
      <h2 v-if="subTitle" class="section-sub-title">{{ subTitle }}</h2>
    </header>
    <slot name="toggle" />
    <div class="section-content">
      <slot />
    </div>
  </section>
</template>

<script>
export default {
  props: ['props', 'title', 'subTitle', 'id', 'display', 'titleNumber', 'closeButton'],
  emits: ['closeClicked']
}
</script>

<style lang="scss">
.section-wrapper {
  position: relative;
  &.Dark{ // For Dark Backgrounds
    .section-title, .section-sub-title, .close-button, .cancelled-wrapper{
      color: $CB-2;
    }
  }
  .close-button{
    position: absolute;
    right: 0;
    top: 0;
  }
  &:nth-child(even) .Alternate {
    flex-direction: row-reverse;
  }
  & > * {
    margin: 0 auto;
  }
  & .anchor{ // Makes Nav scroll to correct position
    position: relative;
    bottom: 100px;
   // display:none;
  }

  & > header {
    text-align: center;
    @include scale(padding-top, 20px, 40px, 1.5);
    & > .section-title {
      @include font-size(4);
      @include font-style('header');
      padding-bottom: 20px;
      
    }
  }
  & .section-content {
    @include scale(padding-top, 10px, 20px, 1.5);
    @include scale(padding-bottom, 20px, 40px, 1.5);
  }
}
</style>
