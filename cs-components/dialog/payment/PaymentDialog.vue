<template>
  <dialog-with-form :title="title"
                    v-if="!inProgress"
                    :fullscreen="needFullScreen"
                    :class="{'card-stage': dialogStageIsCard()}">
    <template v-if="dialogStageIsSettings()">
      <payment-settings :config="paymentSettingsConfig"
                        :paymentType="paymentType"
                        @action:submit="onPaymentSettingsDone($event)">
      </payment-settings>
    </template>

    <template v-if="dialogStageIsCard()">
      <payment-page-secure-trading-invoker v-if="paymentParams"
                                           :successNotificationUrl="successNotificationUrl"
                                           :declineNotificationUrl="declineNotificationUrl"
                                           :successRedirectUrl="successRedirectUrl"
                                           :declineRedirectUrl="declineRedirectUrl"
                                           :paymentParams="paymentParams"
                                           :dialogInstance="dialogInstance">
      </payment-page-secure-trading-invoker>
    </template>

    <template v-if="dialogStageIsSuccess() || dialogStageIsFailure()">
      <payment-result :isSuccessMessage="dialogStageIsSuccess()"
                      :message="getResultMessage()"
                      @click="onButtonClick()">
      </payment-result>
    </template>

  </dialog-with-form>
</template>

<script lang="ts">


import { usePaymentService } from "~/services/helpers/payment/payment.service.factory";

export interface PaymentDialogData {

}


export interface PaymentDialogResult {

}

import paymentDialogMixin from './base-payment-dialog.mixin'
import type { ICustomerPaymentAmount } from "~/services/helpers/payment/payment.service";
import { useCsLodash } from "~/services/cs-lodash.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import { useUserService } from "~/services/helpers/user-common/user-service.factory";
import { useCurrentCustomer } from "~/services/helpers/user-common/current-customer-service.factory";
import { usePaymentDetailsService } from "~/services/helpers/payment/payment-details.service.factory";
import { useDataTemplateFabricService } from "~/services/helpers/data-templates/data-template-fabric.factory";
import { useDataTemplatesStore } from "~/store/dataTemplates";
import chilliLocalStorageService from "~/services/helpers/storage/chilli-local-storage.service";
import { useDateHelper } from "~/services/helpers/date-helper.factory";
import { useEventService } from "~/services/helpers/event/event.service.factory";
import { useCurrentUser } from "~/services/helpers/user-common/current-user.factory";
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';

export default {
  name: "PaymentDialog",
  mixins: [paymentDialogMixin],
  setup() {
    const dialogData = useDialogData<PaymentDialogData>();
    const dialogInstance = useDialogInstance<PaymentDialogResult>();

    return {
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

      dialogInstance,
    }
  },
  data() {
    return {
      paymentCardDetailsConfig: null,
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
    init() {
      this._dialogStage = 'settings';
      this.baseInit();

      this._fillPaymentCardDetailsConfig();
    },

    _fillPaymentCardDetailsConfig() {
      this.paymentCardDetailsConfig = {
        type: 'payment',
        paymentAmount: '',
        paymentInProgress: false
      };
    },

    dialogStageIsCard(): boolean {
      return this._dialogStage === 'card';
    },

    async onPaymentSettingsDone(result: {customPaymentAmounts?: Array<ICustomerPaymentAmount>, resultPaymentType?: string}) {
      const serverHost = (this.appConfig.IS_LOCAL ? this.appConfig.http.serverBaseURL : window.location.origin);
      this.successNotificationUrl = serverHost + '/api/payment/successNotification';
      this.declineNotificationUrl = serverHost + '/api/payment/declineNotification';

      const eventId = this.currentEvent.getId();
      const packageId = this.currentEvent.getCurrentPackageId();
      const section = this.currentEvent.getSection();

      const spaHost = window.location.origin;
      this.successRedirectUrl = spaHost + `/my-events?eventId=${eventId}&packageId=${packageId}&section=${section}&paymentResult=success`;
      this.declineRedirectUrl = spaHost + `/my-events?eventId=${eventId}&packageId=${packageId}&section=${section}&paymentResult=failure`;

      const currentCustomerId = this.currentCustomer.getId();
      this.successNotificationUrl += `?currentCustomerId=${currentCustomerId}`;
      this.declineNotificationUrl += `?currentCustomerId=${currentCustomerId}`;
      this.successRedirectUrl += `&customerId=${currentCustomerId}`;
      this.declineRedirectUrl += `&customerId=${currentCustomerId}`;

      this.paymentPeopleAmounts = result.customPaymentAmounts;

      this.paymentCardDetailsConfig.paymentAmount = this.paymentSettingsConfig.paymentAmount;

      if (result.resultPaymentType) {
        this.paymentType = result.resultPaymentType;
      }

      const amount = this.prepareFinalPaymentAmount();

      const paymentSettings = this._preparePaymentSettings();

      this.paymentSettingsConfig.disableControls = true;

      try {
        const response = await this.paymentService.saveAwaitingTransaction({
          eventId,
          packageId,
          amount,
          paymentSettings,
          userDetails: this.prepareUserDetails(),
        });

        this.paymentParams = response.data;
      } catch (error) {
        this._processError(error);
      }

      this.paymentSettingsConfig.disableControls = false;

      switch (this._dialogStage) {
        case 'settings':
          this._dialogStage = 'card';
          this.needFullScreen = true;
          this.stretchContent = true;
          break;
        default:
          break;
      }
    },

    onButtonClick() {
      this.dialogInstance.close();
    }
  }
};
</script>

<style lang="scss">
.card-stage {
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 !important;

    .form-element {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  }
}
</style>
