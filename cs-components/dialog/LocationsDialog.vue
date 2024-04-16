<template>
  <the-dialog
    class="locations-dialog"
    :title="title"
    :fullscreen="true">
    <DialogMainLink :to="getDialogMainLocation()"> Browse Locations By Category</DialogMainLink>
    <dialog-grid>
      <template v-if="!dialogData.selectModeOn">
        <template v-for="location in locationsToDisplay" :key="location._doc">
          <DialogGridItem :link="getLocationUrl(location)"
                          @click.native="linkClicked()"
                          :title="location.name"
                          :subtitle="getCountryName(location)"
                          :src=getImageUrl(location) />
        </template>
      </template>
      <template v-else>
        <template v-for="location in locationsToDisplay" :key="location._doc">
          <DialogGridItem @click.native="onLocationClick(location)"
                          :title="location.name"
                          :subtitle="getCountryName(location)"
                          :src=getImageUrl(location) />
        </template>
      </template>
    </dialog-grid>
  </the-dialog>
</template>

<script lang="ts">
import { useSelectMediaHelper } from '~/services/helpers/select-media-helper.factory';
import { useLocationService } from '~/services/helpers/location.service.factory';
import {useHttpService} from '~/services/helpers/api-common/http-service.factory';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';
import { useRoutingHelper } from '~/services/helpers/routing-helper.fabric';
import { useCurrentLocationService } from '~/services/helpers/current-location.service.factory';


export interface LocationDialogData {
  section: string;
  category?: any;
  locations?: any[];
  selectModeOn?: boolean;
  linksBasePath?: string,
  linksQuery?: Object,
}


export interface LocationDialogResult {
  locationId: string;
  locationName: string;
  categoryUrl?: string;
}


export default {
  setup() {
    return {
      selectMediaHelper: useSelectMediaHelper(),
      locationService: useLocationService(),
      httpService: useHttpService(),
      dialogInstance: useDialogInstance<LocationDialogResult>(),
      dialogData: useDialogData<LocationDialogData>(),
      routingHelper: useRoutingHelper(),
      router: useRouter(),
      currentLocation: useCurrentLocationService(),
    };
  },
  computed: {
    title() {
      return this.getCurrentSection() + ' Locations';
    }
  },
  data() {
    return {
      locationsToDisplay: []
    }
  },
  mounted() {
    this.fetchAllLocations();
  },
  methods: {
    getDialogMainLocation() {
      const section = this.getCurrentSection();

      if (this.dialogData.mainDialogLocation) {
        return this.dialogData.mainDialogLocation;
      }

      let url = `/${section}/locations`;

      if (this.dialogData.linksBasePath) {
        url = this.dialogData.linksBasePath + url;
      }

      if (this.dialogData.linksQuery) {
        return {path: url, query: this.dialogData.linksQuery}
      }

      return url;
    },

    fetchAllLocations() {
      const locationFilteredBySectionQuery = {
        $and: [{
          'isCountry': {$ne: true},
          'removeFromWeb': {$ne: true},
          'type': {$nin: ['region', 'country']},
        }, {
          $or: [
            {
              'section': {'$in': [this.getCurrentSection()]},
            },
            {
              'section': {'$size': 0},
            }
          ],
        }],
      };

      const requestConfig = {
        params: {
          filter: locationFilteredBySectionQuery,
        }
      }

      let section = this.getCurrentSection();

      const getLocationsPromise = this.dialogData.category ?
          this.locationService.getByCategory(section, this.dialogData.category._doc) :
          this.httpService.get(`/api/location`, requestConfig.params).then(response => response.data);

      getLocationsPromise
        .then(data => {
          if (!data?.length) {
            return;
          }

          if (this.dialogData.locations) {
            const possibleLocationIdList = this.dialogData.locations.map(item => item.id);
            this.locationsToDisplay = data.filter(item => {
              return possibleLocationIdList.includes(item._doc);
            })
          } else {
            this.locationsToDisplay = data;
          }

          this.locationsToDisplay = this.locationsToDisplay.sort((a, b) => {
            if (a?.name > b?.name) {
              return 1;
            }

            return -1;
          });
        })
        .catch(error => {
          console.log(error);
        })
    },

    getCurrentSection() {
      return this.dialogData.section || 'stag';
    },

    getLocationUrl(location) {
      const locationOriginalName = location?.name;

      if (!locationOriginalName) {
        return '';
      }

      const prepareLocationName = this.locationService.prepareLocationNameForUrl(locationOriginalName);

      let url = `/${this.getCurrentSection()}/in-` + prepareLocationName;

      if (this.dialogData.category) {
        url += `/do-${this.dialogData.category.url}`;
      }

      let query = {};
      const currentQuery = unref(this.router.currentRoute).query;

      const locationMatch = locationOriginalName === this.currentLocation.getLocationName();
      const noCurrentLocation = !!this.currentLocation.getLocationName();

      if ((locationMatch || noCurrentLocation) &&
          (currentQuery['add-package'] || currentQuery['package-creating'])) {
        query = this.routingHelper.getCurrentCleanedQueryParams(false, false);
      }

      if (this.dialogData.linksBasePath) {
        url = this.dialogData.linksBasePath + url;
      }

      if (this.dialogData.linksQuery) {
        return {path: url, query: this.dialogData.linksQuery}
      }

      return {path: url, query};
    },

    getCountryName(location) {
      const address = location.address;

      if (!address || !address.location ||
        !address.location.address_components || !address.location.address_components.length) {
        return '';
      }

      let countryAddressComponents = address.location.address_components.filter((item) => {
        if (!item.types || !item.types.length) {
          return false;
        }

        return item.types.filter((type) => type === 'country').length;
      });

      if (!countryAddressComponents.length) {
        return '';
      }

      return countryAddressComponents[0].long_name ||
        countryAddressComponents[0].short_name;
    },

    getImage(location) {
      if (location === undefined) {
        return;
      }

      const section = this.getCurrentSection();
      const selectedImage = this.selectMediaHelper.getOneImageBySection(
        location.imageList, section);

      if (selectedImage !== undefined && selectedImage.image !== undefined) {
        return selectedImage.image;
      }
    },

    getImageUrl(location) {
      const image = this.getImage(location);

      if (!image) {
        return '';
      }

      return `https://media.chillisauce.com/image/upload/w_100,dpr_1,f_auto,c_fill,q_auto/${image.id}.jpg`;
    },

    linkClicked() {},

    onLocationClick(location) {
      const locationOriginalName = location.name ?? '';
      const prepareLocationName = this.locationService.prepareLocationNameForUrl(locationOriginalName);

      const result: LocationDialogResult = {
        locationId: location._doc,
        locationName: prepareLocationName,
      };

      if (this.dialogData.category) {
        result.categoryUrl = this.dialogData.category.url;
      }

      this.dialogInstance.close(result);
    }
  }
}
</script>

<style lang="scss"></style>
