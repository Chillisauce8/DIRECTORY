<template>
  <card-wrapper class="location-card card" :link="getUrl()" :search-hide="searchHide"
                :search-terms="searchTerms">
    <ImageWrapper type="locations" :cloudinaryId="getMainImageId()" :width="290"
      :alt="getImageDefaultAlt()"/>
    <card-text-wrapper>
      <h1 class="name">{{ name }}</h1>
    </card-text-wrapper>
  </card-wrapper>
</template>

<script>
import {useLocationService} from "~/services/helpers/location.service.factory";
import {useCurrentSection} from "~/services/helpers/current-section.factory";

export default {
  props: ['name', 'images', 'section', 'searchTerms', 'searchHide'],
  setup() {
    return {
      locationService: useLocationService(),
      currentSection: useCurrentSection(),
    }
  },
  methods: {
    getUrl() {
      const prepareLocationName = this.locationService.prepareLocationNameForUrl(this.name);
      return `/${this.section}/country-${prepareLocationName}`;
    },

    getMainImageId() {
      if (!this.images) {
        return '';
      }

      const id = this.images.filter(item => {
        if (!item.section || !item.section.length || item.section.includes(this.section)) {
          return true;
        }

        return false;
      })[0]?.image?.id;

      if (!id) {
        return '';
      }

      return id;
    },

    getImageDefaultAlt() {
      return `${this.name} ${this.currentSection.getIdeasName()}`;
    },
  }
}
</script>

<style lang="scss">
.location-card {
  width: 300px;
  & figure {
    @include aspect-ratio(4, 3);
  }
  & header {
    @include aspect-ratio(2, 1);
  }
  & .name {
    font-size: 18px;
    font-weight: 100;
  }
  & .country {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
}
</style>
