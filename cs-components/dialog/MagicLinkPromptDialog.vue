<script setup lang="ts">
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {useCustomerService} from '~/service/helpers/customer/customer.service';
import {useRoutingHelper} from '~/service/helpers/routing-helper.fabric';
import {useUserService} from '~/service/helpers/user-common/user-service.factory';
import {vRestrictPattern} from '~/utils/directives/restrict-pattern.directive';
import {useCurrentUser} from '~/service/helpers/user-common/current-user.factory';
import {useZukoTrackerService} from '~/service/helpers/zuko/zuko-tracker.service.factory';
import {cs6ZukoSlug} from '~/service/helpers/zuko/cs6-zuko.const';
import {ZukoTrackEventType} from '~/service/helpers/zuko/zuko-tracker.service';
import {useEventPageDeferredParamsStore} from '~/store/eventPageDeferredParam';

export interface MagicLinkPromptDialogData {
  email: string;
}

const customerService = useCustomerService();
const userService = useUserService();
const routingHelper = useRoutingHelper();
const currentUser = useCurrentUser();
const router = useRouter();
const zukoTrackerService = useZukoTrackerService();

const dialogData = useDialogData<MagicLinkPromptDialogData>();
const dialogInstance = useDialogInstance();
const eventPageDeferredParamsStore = useEventPageDeferredParamsStore();

const email = dialogData?.email;

if (!email) {
  dialogInstance.close();
}

const vm = reactive({
  email,
  last4PhoneDigits: null,
  authDigits: '',
  errorMessage: '',
  loginInProgress: false,
});

const defaultErrorMessage = 'Something went wrong. Please check code or use MAGIC LINK.';

async function init() {
  vm.last4PhoneDigits = await customerService.get4LastPhoneDigits(email);

  await routingHelper.setQueryParam('magic-link-sent', 'yes');

  triggerZukoTracking();
}

async function loginWithAuthDigits() {
  vm.loginInProgress = true;

  try {
    const {eventId = undefined, customerId, needUserLogin} = await userService.loginWithAuthDigits(vm.authDigits, vm.email);

    if (needUserLogin) {
      vm.errorMessage = defaultErrorMessage;
    }

    if (!currentUser.isLoggedIn()) {
      vm.errorMessage = defaultErrorMessage;
    } else {
      eventPageDeferredParamsStore.setRef(undefined);
      eventPageDeferredParamsStore.setForm(undefined);
      eventPageDeferredParamsStore.setNewEvent(undefined);

      await router.push({
        path: '/my-events',
        query: {
          eventId,
          customerId,
          'magic-link-sent': undefined,
          ref: undefined,
          form: undefined,
          'new-event': undefined,
        },
      });

      vm.loginInProgress = false;

      dialogInstance.close();
    }
  } catch (e) {
    vm.errorMessage = defaultErrorMessage;
    vm.loginInProgress = false;
  }
}


function triggerZukoTracking() {
  const queryParams = routingHelper.getCurrentQueryParams();

  const form = queryParams?.dialog ?? queryParams?.form;

  const slug = form === 'enquiryForm' ? cs6ZukoSlug.magicLinkEnquiryFrom : cs6ZukoSlug.magicLinkOrganiserFrom;

  zukoTrackerService.trackEvent({
    slug,
    event: ZukoTrackEventType.formViewEvent,
    elementSelector: '.magic-link-prompt',
  });

  setTimeout(() => {
    zukoTrackerService.trackEvent({
      slug,
      event: ZukoTrackEventType.completionEvent,
    });
  }, 1000);
}

init();
</script>

<template>
  <TheDialog title="Verify Your Account" :hide-close-button="true" class="dialog-with-form magic-link-prompt">
    <p class="dialog-text">The email <strong>{{vm.email}}</strong> already existing in our database.</p>

    <p class="dialog-text">
      We have sent a <strong>Magic Link & 4 Digit Pin Code</strong>
      to <strong>{{vm.email}}</strong> <span v-if="vm.last4PhoneDigits"> and a mobile number ending ****<strong>{{vm.last4PhoneDigits}}</strong></span>.

    </p>
<p class="dialog-text">To continue, please click the link or enter the pin below.</p>
    <CSFormField>
      <CSInput type="text"
               placeholder="Enter the 4 Digit Pin Code"
               v-model="vm.authDigits"
               v-restrict-pattern="/^[0-9]+$/">
      </CSInput>
    </CSFormField>

    <p class="text-color_error" v-if="vm.errorMessage">{{vm.errorMessage}}</p>

    <div class="text-align_center Column Center">
      <ButtonMain @click="loginWithAuthDigits"
                  :processing="vm.loginInProgress"
                  :disabled="vm.loginInProgress">Login</ButtonMain>
    </div>
  </TheDialog>
</template>

<style lang="scss">

</style>
