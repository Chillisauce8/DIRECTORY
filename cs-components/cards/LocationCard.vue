<template>
  <card-wrapper class="location-card card" :link="{path: getUrl(), query: getCleanQueryParams()}"
                :search-hide="searchHide"
                :search-terms="searchTerms">
    <ImageWrapper type="locations" :cloudinaryId="getMainImageId()" :width="290"
      :alt="getImageDefaultAlt()"/>
    <card-text-wrapper>
      <div class="country">{{ country }}</div>
      <h1 class="name">{{ name }}</h1>
    </card-text-wrapper>
  </card-wrapper>
</template>

<script>
import {useLocationService} from "~/service/helpers/location.service.factory";
import {useCurrentSection} from "~/service/helpers/current-section.factory";
import {useRoutingHelper} from "~/service/helpers/routing-helper.fabric";

export default {
  props: ['country', 'name', 'images', 'section', 'searchTerms', 'searchHide', 'routePrefix'],
  setup() {
    return {
      locationService: useLocationService(),
      currentSection: useCurrentSection(),
      routingHelper: useRoutingHelper(),
      router: useRouter(),
    }
  },
  methods: {
    getUrl() {
      const prepareLocationName = this.locationService.prepareLocationNameForUrl(this.name);

      if (this.routePrefix) {
        return `${this.routePrefix}/${this.section}/in-${prepareLocationName}`;
      }

      return `/${this.section}/in-${prepareLocationName}`;
    },

    getCleanQueryParams() {
      const query = unref(this.router.currentRoute).query;

      if (query['eventId']) {
        return {};
      }

      return this.routingHelper.getCurrentCleanedQueryParams(true, false);
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
