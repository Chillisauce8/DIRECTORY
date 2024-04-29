<template>
  <VenueFeatureListInternal v-if="isVenueOnTop" :venue="product.getVenueOnTop()"></VenueFeatureListInternal>

  <div class="Copy">
    <template v-if="units">
      <dl v-if="needShowFieldInfo(units.min)">
        <dt>Minimum People</dt>
        <dd>{{ units.min }}</dd>
      </dl>
      <dl v-if="needShowFieldInfo(units.max)">
        <dt>Maximum People</dt>
        <dd>{{ units.max }}</dd>
      </dl>
    </template>

    <template v-if="info">
      <dl v-if="needShowFieldInfo(info.dressCode)">
        <dt>Dress code</dt>
        <template v-for="item in getValuesArray(info.dressCode)">
          <dd>{{ item }}</dd>
        </template>
      </dl>
      <dl v-if="needShowFieldInfo(info.thingsToBring)">
        <dt>To bring</dt>
        <template v-for="item in getValuesArray(info.thingsToBring)">
          <dd>{{ item }}</dd>
        </template>
      </dl>
      <dl v-if="needShowFieldInfo(info.idRequired)">
        <dt>ID Required</dt>
        <template v-for="item in getValuesArray(info.idRequired)">
          <dd>{{ item }}</dd>
        </template>
      </dl>
      <dl v-if="needShowFieldInfo(info.usefulInfo)">
        <dt>Useful Info</dt>
        <template v-for="item in getValuesArray(info.usefulInfo)">
          <dd>{{ item }}</dd>
        </template>
      </dl>
      <div v-if="needShowFieldInfo(info.importantInfo) && canShowImportantInfo()">
        <dt>Important Info</dt>
        <template v-for="item in getValuesArray(info.importantInfo)">
          <dd>{{ item }}</dd>
        </template>
      </div>
    </template>

    <template v-if="times">
      <dl v-if="times.startTimes && times.timeType === 'Entry Times' && times.startTimes.length > 0">
        <dt>Entry Times</dt>
        <template v-for="item of getRegularStartTimesArray()">
          <dd>
            {{ item }}
          </dd>
        </template>
      </dl>

      <dl v-if="needShowFieldInfo(times.startTimes && times.startTimes.setStartTimes)">
        <dt>Start Times</dt>
        <template v-for="item of getValuesArray(times && times.startTimes && times.startTimes.setStartTimes)">
          <dd>
            {{ item }}
          </dd>
        </template>
      </dl>

      <dl v-if="times.timeType === 'Start Times' && times.startTimes && times.startTimes.length > 0">
        <dt>Start Times</dt>
        <template v-for="item of getStartTimesArray()">
          <dd>
            {{ item }}
          </dd>
        </template>
      </dl>

      <dl v-if="times.timeType === 'Regular Start Times' && times.startTimes && times.startTimes.length > 0">
        <dt>Start Times</dt>
        <template v-for="item of getRegularStartTimesArray()">
          <dd>{{ item }}</dd>
        </template>
      </dl>

      <dl v-if="times.timeToAllow && times.timeToAllow.allow && times.timeToAllow.unit">
        <dt>Allow</dt>
        <dd>{{ times.timeToAllow.allow }} {{ times.timeToAllow.unit }}</dd>
      </dl>

      <dl v-if="times.transferTimes && times.transferTimes.allow && times.transferTimes.unit">
        <dt>Transfer Times</dt>
        <dd>{{ times.transferTimes.allow }} {{ times.transferTimes.unit }}</dd>
      </dl>
    </template>

    <template v-if="restrictions">
      <dl v-if="needShowFieldInfo(restrictions.minAge)">
        <dt>Minimum Age</dt>
        <template v-for="item in getValuesArray(restrictions.minAge)">
          <dd>{{ item }}</dd>
        </template>
      </dl>
      <dl v-if="needShowFieldInfo(restrictions.minHeight)">
        <dt>Minimum Height</dt>
        <template v-for="item in getValuesArray(restrictions.minHeight, 'cm')">
          <dd>{{ item }}</dd>
        </template>
      </dl>
      <dl v-if="needShowFieldInfo(restrictions.minInsideLeg)">
        <dt>Minimum Inside Leg</dt>
        <template v-for="item in getValuesArray(restrictions.minInsideLeg, 'cm')">
          <dd>{{ item }}</dd>
        </template>
      </dl>
      <dl v-if="needShowFieldInfo(restrictions.maxHeight)">
        <dt>Maximum Height</dt>
        <template v-for="item in getValuesArray(restrictions.maxHeight, 'cm')">
          <dd>{{ item }}</dd>
        </template>
      </dl>
      <dl v-if="needShowFieldInfo(restrictions.maxWeight)">
        <dt>Maximum Weight</dt>
        <template v-for="item in getValuesArray(restrictions.maxWeight, 'kg')">
          <dd>{{ item }}</dd>
        </template>
      </dl>
    </template>

    <template v-if="availability">
      <dl v-if="needShowFieldInfo(availability.specificDates)">
        <dt>Dates</dt>
        <template v-for="item in getSpecificDatesArray(availability.specificDates)">
          <dd> {{ item }}</dd>
        </template>
      </dl>

      <dl v-if="needShowFieldInfo(availability.regularDates)">
        <dt>Runs</dt>
        <dd v-if="availability.regularDates">
          {{ availability.regularDates.fromDay }} {{ availability.regularDates.fromMonth }} -
          {{ availability.regularDates.toDay }} {{ availability.regularDates.toMonth }}
        </dd>
      </dl>
    </template>

    <template v-if="bookingConditions">
      <dl v-if="needShowFieldInfo(bookingConditions.damageDeposit)">

        <dt>Damage deposit</dt>
        <dd>
          {{ bookingConditions.damageDeposit.amount }} {{ bookingConditions.damageDeposit.amoutType }}
          per {{ bookingConditions.damageDeposit.per }} by {{ bookingConditions.damageDeposit.paymentMethod }}
        </dd>
      </dl>

      <dl v-if="needShowFieldInfo(bookingConditions.prePayment)">

        <dt>Pre-Payment</dt>
        <dd>
          {{ bookingConditions.prePayment.amount }} {{ prepareAmountType(bookingConditions.prePayment.amoutType) }}
          per {{ bookingConditions.prePayment.per }} by {{ bookingConditions.prePayment.paymentMethod }}
        </dd>
      </dl>
    </template>

  </div>
</template>

<script>


import {useGlobalElementsTemplateService} from "~/service/helpers/data-templates/global-elements-template.factory";
import {useCsLodash} from "~/service/cs-lodash.factory";
import {useDateHelper} from "~/service/helpers/date-helper.factory";
import { useEventPermissionsService } from "~/service/helpers/event/event-permissions.service.factory";

export default {
  props: ['product', 'isVenueOnTop'],
  data() {
    const times = this.product.getTimes();
    const info = this.product.getInfo();
    const restrictions = this.product.getRestrictions();
    const availability = this.product.getAvailability();
    const bookingConditions = this.product.getBookingConditions();

    const units = this.prepareUnitsInfo();

    return {
      times,
      info,
      restrictions,
      availability,
      bookingConditions,
      units
    }
  },
  setup() {
    return {
      globalElementsTemplate: useGlobalElementsTemplateService(),
      csLodash: useCsLodash(),
      dateHelper: useDateHelper(),
      eventPermissionsService: useEventPermissionsService(),
    }
  },
  methods: {
    prepareUnitsInfo() {
      if (!this.product.isUnitTypePerson() || this.product.getMinUnitsCountValue() === 1) {
        return null;
      }

      const minPersons = this.product.getMinUnitsCountValue() * this.product.getMaxPeoplePerUnitValue();
      const maxPersons = this.product.getMaxUnitsCountValue() ?
        this.product.getMaxUnitsCountValue() * this.product.getMaxPeoplePerUnitValue() : null;

      const unitsConfig =  {
        min: `${minPersons} ${this.globalElementsTemplate.getMessageFromDictionaryVariables('productMinNumberPeople')}`
      };

      if (maxPersons) {
        Object.assign(unitsConfig, {
          max: `${maxPersons} ${this.globalElementsTemplate.getMessageFromDictionaryVariables('productMaxNumberPeople')}`
        });
      }

      return unitsConfig;
    },

    checkIsObjectEmpty(obj) {
      if (!obj || !Object.keys(obj).length) {
        return true;
      }

      for (let key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }

        if (obj[key] instanceof Array) {
          if (obj[key].length) {
            return false;
          }
        } else if (obj[key] instanceof Object) {
          return false;
        }
      }
    },

    needShowFieldInfo(field) {
      if (Array.isArray(field)) {
        return field.filter(item => !!item).length > 0;
      } else if (this.csLodash.isObject(field)) {
        return Object.keys(field).length > 0;
      }

      return !this.csLodash.isUndefined(field) && field !== null;
    },

    getValuesArray(value, measure) {
      let resultArray = [];

      if (Array.isArray(value) && value.length) {
        resultArray = value;
        if (this._isTimeString(resultArray[0])) {
          resultArray = resultArray.map((item) => { return this.getShortTimeString(item); });
        }
      } else if (this.csLodash.isNumber(value)) {
        let valueString = value.toString();

        if (measure) {
          valueString += ' ' + ((value > 0) ? measure + 's' : measure);
        }

        resultArray.push(valueString);
      } else if (this.csLodash.isString(value)) {
        resultArray.push(value);
      }

      return resultArray;
    },

    getRegularStartTimesArray() {
      let stringsArray = [];

      if (!this.times || !this.times.startTimes || this.times.startTimes.length === 0) {
        return [];
      }

      for (let item of this.times.startTimes) {
        let result = item.fromDay;

        if (!this.csLodash.isUndefined(item.toDay) && item.fromDay !== item.toDay) {
          result += ' to ' + item.toDay;
        }

        result += ' ';

        if (item.from && item.to) {
          result += `${this.getShortTimeString(item.from)} - ${this.getShortTimeString(item.to)}`;
        }

        stringsArray.push(result);
      }

      return stringsArray;
    },

    getStartTimesArray() {
      let stringsArray = [];

      if (!this.times || !this.times.startTimes || this.times.startTimes.length === 0) {
        return [];
      }

      for (let item of this.times.startTimes) {
        let result = item.fromDay;
        if (item.toDay && item.fromDay !== item.toDay) {
          result += ' to ' + item.toDay;
        }

        result += ' ';

        if (item.setStartTimes && item.setStartTimes.length > 0) {
          result += item.setStartTimes.map((item) => {
            return this.getShortTimeString(item);
          }).join(', ') + '.';
        }

        stringsArray.push(result);
      }

      return stringsArray;
    },

    getSpecificDatesArray(array) {
      if (!array) {
        return;
      }

      return array.map((item) => {
        return `${item.from} - ${item.to}`;
      });
    },

    getShortTimeString(timeString) {
      if (!timeString) {
        return '';
      }

      return this.dateHelper.timeStringToViewTimeFormat(timeString);
    },

    canShowImportantInfo() {
      return this.eventPermissionsService.hasPermission(
        'packageProductDetails.importantInformation', {});
    },

    prepareAmountType(bookingConditionsAmoutType) {
      if (bookingConditionsAmoutType === 'Currency') {
        return this.product.getCurrencySymbol();
      } else {
        return bookingConditionsAmoutType;
      }
    },

    _isTimeString(value) {
      const dateRegExp = /(\d{1,2}:\d{1,2}) (AM|PM)/i;
      return dateRegExp.test(value);
    }

  },
}
</script>

<style lang="scss"></style>
