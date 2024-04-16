<template>

    <block-wrapper class="guest-no-email W1">
      <h1>Do you have guests without an email address?</h1>
      <div class="copy">
        Guests without an email address won’t be able to log in and pay for
        themselves. If you would like to add someone to the event without an
        email address, simply add their name and make the payment for them.
      </div>
      <ButtonMain class="outline" @click.native="addUnregisteredGuest()">
        Add Guest Without Email
      </ButtonMain>
    </block-wrapper>

</template>

<script>
import { useEventService } from "~/services/helpers/event/event.service.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import { usePackageSaver } from "~/services/helpers/package-builder/package-saver.service.factory";
import { useNotificationMessageService } from "~/services/helpers/notification-message.factory";
import {
  useAddUnregisteredGuestsDialogShowService
} from "~/services/dialog/add-unregistered-guests-dialog-show.service";

export default {
  props: ["id", "event"],
  setup() {
    return {
      eventService: useEventService(),
      currentEvent: useCurrentEvent(),
      packageSaver: usePackageSaver(),
      notificationMessageService: useNotificationMessageService(),
      addUnregisteredGuestsDialog: useAddUnregisteredGuestsDialogShowService(),
    }
  },
  data() {
    return {
      savePackageInProgress: false,
      beforeCurrentPackageSavedListener: undefined,
      afterCurrentPackageSavedListener: undefined,
    }
  },
  beforeMount() {
    this.init();
  },
  beforeUnmount() {
    if (this.beforeCurrentPackageSavedListener) {
      this.beforeCurrentPackageSavedListener.unsubscribe();
    }

    if (this.afterCurrentPackageSavedListener) {
      this.afterCurrentPackageSavedListener.unsubscribe();
    }
  },
  watch: {
    event: function (newVal, oldVal) {
      this.init();
    }
  },
  methods: {
    init() {
      this._initCurrentPackageSavedListeners();
    },

    async addUnregisteredGuest() {
      const guestList = this.event.getCustomerSummary();

      const dialogResult = await this.addUnregisteredGuestsDialog.show({
        data: {
          guestList
        }});

      if (dialogResult.cancelled) {
        return;
      }

      const guestName = dialogResult.data.name;

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      const result = await this.eventService.addUnregisteredGuest(
        this.currentEvent.getId(), dialogResult.data);

      if (!result.ok) {
        if (result.message) {
          this.packageSaver.notifyAfterCurrentPackageSaved();

          if (result.message.endsWith(' already exists')) {
            this.notificationMessageService.showGuestAlreadyExistMessage(guestName);
          }
        }

        return;
      }

      const subscription = this.currentEvent.afterCurrentEventLoaded(() => {
        subscription.unsubscribe();

        this.packageSaver.notifyAfterCurrentPackageSaved();

        this.notificationMessageService.showGuestHasBeenAddedMessage(guestName);
      });

      this.currentEvent.reload();
    },

    _initCurrentPackageSavedListeners() {
      this.beforeCurrentPackageSavedListener = this.packageSaver.beforeCurrentPackageSaved(
        () => this.savePackageInProgress = true);

      this.afterCurrentPackageSavedListener = this.packageSaver.afterCurrentPackageSaved(
        () => this.savePackageInProgress = false);
    }
  }
}
</script>

<style lang="scss"></style>
