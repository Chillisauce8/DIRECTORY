<script setup lang="ts">
import type {EventDbNode} from '~/service/helpers/event/event.typings';
import {useDateHelper} from '~/service/helpers/date-helper.factory';
import { useCurrentEvent } from '~/service/helpers/event/current-event.service.factory';
import { useCurrentCustomer } from '~/service/helpers/user-common/current-customer-service.factory';
import {useCurrentUser} from '~/service/helpers/user-common/current-user.factory';
import {useCustomerEventsStore} from '~/store/customerEvents';
import {usePackageSaver} from '~/service/helpers/package-builder/package-saver.service.factory';
import {
  useSavePackageChangesHelperService
} from '~/service/helpers/package-builder/save-package-changes-helper.service.factory';
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {useUiLockerService} from '~/service/helpers/ui-locker.service.factory';

export type SwitchEventListItem = Pick<EventDbNode, '_doc' | 'eventSummary | packageOption'>;

const dialogInstance = useDialogInstance();

const dateHelper = useDateHelper();
const currentEvent = useCurrentEvent();
const currentCustomer = useCurrentCustomer();
const currentUser = useCurrentUser();
const customerEventsStore = useCustomerEventsStore();
const packageSaver = usePackageSaver();
const savePackageChangesHelperService = useSavePackageChangesHelperService();
const router = useRouter();
const uiLockerService = useUiLockerService();


const eventList = computed(() => {
  return customerEventsStore?.events ?? null;
});


const title = computed(() => {
  return `${currentUser?.isStaffOrHiddenStaff() ? currentCustomer.getName() : 'My'} events`;
});


const currentEventOpen = computed(() => unref(router.currentRoute).query['eventId'] === currentEvent.getId());


function prepareDateToDisplayFormat(date: string): string {
  return dateHelper.viewDateFormat(dateHelper.parseSaveDateFormat(date));
}

async function onLinkClicked(event: SwitchEventListItem) {
  if (unref(router.currentRoute).query['eventId'] === event?._doc || currentEvent.getId() === event?._doc) {
    await currentEvent.goToCurrentEvent();
    dialogInstance.close();
    return;
  }

  uiLockerService.lock();

  try {
    await currentEvent.load(event?._doc);
    dialogInstance.close();
  }
  finally {
    uiLockerService.unlock();
  }
}

function getLocationName(event: SwitchEventListItem) {
  const eventLocation = event.eventSummary.location?.name;

  if (eventLocation) {
    return eventLocation;
  }

  if (event.packageOption?.length === 1) {
    return event.packageOption[0].location?.name;
  }

  if (event.packageOption?.length > 1) {
    const locations = event.packageOption.map(item => item.location?.name);

    const reduceResult = locations.reduce((result, item) => {
      if (!result.includes(item)) {
        result.push(item);
      }

      return result;
    }, []);

    if (reduceResult.length === 1) {
      return reduceResult[0];
    }
  }

  return 'Location TBC';
}

</script>

<template>
  <div>
    <template v-for="event in eventList">
      <EventSmallCard :name="event.eventSummary.name"
                      :date="prepareDateToDisplayFormat(event.eventSummary.startDate) || 'Date: TBC'"
                      :location="getLocationName(event)"
                      :status="event.eventSummary.statusStage"
                      :organiser="event.eventSummary.organiser?.name"
                      :manager="event.eventSummary.manager?.name  || 'TBC'"
                      :managerAtBooking="event.eventSummary.managerAtBooking?.name  || 'TBC'"
                      :class="[event._doc === currentEvent.getId() && currentEventOpen ? 'selected' : '']"
                      @click.native="onLinkClicked(event)"/>
    </template>
  </div>
</template>

<style lang="scss">
.event-switch-list {

  &.event-item {
    font-size: .7em;
    font-family: $ff2;

    transition: all ease .5s;
    text-transform: uppercase;

    &.not-selected {
      color: $C2;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
