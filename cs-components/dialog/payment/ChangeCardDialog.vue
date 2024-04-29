<template>
  <dialog-with-form :title="title" v-if="!inProgress" :fullscreen="needFullScreen"
                    :class="{'card-stage': dialogStageIsCard()}">
    <template v-if="dialogStageIsCard()">
      <payment-page-secure-trading-invoker v-if="paymentParams"
                                           :successNotificationUrl="successNotificationUrl"
                                           :declineNotificationUrl="declineNotificationUrl"
                                           :successRedirectUrl="successRedirectUrl"
                                           :declineRedirectUrl="declineRedirectUrl"
                                           :paymentParams="paymentParams">
      </payment-page-secure-trading-invoker>
    </template>

    <template v-if="dialogStageIsFailure()">
      <payment-result :isSuccessMessage="false"
                      :message="getResultMessage()"
                      @click="onButtonClick()">
      </payment-result>
    </template>

  </dialog-with-form>
</template>

<script lang="ts">


import { usePaymentService } from "~/service/helpers/payment/payment.service.factory";

export interface ChangeCardDialogData {

}


export interface ChangeCardDialogResult {

}

import paymentDialogMixin from './base-payment-dialog.mixin'
import { useCsLodash } from "~/service/cs-lodash.factory";
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { useUserService } from "~/service/helpers/user-common/user-service.factory";
import { useCurrentCustomer } from "~/service/helpers/user-common/current-customer-service.factory";
import { usePaymentDetailsService } from "~/service/helpers/payment/payment-details.service.factory";
import { useDataTemplateFabricService } from "~/service/helpers/data-templates/data-template-fabric.factory";
import { useDataTemplatesStore } from "~/store/dataTemplates";
import chilliLocalStorageService from "~/service/helpers/storage/chilli-local-storage.service";
import { useDateHelper } from "~/service/helpers/date-helper.factory";
import { useEventService } from "~/service/helpers/event/event.service.factory";
import { useCurrentUser } from "~/service/helpers/user-common/current-user.factory";
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';

export default {
  name: "ChangeCardDialog",
  mixins: [paymentDialogMixin],
  setup() {
    const dialogData = useDialogData<ChangeCardDialogData>();
    const dialogInstance = useDialogInstance<ChangeCardDialogResult>();

    return {
      dialogData,
      dialogInstance,
      router: useRouter(),
      csLodash: useCsLodash(),
      currentEvent: useCurrentEvent(),
      eventService: useEventService(),
      userService: useUserService(),
      currentUser: useCurrentUser(),
      currentCustomer: useCurrentCustomer(),
      paymentDetailsService: usePaymentDetailsService(),
      dataTemplateFabric: useDataTemplateFabricService(),
      dataTemplatesStore: useDataTemplatesStore(),
      localStorage: chilliLocalStorageService,
      dateHelper: useDateHelper(),

      appConfig: useAppConfig(),
      paymentService: usePaymentService(),
    }
  },
  data() {
    return {
      paymentRedirectFormData: null,
      paymentParams: null,
      successNotificationUrl: null,
      declineNotificationUrl: null,
      successRedirectUrl: null,
      declineRedirectUrl: null,
    }
  },
  beforeMount() {
    this.init();
  },
  methods: {
    dialogStageIsCard(): boolean {
      return this._dialogStage === 'card';
    },

    async init() {
      const serverHost = (this.appConfig.IS_LOCAL ? this.appConfig.http.serverBaseURL : window.location.origin);
      this.successNotificationUrl = serverHost + '/api/payment/event/changeCardFinish';
      this.declineNotificationUrl = serverHost + '/api/payment/event/changeCardFinishDecline';

      const eventId = this.currentEvent.getId();
      const section = this.currentEvent.getSection();
      const packageId = this.currentEvent.getCurrentPackageId();

      const spaHost = window.location.origin;
      this.successRedirectUrl = spaHost + `/my-events?eventId=${eventId}&packageId=${packageId}&section=${section}&paymentResult=changeCard`;
      this.declineRedirectUrl = spaHost + `/my-events?eventId=${eventId}&packageId=${packageId}&section=${section}&paymentResult=changeCardFailure`;

      const currentCustomerId = this.currentCustomer.getId();
      this.successNotificationUrl += `?currentCustomerId=${currentCustomerId}`;
      this.declineNotificationUrl += `?currentCustomerId=${currentCustomerId}`;
      this.successRedirectUrl += `&customerId=${currentCustomerId}`;
      this.declineRedirectUrl += `&customerId=${currentCustomerId}`;

      const customerId = this.currentCustomer.getId();
      const customerName = this.currentCustomer.getName();

      const params = {
        eventId,
        customerIdWhoPays: customerId,
        customerNameWhoPays: customerName,
        userDetails: this.prepareUserDetails(),
      }

      try {
        const response = await this.paymentService.startChangeCard(params);
        this.paymentParams = response.data;

        this._dialogStage = 'card';
        this.needFullScreen = true;
        this.inProgress = false;
      } catch (error) {
        console.log('startChangeCard error');
        this._processError(error);
      }
    },

    onButtonClick() {
      this.dialogInstance.close();
    }
  }
};
</script>

<style scoped>

</style>
