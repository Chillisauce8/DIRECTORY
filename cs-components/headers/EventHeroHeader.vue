<template>
  <HeroHeaderWrapper class="event-hero-header" :class="{disabled : disabled}">
    <image-wrapper :images="preparedImages" :random="true" :grayscale="true" :tint="true" dpr="1" :width="1000"
                   loading="eager" class="random-tint image-row">
      <div class="header-content">
        <EmptyEventMessage class="package-products-false-show"/>

        <div class="name-wrapper">
        <h1 :contenteditable="!disabled && canChangeEventName"
            @keydown.esc="restoreEventName"
            @keydown.enter="storeEventName"
            @blur="storeEventName">{{ packageDetails.eventName || 'Event Name' }}</h1>
        <LazySvgIcon v-if="canChangeEventName" svg="edit" />
      </div>
        <h2 v-if="canChangeEventName">Click to Edit Event Name</h2>
     
      </div>
    </image-wrapper>
  </HeroHeaderWrapper>
</template>

<script>
import { useDateHelper } from "~/services/helpers/date-helper.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import { useSettingsTemplateService } from "~/services/helpers/data-templates/settings-template.factory";
import { useEventBookedHistoryService } from "~/services/helpers/event/event-booked-history.service.factory";
import { useCurrentEventStore } from "~/store/currentEvent";
import { useEventPermissionsService } from "~/services/helpers/event/event-permissions.service.factory";
import { useDataTemplateFabricService } from "~/services/helpers/data-templates/data-template-fabric.factory";
import { useEventPackageBuilder } from "~/services/helpers/package-builder/package-builder.service.factory";
import {usePackageBookingNotifyService} from '~/services/helpers/package/package-booking-notify.service.factory';
import {usePackageSaver} from '~/services/helpers/package-builder/package-saver.service.factory';
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useCustomerEventsStore} from '~/store/customerEvents';
import {useUserDialogShowService} from '~/services/dialog/user-dialog-show.service';
import {useSelectCustomerDialogShowService} from '~/services/dialog/select-customer-dialog-show.service';
import {useCustomerEvents} from '~/services/helpers/event/customer-events.service.factory';
import {useCurrentSection} from "~/services/helpers/current-section.factory";
import {useGlobalElementsTemplateService} from '~/services/helpers/data-templates/global-elements-template.factory';
import {useMessageService} from '~/services/helpers/message.factory';
import {getDocumentSafe, getWindowSafe} from '~/services/helpers/browser/browser.helpers';

export default {
  name: "EventHeroHeader",
  props: ['subTitle', 'eventPackage', 'disabled'],
  setup(props) {
    const dateHelper = useDateHelper();
    const currentEvent = useCurrentEvent();

    const packageDetails = ref(null);

    function getPackageDetails() {

      const packageDetails = {
        eventName: currentEvent.getName(),
      };

      const startDate = props.eventPackage?.getStartDate();

      if (startDate) {
        packageDetails.date = dateHelper.viewDateFormat(startDate);
      } else {
        packageDetails.date = undefined;
      }

      packageDetails.nights = props.eventPackage?.getDaysCount() ?
          props.eventPackage.getDaysCount() - 1 : 0;
      packageDetails.people = props.eventPackage?.getPeopleCount();

      return packageDetails;
    }

    watch(() => props?.eventPackage, () => {
      packageDetails.value = getPackageDetails();
    }, {deep: true, immediate: true});

    return {
      currentInstance: getCurrentInstance(),
      dateHelper,
      currentUser: useCurrentUser(),
      currentEvent,
      currentSection: useCurrentSection(),
      currentEventStore: useCurrentEventStore(),
      customerEventsStore: useCustomerEventsStore(),
      settingsTemplateService: useSettingsTemplateService(),
      eventBookedHistoryService: useEventBookedHistoryService(),
      eventPermissionsService: useEventPermissionsService(),
      dataTemplateFabric: useDataTemplateFabricService(),
      packageBuilder: useEventPackageBuilder(),
      packageBookingNotifyService: usePackageBookingNotifyService(),
      packageSaver: usePackageSaver(),
      userDialogShowService: useUserDialogShowService(),
      selectCustomerDialogShowService: useSelectCustomerDialogShowService(),
      customerEvents: useCustomerEvents(),
      globalElementsTemplateService: useGlobalElementsTemplateService(),
      messageService: useMessageService(),
      packageDetails,
    }
  },
  data() {
    return {
      eventName: undefined,
      canChangeEventName: undefined,
      currentPackageUpdatedSubscription: undefined,
      packageLoadedSubscription: undefined,
      subscriptionList: [],
      images: {
          stag: [      

        {
          cloudinaryId: '6546652cafa7da0f9649fdbb', // Karts Racing
        },
        {
          cloudinaryId: '65466bfcafa7da0f964a000e', // Car
        },
        {
          cloudinaryId: '65203000ee0f8f0f819f1ab2', // Kids Car Finish
        },
        {
          cloudinaryId: '650c2d0dc541fd0f83d2f3a3', // Mis of all activities
        },
        {
          cloudinaryId: '650c2d0dc541fd0f83d2f3a3',
        },
        ] ,
          hen: [{
          cloudinaryId: '654663f0c302c20f899089d4',
        },
        {
          cloudinaryId: '65460be0c943fd0f932cc573',
        },
      ],
          groups: [{
            cloudinaryId: '6523cb2c8c81630f8f878d95',
          }],
          events: [{
            cloudinaryId: '6523cb2c8c81630f8f878d95',
          }]
        }
    }
  },
  computed: {
    preparedImages() {
      const section = this.currentEvent.getSection();

      if (this.images?.[section]) {
        return this.images[section];
      }

      return this.images['stag'];
    },
  },
  beforeMount() {
    this.init();
  },
  mounted() {
    this.subscriptionList.push(this.initPackageChangeListener());
  },
  unmounted() {
    if (this.currentPackageUpdatedSubscription) {
      this.currentPackageUpdatedSubscription.unsubscribe();
    }

    if (this.packageLoadedSubscription) {
      this.packageLoadedSubscription.unsubscribe();
    }

    if (this.subscriptionList?.length) {
      this.subscriptionList.forEach(s => s.unsubscribe());
    }
  },
  methods: {
    init() {
      this.eventName = this.currentEvent.getName();

      this._getPermissions();

      this.currentPackageUpdatedSubscription = this.subscribeOnCurrentPackageUpdated();
      this.packageLoadedSubscription = this.subscribeOnPackageLoaded();

      this.currentEventStore.$onAction(({name, after}) => {
        if (name !== 'setCurrentEventBookedMode' && name !== 'resetCurrentEventBookedMode') {
          return;
        }

        after(() => this._getPermissions());
      });
    },
    subscribeOnCurrentPackageUpdated() {
      return this.packageBuilder.onChanged((value) => {
        if (value) {
          this._getPermissions();
        }
      });
    },

    subscribeOnPackageLoaded() {
      return this.packageBuilder.onPackageLoaded(async (value) => {
        if (value) {
          this._getPermissions();
        }
      });
    },

    _getPermissions() {
      this.canChangeEventName = this.eventPermissionsService.hasPermission('eventHomeFunctions.editEventName', {});
    },

    initPackageChangeListener() {
      return this.packageBuilder.onChanged((val) => {
        if (!val) {
          return;
        }

        this.eventName = this.eventPackage?.getEventName() ?? this.currentEvent.getName();
      });
    },

    restoreEventName($event) {
      if (!$event.target) {
        return;
      }

      $event.target.innerText = this.packageDetails.eventName;
    },

    async storeEventName($event) {
      if (!$event.target) {
        return;
      }

      const innerText = this.getClearedInnerTextFromHtml($event.target.innerText);

      if (!innerText) {
        $event.target.focus();
        this.setEndOfContenteditable($event.target);

        const errorMessage = this.globalElementsTemplateService
            .getMessageFromDictionaryVariables('eventNameRequired') ?? 'Event name is required';

        this.messageService.showErrorMessage(errorMessage);

        return;
      }

      if (innerText === this.packageDetails.eventName) {
        return;
      }

      await this.updateName(innerText);
    },

    setEndOfContenteditable(contentEditableElement) {
      let range, selection;

      const window = getWindowSafe();
      const document = getDocumentSafe();

      if (!window) {
        return;
      }

      range = document.createRange();
      range.selectNodeContents(contentEditableElement);
      range.collapse(false);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    },

    async updateName(name, element) {
      const nameBackup = this.packageDetails.eventName;

      try {
        await this.currentEvent.updateName(name);
      } catch(e) {
        let message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('updateEventNameError');
        this.messageService.showMessage(message);

        element.innerText = nameBackup;

        return;
      }

      await this.currentEvent.reload();
      await this.customerEvents.reload();
    },

    getClearedInnerTextFromHtml(text) {
      let clearString = String(text).replace(/</gm, '&lt;');
      clearString = String(clearString).replace(/>/gm, '&gt;');
      return clearString;
    }
  }
};
</script>

<style lang="scss">




.edit-package-settings-button {
  z-index: auto;
}
.event-hero-header {
  .images {
    @include desktop {
      height: 50vh;
    }
    @include mobile{
      height: 60vh;
    }
  }
  .header-content{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  }
  h1{
    @include scale('font-size', 16px, 26px, 1.2);
  }
  h2 {
    font-size: 12px;
    margin-top: 5px;
  }
  &:not(.disabled){
  .name-wrapper{
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 3px;
    border: 1px solid white;
    padding: 0.25em 1em;
    text-align: center;
    @include frosted-glass-dark();
    transition: all 1s ease-in-out;
    width: clamp(300px, 500px, 90vw);
    & h1{
      flex-grow: 1;
    }
    &:hover{
      @include frosted-glass-darker();
    }
    .icon{
      flex-shrink: 10;
   //   margin-left: 1em;
    }
  }
  }
  &.disabled{
    .icon, h2{
      display: none;
    }
  }
}
</style>
