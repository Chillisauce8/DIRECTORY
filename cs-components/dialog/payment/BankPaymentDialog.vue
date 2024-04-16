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

import { useDialogData, useDialogInstance } from "~/services/dialog/core/dialog.composables";
import paymentDialogMixin from "~/components/dialog/payment/base-payment-dialog.mixin";
import type { ICustomerPaymentAmount } from "~/services/helpers/payment/payment.service";
import { usePaymentService } from "~/services/helpers/payment/payment.service.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import { useCurrentCustomer } from "~/services/helpers/user-common/current-customer-service.factory";
import { useGlobalElementsTemplateService } from "~/services/helpers/data-templates/global-elements-template.factory";
import { useCsLodash } from "~/services/cs-lodash.factory";
import { useEventService } from "~/services/helpers/event/event.service.factory";
import { useUserService } from "~/services/helpers/user-common/user-service.factory";
import { usePaymentDetailsService } from "~/services/helpers/payment/payment-details.service.factory";
import { useDataTemplateFabricService } from "~/services/helpers/data-templates/data-template-fabric.factory";
import { useDataTemplatesStore } from "~/store/dataTemplates";
import chilliLocalStorageService from "~/services/helpers/storage/chilli-local-storage.service";
import { useDateHelper } from "~/services/helpers/date-helper.factory";
import { useCustomerEvents } from "~/services/helpers/event/customer-events.service.factory";
import {useEventPackageBuilder} from '~/services/helpers/package-builder/package-builder.service.factory';

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

