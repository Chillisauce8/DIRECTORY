<template>
    <card-wrapper class="venue-card card"
                  :selectable="!!selectable"
                  :selected="selected"
                  v-on:selected="$emit('selected', venue)">
      <ImageWrapper type="locations" :cloudinaryId="imageId" />
      <card-text-wrapper>
        <h1 class="name">{{ name }}</h1>
      </card-text-wrapper>
    </card-wrapper>
</template>

<script>
import { ProductVenueType } from "~/services/models/venue";

export default {
  props: ['venue', 'section', 'selectable', 'selected'],
  computed: {
    isSubVenue() {
      if (!this.venue.getVenueType) {
        return false;
      }

      return this.venue.getVenueType() === ProductVenueType.subVenue;
    },

    imageId() {
      if (this.isSubVenue) {
        return this.venue.getMainImageId(this.section);
      } else if (this.venue.getTopVenue()) {
        return this.venue.getTopVenue().getMainImageId(this.section);
      }
    },

    name() {
      if (this.isSubVenue) {
        return this.venue.getName();
      } else if (this.venue.getTopVenue()) {
        return this.venue.getTopVenue().getName();
      }
    },
  }
}
</script>

<style lang="scss">
.venue-card {
  width: 300px;
  & figure {
    @include aspect-ratio(3, 2);
  }
  & header {
    @include aspect-ratio(3, 1);

    //     min-height: 150px;
  }
  & h1 {
    font-size: 14px;
    //    font-weight: 100;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 5px;
    line-height: 1.3;
  }
}
</style>
