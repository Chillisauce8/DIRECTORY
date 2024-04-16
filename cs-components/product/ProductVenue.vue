<template>
  <section-wrapper title="The Venue" id="venue">
    <div class="product-venue Split W3">
      <div class="media">
        <MediaCarousel v-if="mediaData" class="carousel" id="venue-images" :mediaData="mediaData">
        </MediaCarousel>
      </div>
      <div class="details">
        <div class="sticky">
          <h1 class="hidevenue">{{ name }}</h1>
         <div>{{description}}</div> 
          <VenueFeatureList class="ignore" noWrapper="true" :venue="venue"></VenueFeatureList>
        </div>
      </div>
    </div>
  </section-wrapper>
</template>

<script>
import {useSectionStore} from '~/store/section';

export default {
  props: ['venue'],
  setup() {
    return {
      sectionStore: useSectionStore(),
    };
  },
  computed: {
    name() {
      return this.venue.getName();
    },
    description() {
      return this.venue.getDescription();
    },
    mediaData() {
      const section = this.sectionStore.section;
      const images = this.venue.getSectionImages(section);
      return images.map(item => {
        return {
          id: item.image.id,
          alt: item.image.title
        }
      });
    }
  }
}
</script>

<style lang="scss">
.product-venue {
}
</style>
