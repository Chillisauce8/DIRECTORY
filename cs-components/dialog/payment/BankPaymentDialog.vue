<template>
  <dialog-with-form :title="title" v-if="!inProgress">
    <template v-if="dialogStageIsSettings()">
      <payment-settings :config="paymentSettingsConfig"
                        :paymentType="paymentType"
                        @action:submit="onPaymentSettingsDone($event)">
      </payment-settings>
    </template>

    <template v-if="dialogStageIsSuccess() || dialogStageIsFailure()">
      <payment-result :isSuccessMessage="dialogStageIsSuccess()"
                      :message="getResultMessage()"
                      @click="closeDialog()">
      </payment-result>
    </template>
  </dialog-with-form>
</template>

<script lang="ts">

import { useDialogData, useDialogInstance } from "~/service/dialog/core/dialog.composables";
import paymentDialogMixin from "~/components/dialog/payment/base-payment-dialog.mixin";
import type { ICustomerPaymentAmount } from "~/service/helpers/payment/payment.service";
import { usePaymentService } from "~/service/helpers/payment/payment.service.factory";
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { useCurrentCustomer } from "~/service/helpers/user-common/current-customer-service.factory";
import { useGlobalElementsTemplateService } from "~/service/helpers/data-templates/global-elements-template.factory";
import { useCsLodash } from "~/service/cs-lodash.factory";
import { useEventService } from "~/service/helpers/event/event.service.factory";
import { useUserService } from "~/service/helpers/user-common/user-service.factory";
import { usePaymentDetailsService } from "~/service/helpers/payment/payment-details.service.factory";
import { useDataTemplateFabricService } from "~/service/helpers/data-templates/data-template-fabric.factory";
import { useDataTemplatesStore } from "~/store/dataTemplates";
import chilliLocalStorageService from "~/service/helpers/storage/chilli-local-storage.service";
import { useDateHelper } from "~/service/helpers/date-helper.factory";
import { useCustomerEvents } from "~/service/helpers/event/customer-events.service.factory";
import {useEventPackageBuilder} from '~/service/helpers/package-builder/package-builder.service.factory';

export interface BankPaymentDialogData {

}


export interface BankPaymentDialogResult {

}


export default {
  name: 'BankPaymentDialog',
  mixins: [paymentDialogMixin],
  setup() {
    const dialogData = useDialogData<BankPaymentDialogData>();
    const dialogInstance = useDialogInstance<BankPaymentDialogResult>();

    return {
      router: useRouter(),
      csLodash: useCsLodash(),
      eventService: useEventService(),
      userService: useUserService(),
      paymentDetailsService: usePaymentDetailsService(),
      dataTemplateFabric: useDataTemplateFabricService(),
      dataTemplatesStore: useDataTemplatesStore(),
      localStorage: chilliLocalStorageService,
      dateHelper: useDateHelper(),

      currentEvent: useCurrentEvent(),
      customerEvents: useCustomerEvents(),
      currentCustomer: useCurrentCustomer(),
      paymentService: usePaymentService(),
      globalElementsTemplateService: useGlobalElementsTemplateService(),
      packageBuilder: useEventPackageBuilder(),
      dialogInstance,
    }
  },
  data() {
    return {
      paymentCardDetailsConfig: null,
      paymentRedirectFormData: null,
      paymentParams: null,
    }
  },
  beforeMount() {
    this.init();
  },
  methods: {
    init() {
      this._dialogStage = 'settings';
      this.baseInit();
    },

    getStageSettingTitle() {
      return 'Add Bank Payment';
    },

    _initCommonErrorMessage() {
      this._commonErrorMessage = 'Operation failed, please try again';
    },

    onPaymentSettingsDone(result: {customPaymentAmounts?: Array<ICustomerPaymentAmount>,
      resultPaymentType?: string}) {
      this.paymentPeopleAmounts = result.customPaymentAmounts;

      if (result.resultPaymentType) {
        this.paymentType = result.resultPaymentType;
      }

      this.doPayment();
    },

    async doPayment() {
      const paymentParams = {
        eventId: this.currentEvent.getId(),
        packageId: this.currentEvent.getCurrentPackage().getId(),
        amount: this.prepareFinalPaymentAmount(),
        paymentSettings: this._preparePaymentSettings(),
        customerIdWhoPays: this.currentCustomer.getId(),
        customerNameWhoPays: this.currentCustomer.getName(),
      };

      try {
        const response = await this.paymentService.doBankPayment(paymentParams)

        this.currentEvent.reload();

        const subscription = this.currentEvent.afterCurrentEventLoaded(() => {
          subscription.unsubscribe();
          this.customerEvents.reload();
          this.packageBuilder.loadCurrent();

          const message = this.globalElementsTemplateService
            .getMessageFromDictionaryVariables('addBankPaymentSuccess');
          this.showPaymentSuccessDialog(message);
        });
      } catch(error) {
        console.error(error);
        const message = this.globalElementsTemplateService
          .getMessageFromDictionaryVariables('addBankPaymentError');
        this.showPaymentFailureDialog(message);
      }
    },

    getButtonLabel(): string {
      return 'ADD PAYMENT';
    },

    closeDialog() {
      this.dialogInstance.close({});
    }
  }
};
</script>

