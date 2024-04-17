<template>
  <section :id="id" class="media-carousel" v-if="media.length">
    <ImageWrapper
      class="in-view"
      :class="fadeClass"
      :id="media[currentMedia].id"
      :cloudinaryId="media[currentMedia].id"
      :alt="media[currentMedia].alt"
      :width="600"
      :height="400"
    />
    <list-wrapper class="slider thumbnails" v-if="media.length > 1">

        <ImageWrapper v-for="(item, index) in media" :key="item.id"
          :id="item.id"
          class="thumbnail"
          :cloudinaryId="item.id"
          :alt="item.alt"
          v-on:click.native="swapImage(index)"
          :width="99"
          :height="66"
          :loading="loading"
        />

    </list-wrapper>
  </section>
</template>
<script>


// import {usePageDataLoadedStore} from "~/store/pageDataLoaded";

export default {
  props: ['id', 'mediaData', 'loading'],
  setup() {
    return {
      // pageDataLoadedStore: usePageDataLoadedStore(),
    }
  },
  data() {
    return {
      currentMedia: 0,
      fadeClass: "",
    }
  },

  computed: {
    media() {
      return this.mediaData;
    }
  },
  methods: {
    swapImage: function (index) {
      this.fadeClass = "fade-out";

      setTimeout(() => {
       this.fadeClass = "fade-in"
       this.currentMedia = index;
      }, 500);
    },
  },
  beforeMount() {
    // this.pageDataLoadedStore.set();
  }
}
</script>

<style lang="scss">
.media {
  min-width: 50%;
}
.media-carousel {
  .list-wrapper.thumbnails {
    margin-left: 0;
    margin-top: 5px;
  }
  & .images {
    @include aspect-ratio(3, 2);
  }
  & .thumbnails {
    margin: 20px 0 20px 10px;
  }
  & .thumbnail {
    cursor: pointer;
    @include desktop() {
      width: 99px;
      height: 66px;
      margin: 5px;
      &:first-child {
        margin-left: 0px;
      }
    }
    @include mobile() {
      width: 54px;
      height: 36px;
      margin: 5px;
    }
  }
  & .in-view {
    &.fade-in img {
      animation: mediaFadeIn .5s ease-in-out both;
    }
    &.fade-out img {
      animation: mediaFadeOut .5s ease-in-out both;
    }
  }
}

@keyframes mediaFadeIn {
  0% {
    opacity: 0;
    filter: grayscale(100%);
    transform: scale(0);
  }
  60% {
    filter: grayscale(100%);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes mediaFadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  40% {
    filter: grayscale(100%);
  }
  100% {
    opacity: 0;
    filter: grayscale(100%);
    transform: scale(0);
  }
}
</style>
