<template>
  <card-wrapper class="group-card">
    <LazySvgIcon svg="group" />
    <h1>The Group</h1>
    <ul class="information">
      <template v-for="(item, index) in dataState.listItems" :key="index">
        <li class="Row Between">
          <span>{{ item.title }} </span> <span> {{ item.value }}</span>
        </li>
      </template>
    </ul>
  </card-wrapper>
</template>

<script>
import {EVENT_STATUS_STAGES} from "~/service/models/event";
import {useCsLodash} from "~/service/cs-lodash.factory";
import {useDateHelper} from "~/service/helpers/date-helper.factory";

export default {
  props: ['event', 'dataTemplate'],
  setup() {
    return {
      csLodash: useCsLodash(),
      dateHelper: useDateHelper(),
    }
  },
  data() {
    return {
      dataState: {
        listItems: []
      }
    }
  },
  watch: {
    event: function (newVal, oldVal) {
      this.initOnNewEvent();
    }
  },
  beforeMount() {
    this.initOnNewEvent();
  },
  methods: {
    initOnNewEvent() {
      this._parseListItems();
    },
    _parseListItems() {
      this.dataState.listItems = this.dataTemplate.getRaw('groupCard.listItems', true)
        .map((item) => {
          let value = this.csLodash.get(this.event.getRawData(), item.value);

          const tmp = this.dateHelper.parseSaveDateFormat(value);

          if (this.dateHelper.isValidDate(tmp)) {
            value = this.dateHelper.shortViewDateFormat(tmp);
          }

          return {
            title: item.text,
            class: value ? item.className : '',
            value: value
          };
        })
        .filter((item) => item.value);

      if (!this.dataState?.listItems?.length) {
        return;
      }

      if (this.event.getEventStatusStage() === EVENT_STATUS_STAGES.postponed &&
          this.event.getCreditGBP() !== null) {
        this.dataState?.listItems?.unshift({
          title: 'Credit Value',
          rowClass: 'text-color_error',
          value: '£' + this.event.getCreditGBP(),
        });
      }

      if (this.event.getEventStatusStage() === EVENT_STATUS_STAGES.refundCreditNote &&
          this.event.getCreditGBP() !== null) {
        this.dataState?.listItems?.unshift({
          title: 'Refund Credit Value',
          rowClass: 'text-color_error',
          value: '£' + this.event.getCreditGBP(),
        });
      }
    }
  }
}
</script>

<style lang="scss">
.group-card{
  width: 300px;
  padding: 10px;
}
</style>
