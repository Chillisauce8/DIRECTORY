<template>
    <card-wrapper class="product-category-card card" :link="getCategoryUrl()" :search-hide="searchHide" :search-terms="searchTerms">
      <ImageWrapper type="activities" :cloudinaryId="getMainImageId()"
        :alt="getImageDefaultAlt()"
        :width="290"/>
      <card-text-wrapper>
        <h1 class="name">{{ name }}</h1>
      </card-text-wrapper>
    </card-wrapper>
</template>

<script>
import {useCurrentSection} from "~/services/helpers/current-section.factory";

export default {
  setup() {
    return {
      currentSection: useCurrentSection(),
    }
  },
  props: ['name', 'url', 'images', 'locationName', 'section', 'searchTerms', 'searchHide'],
  methods: {
    getCategoryUrl() {
      if (this.locationName) {
        return `/${this.section}/in-${this.locationName}/do-${this.url}`;
      } else {
        return `/${this.section}/do-${this.url}`;
      }
    },

    getMainImageId() {
      if (!this.images) {
        return '';
      }

      const id = this.images.filter(item => {
        return !!(!item.section || !item.section.length || item.section.includes(this.section));
      })[0]?.image?.id;

      if (!id) {
        return '';
      }

      return id;
    },

    getImageDefaultAlt() {
      if (this.locationName) {
        return `${this.locationName} ${this.name} ${this.currentSection.getIdeasName()}`;
      } else {
        return `${this.name} ${this.currentSection.getIdeasName()}`;
      }
    },
  },
}
</script>

<style lang="scss">
.product-category-card {
  width: 300px;
  & figure {
    @include aspect-ratio(4, 3);
  }
  & header {
    @include aspect-ratio(2, 1);

    //     min-height: 150px;
  }
  & .name {
font-size: 16px;
font-weight: 500;
  }
}
</style>
