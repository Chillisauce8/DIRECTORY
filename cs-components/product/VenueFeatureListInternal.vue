<template>
  <div class="Copy">

    <dl>
      <template v-for="infoField of infoIterable">
        <div v-if="infoPossibleFields[infoField.key] && needShowFieldInfo(infoField.val)">
          <dt>{{ getTitleForSpecObjKey(infoPossibleFields, infoField.key) }}</dt>
          <template v-for="item of getValueForSpecObjectKey(infoPossibleFields, venue.getInfo(), infoField.key)">
            <dd>{{ item }}</dd>
          </template>
        </div>
      </template>

      <template v-for="infoField of accommodation">
        <div v-if="needShowFieldInfo(infoField.val)">
          <dt>{{ getTitleForSpecObjKey(accommodationPossibleFields, infoField.key) }}</dt>
          <template v-for="item of getValueForSpecObjectKey(accommodationPossibleFields, venue.getAccommodation(), infoField.key)">
            <dd>{{ item }}</dd>
          </template>
        </div>
      </template>

      <div v-if="venue && needShowFieldInfo(venue.getOpeningTimes())">
        <dt>Opening Times</dt>
        <template v-for="item of venue.getOpeningTimes()">
          <dd>{{ getOpeningTimesItemString(item) }}</dd>
        </template>
      </div>

    </dl>

  </div>
</template>

<script>


import {useCsLodash} from "~/services/cs-lodash.factory";
import {useDateHelper} from "~/services/helpers/date-helper.factory";

export default {
  props: ['venue'],
  setup() {
    return {
      csLodash: useCsLodash(),
      dateHelper: useDateHelper()
    }
  },
  methods: {
    needShowFieldInfo(field) {
      if (Array.isArray(field)) {
        return field.length > 0;
      } else if (this.csLodash.isObject(field)) {
        return Object.keys(field).length;
      }

      return !!field;
    },
    mapToIterable(dict) {
      const a = [];
      for (const key in dict) {
        if (dict.hasOwnProperty(key)) {
          a.push({key: key, val: dict[key]});
        }
      }
      return a;
    },
    getTitleForSpecObjKey(possibleFields, key) {
      return possibleFields[key] ? possibleFields[key].title : null;
    },
    getValueForSpecObjectKey(possibleFields, obj, key) {
      return this.getValuesArray(obj[key], possibleFields[key]);
    },
    getValuesArray(value, description) {
      let resultArray = [];

      if (!description) {
        return;
      }

      if (Array.isArray(value) && value.length) {
        resultArray = value;
        if (this._isTimeString(resultArray[0])) {
          resultArray = resultArray.map(item => { return this.getShortTimeString(item); });
        }
      } else if (this.csLodash.isObject(value)) {
        resultArray = this._handleObjectValue(description.fieldsOrder, value);
      } else if (this.csLodash.isNumber(value)) {
        let valueString = value.toString();

        if (description.measure) {
        let measure = description.measure;
        valueString += ' ' + this._getMeasureString(measure, value);
      }

        resultArray.push(valueString);
      } else if (this.csLodash.isString(value)) {
        resultArray.push(value);
      }

      return resultArray;
    },
    _getMeasureString(measureName, value) {
      return (value > 0) ? measureName + 's' : measureName;
    },
    _handleObjectValue(description, value) {
      let result = [];

      let getValuePrefixOrSuffix = (description, currentValue, fieldValue) => {
        if (!description) {
          return '';
        }

        return this.csLodash.isString(description) ? description : fieldValue[description.fromField];
      };

      for (let fieldDescription of description) {

        let fieldValue = value[fieldDescription.key];

        if (!fieldValue) {
          continue;
        }

        let prefix = getValuePrefixOrSuffix(fieldDescription.prefix, fieldValue, value);
        let suffix = getValuePrefixOrSuffix(fieldDescription.suffix, fieldValue, value);

        result.push(`${prefix} ${fieldValue} ${suffix}`.trim());
      }

      return result;
    },
    getOpeningTimesItemString(item) {
      let times = this.getShortTimeString(item.fromTime) + ' - ' + this.getShortTimeString(item.toTime);
      let days = (item.fromDay === item.toDay) ? item.fromDay : (item.fromDay + ' - ' + item.toDay);

      return `${ times } · ${ days } · ${item.fromMonth} - ${item.toMonth}`;
    },
    getShortTimeString(timeString) {
      if (!timeString) {
        return '';
      }

      return this.dateHelper.timeStringToViewTimeFormat(timeString);
    },
    _isTimeString(value) {
      const dateRegExp = /(\d{1,2}:\d{1,2}) (AM|PM)/i;
      return dateRegExp.test(value);
    },
  },
  computed: {
    accommodation() {
      if (this.venue) {
        return this.mapToIterable(this.venue.getAccommodation() || {});
      }
    },
    infoIterable() {
      if (this.venue) {
        return this.mapToIterable(this.venue.getInfo() || {});
      }
    }
  },
  data() {
    const infoPossibleFields = {
      heightMetres: {
        title: 'Height',
        measure: 'metre'
      },
      lengthMetres: {
        title: 'Length',
        measure: 'metre'
      },
      style: {
        title: 'Style'
      },
      music: {
        title: 'Music'
      },
      bars: {
        title: 'Bars'
      },
      liveSports: {
        title: 'Live Sports'
      },
      pubGames: {
        title: 'Pub Games'
      },
      drinkPrices: {
        title: 'Prices'
      },
      shootingStands: {
        title: 'Shooting Stands'
      },
      clayTraps: {
        title: 'Traps'
      },
      highTowers: {
        title: 'High Towers'
      },
      paintballType: {
        title: 'Type'
      },
      zones: {
        title: 'Zones'
      },
      acres: {
        title: 'Size',
        measure: 'acre'
      },
      paintballTerrain: {
        title: 'Terrain'
      },
      paintballFeatures: {
        title: 'Features'
      },
      trackType: {
        title: 'Type'
      },
      trackTerrain: {
        title: 'Terrain'
      },
      lapRecord: {
        title: 'Lap Record',
        measure: 'second'
      },
      longestStraight: {
        title: 'Longest Straight',
        measure: 'metre'
      },
      trackWidth: {
        title: 'Width',
        measure: 'metre'
      },
      trackSurface: {
        title: 'Surface'
      },
      trackFeatures: {
        title: 'Features'
      },
      maxKartsOnTrack: {
        title: 'Maximum Karts on Track'
      },
      par: {
        title: 'Par'
      },
      holes: {
        title: 'Holes'
      },
      yards: {
        title: 'Yards'
      },
      courseType: {
        title: 'Type'
      },
      SSS: {
        title: 'SSS'
      },
      golfFacilities: {
        title: 'Facilities'
      },
      setting: {
        title: 'Setting'
      },
      leisure: {
        title: 'Leisure'
      },
      outdoorSpace: {
        title: 'Outdoors'
      },
      amenities: {
        title: 'Amenities'
      },
      foodDrink: {
        title: 'Food & Drink'
      },
      cuisine: {
        title: 'Cuisine'
      },
      foodService: {
        title: 'Service'
      },
      internet: {
        title: 'Internet'
      },
      services: {
        title: 'Services'
      },
      treatments: {
        title: 'Services'
      },
      alcohol: {
        title: 'Alcohol'
      },
      functionRoomFeatures: {
        title: 'Features'
      },
      parking: {
        title: 'Parking'
      },
      changing: {
        title: 'Changing Facilities'
      },
      access: {
        title: 'Access'
      },
      handicapRequired: {
        title: 'Handicap Required'
      },
      menMaxHandicap: {
        title: 'Mens Maximum Handicap'
      },
      womenMaxHandicap: {
        title: 'Womens Maximum Handicap'
      },
      whiteTee: {
        title: 'White Tee',
        fieldsOrder: [
          {
            key: 'distance',
            suffix: {fromField: 'distanceUnit'}
          },
          {
            key: 'par',
            prefix: 'par'
          },
          {
            key: 'sss',
            prefix: 'sss'
          },
          {
            key: 'slopeRating',
            prefix: 'slope rating'
          }
        ]
      },
      yellowTee: {
        title: 'Yellow Tee',
        fieldsOrder: [
          {
            key: 'distance',
            suffix: {fromField: 'distanceUnit'}
          },
          {
            key: 'par',
            prefix: 'par'
          },
          {
            key: 'sss',
            prefix: 'sss'
          },
          {
            key: 'slopeRating',
            prefix: 'slope rating'
          }
        ]
      },
      redTee: {
        title: 'Red Tee',
        fieldsOrder: [
          {
            key: 'distance',
            suffix: {fromField: 'distanceUnit'}
          },
          {
            key: 'par',
            prefix: 'par'
          },
          {
            key: 'sss',
            prefix: 'sss'
          },
          {
            key: 'slopeRating',
            prefix: 'slope rating'
          }
        ]
      }
    };

    const accommodationPossibleFields = {
      starRating: {
        title: 'Official Rating',
        measure: 'star'
      },
      bedrooms: {
        title: 'Bedrooms'
      },
      apartments: {
        title: 'Apartments'
      },
      maxPeople: {
        title: 'Maximum People'
      },
      maxBeds: {
        title: 'Maximum Beds'
      },
      checkInTime: {
        title: 'Check-in Time'
      },
      checkOutTime: {
        title: 'Check-out Time'
      }
    };

    return {
      infoPossibleFields,
      accommodationPossibleFields,
    };
  },
}
</script>

<style lang="scss"></style>
