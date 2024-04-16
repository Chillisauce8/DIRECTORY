<template>
    <card-wrapper class="location-section-card card" :link="link">
      <ImageWrapper :cloudinaryId="cloudinaryId" :width="290"
                    :alt="getImageDefaultAlt()"/>
      <card-text-wrapper>
        <h1 class="title">{{ locationName }} {{ title }} {{ sectionName }}</h1>
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
  props: ["title", "section", "cloudinaryId", "link", "locationName", "sectionName"],
  methods: {
    getImageDefaultAlt() {
      return `${this.locationName} ${this.title} ${this.currentSection.getIdeasName()}`;
    },
  }
}
</script>

<style lang="scss">

</style>
