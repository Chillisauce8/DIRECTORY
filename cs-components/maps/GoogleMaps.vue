<template>
  <section-wrapper title="Location" id="map" class="google-maps">
    <div class="W1 location-details hidevenue">
      <div v-if="address" class="address container">
        <div class="title">Address:</div>
        <div class="text">{{address}}</div>
      </div>
      <div v-if="whatThreeWords" class="what-three-words container hidevenue">
        <div class="title">What 3 words</div>
        <div class="text">{{ whatThreeWords }}</div>
      </div>
      <div v-if="directions" class="directions container hidevenue">
        <div class="title">Directions</div>
        <div class="text">{{directions}}</div>
      </div>
    </div>
    <div class="Column-Reverse-Row-Reverse">
      <list-wrapper class="content slider-mobile" v-if="shouldShowVenues || shouldShowSubVenues">
        <template v-for="venue in venuesToShow">
          <VenueCard :venue="venue" :section="section" :selectable="!isReadonlyMode()"
                     :clickable="true"
                     :selected="isVenueSelected(venue)"
                     v-on:selected="venueSelectionChanged(venue)">
          </VenueCard>
        </template>
      </list-wrapper>

      <div class="map" v-if="mapCenter">
        <GmvMap
          :center="mapCenter"
          :options="{fullscreenControl: false}"
          :zoom="15"
          mapId="CS_DEMO_MAP_ID"
          ref="googleMap"
          style="width: 100%; height: 100%"
        >
          <template v-for="(pin, index) in pins" :key="index">
            <GmvMarker
              :position="pin.position"
              :clickable="true"
              :draggable="false"
              :icon="getMapMarkerIconUrl(pin)"
              @click="markerClicked(pin, index)"
            >
            </GmvMarker>
            <GmvInfoWindow :options="infoOptions"
                           :content="pin.title"
                           :position="pin.position"
                           :opened="pin.infoWinOpen"
                           @closeclick="pin.infoWinOpen=false">
            </GmvInfoWindow>
          </template>
        </GmvMap>
      </div>
    </div>
  </section-wrapper>
</template>

<script lang="ts">
import { useGoogleMapsApiPromiseLazy } from '@gmap-vue/v3/composables';
import { ProductVenueType } from '~/services/models/venue';

export default {
  props: ['product', 'section', 'isVenueConfirmed'],
  setup() {
    return {
      appConfig: useAppConfig(),
    }
  },
  data() {
    return {
      venueToShow: null,
      mapCenter: undefined,
      pins: [],
      infoWindowPos: null,
      infoWinOpen: false,
      currentMidx: null,
      infoContent: '',
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35
        }
      },
    }
  },
  beforeMount() {
    this.preparePins();
    this.prepareMapCenter();

    const selectedVenue = this.product.getSelectedVenue();

    if (selectedVenue) {
      this.venueToShow = selectedVenue;
      this.selectPinForVenue(selectedVenue);
    }
  },
  mounted() {
    this.fitGoogleMapBoundsForMarkers();
  },
  computed: {
    address() {
      const {addressVenue, meetingPoint} = this._getLocationVenueAndMeetingPoint();

      let address = '';

      if (meetingPoint) {
        address = 'Meeting point: ' + meetingPoint.getFormattedAddress();
      } else {
        if (!addressVenue) {
          return '';
        }

        address = addressVenue.getFormattedAddress();
      }

      return address;
    },

    whatThreeWords() {
      const {addressVenue, meetingPoint} = this._getLocationVenueAndMeetingPoint();

      let whatThreeWords = '';

      if (meetingPoint) {
        const value = meetingPoint.getWhatThreeWords();

        if (!value) {
          return null;
        }

        whatThreeWords = 'Meeting point: ' +value;
      } else {
        if (!addressVenue) {
          return '';
        }

        whatThreeWords = addressVenue.getWhatThreeWords();
      }

      return whatThreeWords;
    },

    directions() {
      const {addressVenue, meetingPoint} = this._getLocationVenueAndMeetingPoint();

      let directions = '';

      if (meetingPoint) {
        const value = meetingPoint.getDirections();

        if (!value) {
          return null;
        }

        directions = 'Meeting point: ' + value;
      } else {
        if (!addressVenue) {
          return '';
        }

        directions = addressVenue.getDirections();
      }

      return directions;
    },

    venueList() {
      return this.isVenueConfirmed ? [this.product.getSelectedVenue()] : this.product.getVenues();
    },

    shouldShowVenues() {
      if (this.product.getMultiVenueSetting() !== 'Yes') {
        return false;
      }

      if (this.venueList?.length > 0) {
        return this.venueList.filter(item => !!item.getTopVenue()).length > 1;
      }

      return false;
    },

    subVenueList() {
      for (let venueItem of this.product.getVenues()) {
        const subVenues = venueItem.getSubVenues();

        if (subVenues?.length > 0) {
          return subVenues;
        }
      }

      return null;
    },

    shouldShowSubVenues() {
      return this.subVenueList?.length > 0;
    },

    venuesToShow() {
      return this.shouldShowVenues ? this.venueList : this.subVenueList;
    },
  },
  methods: {
    isVenueSelected(venue) {
      return venue.selected && !this.isReadonlyMode();
    },

    isReadonlyMode() {
      return !this.product.isCustomerVenueChoice() || this.isVenueConfirmed;
    },

    venueSelectionChanged(venue) {
      this.venueToShow = venue;

      if (!this.isReadonlyMode()) {
        this.selectVenueInProduct(venue);
      }

      this.selectPinForVenue(venue);

      if (!this.isReadonlyMode()) {
        this.$emit('venueSelectionChanged', venue);
      }
    },

    selectVenueInProduct(venue) {
      venue.selected = true;

      for (let _venue of this.product.getVenues()) {
        if (_venue !== venue) {
          _venue.selected = false;
        }
      }
    },

    selectPinForVenue(venue) {
      let properPin, properPinIndex;

      const venueId = venue?.getId ? venue.getId() : venue?.getMainVenue()?.getId();

      for (let i = 0; i < this.pins.length; ++i) {
        const pin = this.pins[i];
        if (pin.id === venueId) {
          properPin = pin;
          properPinIndex = i;
          break;
        }
      }

      if (properPin) {
        this.mapCenter = properPin.position;
        this.switchOnInfoWindow(properPin);

        // properPin.infoWinOpen = true;
      }
    },

    _getLocationVenueAndMeetingPoint() {
      let addressVenue = null;
      let meetingPoint;

      if (this.venueToShow) {
        if (this.venueToShow.getTopVenue) {
          addressVenue = this.venueToShow.getTopVenue();
          meetingPoint = this.venueToShow.getMeetingPoint();
        } else {
          addressVenue = this.venueToShow;
        }
      } else if (this.product.hasSelectedVenue()) {
        let selectedVenue = this.product.getSelectedVenue();
        addressVenue = selectedVenue.getTopVenue();
        meetingPoint = selectedVenue.getMeetingPoint();
      } else {
        meetingPoint = this.findMeetingPoint();

        if (this.product.getTopVenues().length === 1) {
          addressVenue = this.product.getVenueOnTop();
        }
      }

      if (!addressVenue && !meetingPoint) {
        const defaultVenue = this.product.calculateDefaultVenue({});

        if (defaultVenue) {
          addressVenue = defaultVenue.getTopVenue();
        }
      }

      return {addressVenue, meetingPoint};
    },

    findMeetingPoint() {
      for (let venue of this.product.getVenues()) {
        let meetingPoint = venue.getMeetingPoint();
        if (meetingPoint) {
          return meetingPoint;
        }
      }
      return null;
    },

    preparePins() {
      if (!this.product) {
        return;
      }

      if (this.product.getVenues()) {
        let venuesForMap = [];

        let subVenuesAdded = false;

        let visibleVenues;
        const selectedVenues = this.product.getVenues().filter((venue) => venue.selected);

        if (this.isVenueConfirmed) {
          visibleVenues = selectedVenues;
        } else if (this.product.getMultiVenueSetting() !== 'Yes') {
          visibleVenues = selectedVenues.length ? selectedVenues : this.product.getVenues().slice(0, 1);
        } else {
          visibleVenues = this.product.getVenues();
        }

        for (let item of visibleVenues) {
          let venue = item.getTopVenue();

          if (venue) {
            venuesForMap.push(venue);
          }

          venue = item.getMeetingPoint();

          if (venue) {
            venuesForMap.push(venue);
          }

          let subVenues = item.getSubVenues();

          if (subVenues.length && !subVenuesAdded) {
            for (venue of subVenues) {
              venuesForMap.push(venue);
            }
            subVenuesAdded = true;
          }
        }

        if (!venuesForMap.length) {
          return;
        }

        const selectedVenue = this.product.getSelectedVenue();

        this.pins = venuesForMap.map((venue) => {
          if (venue.getLatitude() === undefined || !venue.getLongitude() === undefined) {
            return null;
          }

          return {
            id: venue.getId(),
            position: {
              lat: venue.getLatitude(),
              lng: venue.getLongitude(),
            },
            title: venue.getName(),
            type: venue.getVenueType(),
            selected: selectedVenue ? selectedVenue.getMainVenue() === venue : false,
            infoWinOpen: true,
            venue
          };
        }).filter(item => item !== null)
      }
    },

    getMapMarkerIconUrl(pin): string {
      const color = (pin.type === ProductVenueType.meetingPoint) ? 'blue' : 'red';
      const size = (pin.selected === true) ? '_big' : '';

      return `${this.appConfig.http.serverBaseURL}/_nuxt_public/map_pin_filled_${color}${size}.svg`;
    },

    prepareMapCenter() {
      if (this.pins.length) {
        this.mapCenter = this.pins[0].position;
      }
    },

    switchOnInfoWindow: function(targetPin) {
      for (let pin of this.pins) {
        pin.infoWinOpen = false;
      }

      targetPin.infoWinOpen = true;
    },

    toggleInfoWindow: function(targetPin) {
      if (!targetPin.infoWinOpen) {
        this.switchOnInfoWindow(targetPin);
      } else {
        targetPin.infoWinOpen = false;
      }
    },

    async fitGoogleMapBoundsForMarkers(): Promise<void> {
      if (this.pins.length < 2) {
        return;
      }

      const google = await useGoogleMapsApiPromiseLazy();
      const latLngBounds = new google.maps.LatLngBounds();

      this.pins.forEach((pin) => {
        const point = new google.maps.LatLng(pin.position);
        latLngBounds.extend(point);
      });

      this.$refs.googleMap.fitBounds(latLngBounds);
    },

    markerClicked(pin, index) {
      this.toggleInfoWindow(pin);
      this.mapCenter = pin.position;
      this.venueToShow = pin.venue;
    },
  }
}
</script>

<style lang="scss">

.gmv-map {
  width: 100% !important;
  height: 100% !important;
}

.google-maps {
  & .location-details{
    text-align: center;
    & .container{
      margin-bottom: 10px;
    }
    & .title{
      text-transform: uppercase;
      font-family: $ff2;
      font-size: 14px;
      font-weight: 700;
    }
    & .text{
      font-size: 16px;
    }

  }
  & .map {
    @include mobile() {
      width: 100%;
      height: calc(40vh);
    }
    @include desktop() {
      flex-grow: 1;
      height: calc(100vh - 64px);
      position: sticky;
      top: 64px;
    }
  }
  & .content {
    background: $CB-1;
    @include mobile {
      max-width: 100vw; // Stops the slider expanding out.
    }
    @include desktop {
      width: 310px;
      display: grid;
      padding: 5px;
      grid-gap: 5px;
    }
  }
}
</style>
