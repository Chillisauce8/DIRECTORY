<template>
  <div v-if="needShowEventHistorySelect" class="event-history-mode-selector">
    <NavIcon svg="clock"></NavIcon>

    <select v-model="eventHistoryMode" @change="eventHistoryModeChanged()">
      <option v-for="item in eventHistoryModes" :key="item" :value="item">
        {{ item }} Event State
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { ref, computed } from "vue";
import {useCurrentEvent} from "~/services/helpers/event/current-event.service.factory";
import {useCurrentUser} from "~/services/helpers/user-common/current-user.factory";
import { useEventBookedHistoryService } from '~/services/helpers/event/event-booked-history.service.factory';
import { useCurrentEventStore } from '~/store/currentEvent';


export const EVENT_HISTORY_MODE = {
  current: 'Current',
  booked: 'Booked'
};


export default {
  name: "EventHistoryModeSelector",
  setup() {
    const router = useRouter();
    const currentUser = useCurrentUser();
    const currentEvent = useCurrentEvent();
    const eventBookedHistoryService = useEventBookedHistoryService();
    const currentEventStore = useCurrentEventStore();

    const eventHistoryModes = [EVENT_HISTORY_MODE.current, EVENT_HISTORY_MODE.booked];
    const eventHistoryMode = ref(currentEventStore.bookMode ?
        EVENT_HISTORY_MODE.booked : EVENT_HISTORY_MODE.current);

    const currentEventBooked = ref(currentEvent.isBooked());


    const needShowEventHistorySelect = computed(() => {
      if (!process.client) {
        return false;
      }

      if (!currentUser.isStaffOrHiddenStaff()) {
        return false;
      }

      if (!currentEventBooked.value) {
        return false;
      }

      const currentUrl = unref(router.currentRoute).fullPath;

      if (!currentUrl.includes('/my-events')) {
        return false;
      }

      return true;
    });


    currentEventStore.$onAction(({name, after}) => {
      after(() => {
        eventHistoryMode.value = currentEventStore.bookMode ?
            EVENT_HISTORY_MODE.booked : EVENT_HISTORY_MODE.current;

        currentEventBooked.value = currentEvent.isBooked();
      });
    });


    function isBookedHistoryMode(): boolean {
      return eventHistoryMode.value === EVENT_HISTORY_MODE.booked;
    }


    async function eventHistoryModeChanged() {
      const result = await eventBookedHistoryService.process(isBookedHistoryMode());

      if (result === false && eventHistoryMode.value === EVENT_HISTORY_MODE.booked) {
        eventHistoryMode.value = EVENT_HISTORY_MODE.current;
      }
    }

    return {
      eventHistoryMode,
      eventHistoryModes,
      needShowEventHistorySelect,
      eventHistoryModeChanged,
    }
  }
}
</script>

<style lang="scss">
.event-history-mode-selector{
  select {
    position: relative;
    bottom:4px;
    margin: 0 5px;
    border: 0px;
    padding: 0px;
    font-size: 10px !important;
  & [value="Booked"]{
    color: $C1;
  }
}
}
</style>
