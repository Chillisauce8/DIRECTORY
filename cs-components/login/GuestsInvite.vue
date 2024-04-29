<template>

    <block-wrapper class="guests-invite W1">
      <h1>Invite Your Guests</h1>
      <div class="copy">
        It's very simple to invite guests to your event - simply send them the
        link below, and they will be able to register, let you know whether they
        can attend, select the things they are doing and pay for themselves.
      </div>
      <div class="link-box" @click="copyLink()">
        <div class="copy-text">Click The Box to Copy the Invite Link</div>
        <div class="link">{{ getLink() }}</div>
      </div>
      <template v-for="button in inviteButtons">
        <ButtonMain class="outline" :text="button.text" :icon="button.iconName" @click.native="openUrl(button.url)">
        </ButtonMain>
      </template>

    </block-wrapper>

</template>

<script >
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { Clipboard } from "v-clipboard"
import { useIsMobileDeviceService } from "~/service/helpers/browser/is-mobile-device.service.factory";
import { useGlobalElementsTemplateService } from '~/service/helpers/data-templates/global-elements-template.factory';
import {useMessageService} from "~/service/helpers/message.factory";

export default {
  props: ["id", "event"],
  data() {
    return {
      inviteButtons: [],
    }
  },
  setup() {
    return {
      currentEvent: useCurrentEvent(),
      isMobileDeviceService: useIsMobileDeviceService(),
      appConfig: useAppConfig(),
      globalElementsTemplateService: useGlobalElementsTemplateService(),
      messageService: useMessageService(),
    }
  },
  beforeMount() {
    this.init();
  },
  methods: {
    init() {
      this.prepareInviteButtons();
    },
    getLink() {
      const token = this.currentEvent.getToken();

      if (!token) {
        return '';
      }

      return window.location.origin + `/inv/${token}`;
    },

    copyLink() {
      Clipboard.copy(this.getLink());

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('inviteLinkCopied');
      this.messageService.showMessage(message);
    },

    openUrl(url) {
      window.open(url, '_blank');
    },

    prepareInviteButtons() {
      const token = this.currentEvent.getToken();

      const serverUrl = this.appConfig.http.serverBaseURL;

      if (this.isMobileDeviceService.isMobileDevice()) {
        this.inviteButtons = [
          {
            text: 'Send By WhatsApp',
            iconName: 'whatsapp',
            url: `whatsapp://send?text=Click the link to sign up ${serverUrl}/inv/${token}`
          },
          {
            text: 'Send By FB Messenger',
            iconName: 'facebook',
            url: `fb-messenger://share/?link=${encodeURI(serverUrl + '/inv/' + token)}&app_id=156718004882406`
          }
        ];
      } else {
        this.inviteButtons = [
          {
            text: 'Send By Email',
            iconName: 'email',
            url: `mailto:?subject=Invite&body=Click the link to view the details ${serverUrl}/inv/${token}`
          }
        ];
      }
    }
  }
}
</script>

<style lang="scss">
.guests-invite {
  & .link-box {
    width: max-content;
    padding: 1rem;
    border: 2px dashed $C2;
    cursor: copy;
    &:hover {
      border-color: $C1;
    }
    //  color: $C2;
    & .copy-text {
      font-size: 14px;
    }
    & .link {
      color: $C2;
      @include scale(font-size, 14px, 20px, 1.5);
      font-weight: 600;
    }
  }
}
</style>
