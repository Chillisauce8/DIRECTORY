<template>
  <form data-private name="payment-settings" @submit.prevent="submitForm">
    <template v-for="field in config.paymentFields">
      <PaymentField :config="field.config"
                    :disabled="config.disableControls"
                    @change="field.onChange">
      </PaymentField>
    </template>

    <section v-show="!config.disableControls">

      <template v-if="!totalPaymentAmountEditable">
        <section class="amounts-section">
          <h6 class="padding_-5_0">{{ config.moneyHeader }}</h6>
          <h1 class="price Pound padding_-5_0">{{ calculateTotalPaymentAmount() }}</h1>
        </section>
      </template>

      <div class="field" v-if="totalPaymentAmountEditable">
        <CSFormField>
          <CSInput type="number"
                   :placeholder="config.moneyHeader"
                   v-model="formData.totalAmount"
                   name="totalAmount"
                   :min="getMinAmountForTotalPayment()"
                   :max="getMaxAmountForTotalPayment()"
                   step="1"/>

          <template #suffix>
            <CSError class="cs-form-text-error" :vuelidate-field="v$.totalAmount"></CSError>
          </template>
        </CSFormField>
      </div>

      <template v-if="customersPaymentAmountEditable">
        <div class="edit-customers-payment-section gap-horizontal_15"
             v-for="paymentCustomerDetail in config.paymentCustomerDetails">

          <div class="field">
            <CSFormField>
              <LazyCSSelect v-model="formData[paymentCustomerDetail.id + CUSTOMER_TYPE_SUFFIX]"
                        :option-list="paymentCustomerDetail.possiblePaymentTypes"
                        :placeholder="paymentCustomerDetail.name"
                        :label-getter="v => prepareCustomerPaymentTypeView(v, paymentCustomerDetail.id)"
                        @update:modelValue="onPaymentMethodForCustomerValueChange($event, paymentCustomerDetail)">
              </LazyCSSelect>
            </CSFormField>
          </div>

          <div class="field">
            <CSFormField>
              <CSInput :disabled="paymentCustomerDetail.disabled"
                       type="number"
                       placeholder="Amount"
                       v-model="formData[paymentCustomerDetail.id + CUSTOMER_AMOUNT_SUFFIX]"
                       :name="paymentCustomerDetail.id + CUSTOMER_AMOUNT_SUFFIX"
                       :min="getMinAmountForCustomer(paymentCustomerDetail)"
                       :max="getMaxAmountForCustomer(paymentCustomerDetail)"
                       step="1"/>
              <template #suffix>
                <CSError class="cs-form-text-error" :vuelidate-field="v$[paymentCustomerDetail.id + CUSTOMER_AMOUNT_SUFFIX]"></CSError>
              </template>
            </CSFormField>
          </div>

        </div>
      </template>

      <Markdown class="h7 padding_-5_0" :data="config.message"></Markdown>
    </section>

    <button-main type="submit"
            :disabled="isButtonDisabled()">
      {{ config.buttonLabel }}
    </button-main>
  </form>
</template>

<script lang="ts">
import PaymentField from "~/components/payments/payment-field.vue";
import { useCurrentCustomer } from "~/services/helpers/user-common/current-customer-service.factory";
import type { ICustomerPaymentAmount } from "~/services/helpers/payment/payment.service";
import type { Validation } from '@vuelidate/core';
import { maxValue, minValue } from "@vuelidate/validators";
import {
  swpPatternValidator
} from "~/utils/cs-form-validators";
import { watch } from "vue";
import { useVuelidate } from "@vuelidate/core";
import {getValidationErrorMessage} from '~/utils/cs-form-validation-helpers';


export interface PaymentSettingsProps {
  config: {
    paymentAmount: number,
    minAmount?: number,
    paymentCustomerDetails: any,
    paymentFields: any,
    disableControls: any,
  },
  paymentType: 'balance'|'deposit'|'custom'
}

export interface PaymentSettingsSubmitValue {
  customPaymentAmounts: any,
  resultPaymentType: 'balance'|'deposit'|'custom'
}


export interface PaymentSettingsEmits {
  (e: 'action:submit', value: PaymentSettingsSubmitValue): void;
}

const FULLY_PAID_AMOUNT_TITLE = 'Fully Paid';
const CUSTOM_PAID_AMOUNT_TITLE = 'Custom';

export default {
  name: "payment-settings",
  components: { PaymentField, },
  props: ["config", "paymentType"],

  setup(props: PaymentSettingsProps, {emit: emits}: {emit: PaymentSettingsEmits}) {
    const currentCustomer = useCurrentCustomer();

    let totalPaymentAmountEditable = ref(false);
    let customersPaymentAmountEditable = ref(false);
    let totalPaymentAmount = undefined;

    let paymentTypesForCustomers = undefined;

    let CUSTOMER_TYPE_SUFFIX = '_method';
    let CUSTOMER_AMOUNT_SUFFIX = '_amount';

    let formData = reactive({
      totalAmount: undefined
    });

    let formValidationRules = ref({});

    let v$ = undefined;

    function getErrorMessage(validation: Validation): string | null {
      return getValidationErrorMessage(validation);
    }

    function prepareForm() {
      formValidationRules.value = {};

      Object.assign(formData, {});

      if (totalPaymentAmountEditable.value) {
        formData.totalAmount = props.config.paymentAmount;

        formValidationRules.value['totalAmount'] = {
          required: true,
          pattern: swpPatternValidator(/^[0-9]+$/),
          minValue: minValue(getMinAmountForTotalPayment()),
          maxValue: maxValue(getMaxAmountForTotalPayment()),
        };
      }

      if (customersPaymentAmountEditable.value) {
        props.config.paymentCustomerDetails.forEach(item => {
          const customerTypeKey = item.id + CUSTOMER_TYPE_SUFFIX;

          formData[customerTypeKey] = item.possiblePaymentTypes[0];

          formValidationRules.value[customerTypeKey] = {
            required: true,
          }

          const customerAmountKey = item.id + CUSTOMER_AMOUNT_SUFFIX;

          formData[customerAmountKey] = 0;

          formValidationRules.value[customerAmountKey] = _getCustomerAmountsValidator(item);
        });
      }
    }

    function init() {
      totalPaymentAmount = <number>props.config.paymentAmount || 0;

      totalPaymentAmountEditable.value = false;
      customersPaymentAmountEditable.value = false;

      paymentTypesForCustomers = {};

      totalPaymentAmountEditable.value = _isTotalPaymentAmountEditable();

      _unPatchPaymentFields();
      _patchPaymentFields();

      if (props.config.paymentCustomerDetails) {
        customersPaymentAmountEditable.value = props.config.paymentCustomerDetails.length > 1;
      }

      prepareForm();

      if (totalPaymentAmountEditable.value || customersPaymentAmountEditable.value) {
        _updateFormFieldsForCustomers();
      }
    }

    function _isTotalPaymentAmountEditable(): boolean {
      const isCustomPayment = props.paymentType === 'custom';

      return isCustomPayment &&
        (!props.config.paymentCustomerDetails || props.config.paymentCustomerDetails.length === 1) &&
        props.config.paymentAmount > 0;
    }

    function _unPatchPaymentFields() {
      _unPatchPaymentAmountToFullyPaid();
    }

    function _unPatchPaymentAmountToFullyPaid() {
      const paymentAmounts = props.config.paymentFields.find(
        item => item.name === 'paymentAmounts').config;

      if (!paymentAmounts) {
        return;
      }

      if (!paymentAmounts.selectOptions || !paymentAmounts.selectOptions.length) {
        return;
      }

      paymentAmounts.selectOptions.forEach(item => {
        if (item['title'] === FULLY_PAID_AMOUNT_TITLE) {
          item['title'] = CUSTOM_PAID_AMOUNT_TITLE;
        }
      });
    }

    function _patchPaymentFields() {
      if (_isOnFullyPaidCustomerSelected()) {
        _patchPaymentAmountToFullyPaid();
      }
    }

    function _isOnFullyPaidCustomerSelected(): boolean {
      return !props.config.paymentAmount &&
        (!props.config.paymentCustomerDetails || props.config.paymentCustomerDetails.length === 1);
    }

    function _getPaymentAmountsSettings() {
      return props.config.paymentFields.find(item => item.name === 'paymentAmounts');
    }

    function _patchPaymentAmountToFullyPaid() {
      const paymentAmountsSettings = _getPaymentAmountsSettings();

      if (!paymentAmountsSettings) {
        return;
      }

      const paymentAmountsConfig = paymentAmountsSettings.config;

      if (!paymentAmountsConfig.selectOptions || paymentAmountsConfig.selectOptions.length !== 1) {
        return;
      }

      if (paymentAmountsConfig.selectedOption !== 'custom') {
        return;
      }

      paymentAmountsConfig.selectOptions[0]['title'] = FULLY_PAID_AMOUNT_TITLE;
    }

    function calculateTotalPaymentAmount() {
      if (customersPaymentAmountEditable.value) {
        let result = 0;
        props.config.paymentCustomerDetails.forEach(item => {
          const field = formData[item.id + CUSTOMER_AMOUNT_SUFFIX];

          result += field;
        });

        return result;
      } else {
        return totalPaymentAmount;
      }
    }

    function onPaymentMethodForCustomerValueChange(value, paymentCustomerDetail: any) {
      _updateFormFieldForCustomer(value, paymentCustomerDetail);
    }

    function _updateFormFieldsForCustomers() {
      if (customersPaymentAmountEditable.value) {
        props.config.paymentCustomerDetails.forEach(item => {
          const paymentMethod = formData[item.id + CUSTOMER_TYPE_SUFFIX];
          _updateFormFieldForCustomer(paymentMethod, item);
        });
      }
    }

    function _updateFormFieldForCustomer(paymentMethod, paymentCustomerDetail: any) {
      const dataKey = paymentCustomerDetail.id + CUSTOMER_AMOUNT_SUFFIX;

      if (paymentMethod === 'deposit') {
        let depositAmount;
        if (paymentCustomerDetail.depositAmount === undefined) {
          depositAmount = paymentCustomerDetail.amount;
        } else {
          depositAmount = paymentCustomerDetail.depositAmount;
        }

        formData[dataKey] = depositAmount;
        paymentCustomerDetail.disabled = true;
      } else if (paymentMethod === 'balance') {
        formData[dataKey] = paymentCustomerDetail.amount;
        paymentCustomerDetail.disabled = true;
      } else if (paymentMethod === 'custom' && paymentCustomerDetail.amount === 0) {
        formData[dataKey] = paymentCustomerDetail.amount;
        paymentCustomerDetail.disabled = true;
      } else {

        formValidationRules.value[dataKey] =
          _getCustomerAmountsValidator(paymentCustomerDetail);

        formData[dataKey] = paymentCustomerDetail.amount;
        paymentCustomerDetail.disabled = false;
      }
    }

    function getMinAmountForCustomer(paymentCustomerDetail) {
      return paymentCustomerDetail.minAmount;
    }

    function getMaxAmountForCustomer(paymentCustomerDetail) {
      return paymentCustomerDetail.amount;
    }

    function getMinAmountForTotalPayment(): number {
      return props.config.minAmount || 1;
    }

    function getMaxAmountForTotalPayment(): number {
      return props.config.paymentAmount;
    }

    function isButtonDisabled(): boolean {
      if (props.config.disableControls) {
        return true;
      }

      const totalAmount = _getTotalAmount();

      return !totalAmount;
    }

    function _getTotalAmount(): number {
      const amountResult = _prepareCustomPaymentAmountsResult();

      if (amountResult) {
        return amountResult.reduce((res, item) => {
          if (item.amount) {
            res += item.amount;
          }

          return res;
        }, 0);
      } else if (totalPaymentAmount) {
        return totalPaymentAmount;
      }
    }

    function _prepareCustomPaymentAmountsResult(): Array<ICustomerPaymentAmount> {

      if (!totalPaymentAmountEditable.value && !customersPaymentAmountEditable.value) {
        return;
      }

      const result = [];

      if (totalPaymentAmountEditable.value) {
        let id;
        let name;

        if (props.config.paymentCustomerDetails) {
          id = props.config.paymentCustomerDetails[0].id;
          name = props.config.paymentCustomerDetails[0].name;
        } else {
          id = currentCustomer.getId();
          name = currentCustomer.getName();
        }

        const amount = formData['totalAmount'] || totalPaymentAmount;

        result.push({id, name, amount});
      } else {
        props.config.paymentCustomerDetails.forEach(item => {
          const amount = formData[item.id + CUSTOMER_AMOUNT_SUFFIX];
          result.push({id: item.id, name: item.name, amount});
        });
      }

      return result;
    }

    function _getCustomerAmountsValidator(paymentCustomerDetail) {
      return {
        required: true,
        pattern: swpPatternValidator(/^[0-9]+$/),
        minValue: minValue(getMinAmountForCustomer(paymentCustomerDetail)),
        maxValue: maxValue(getMaxAmountForCustomer(paymentCustomerDetail)),
      };
    }

    function prepareCustomerPaymentTypeView(value, customerId) {
      if (value === 'custom') {
        const amountField = formData[customerId + CUSTOMER_AMOUNT_SUFFIX];

        if (amountField.value === 0 && amountField.disabled) {
          return FULLY_PAID_AMOUNT_TITLE;
        }
      }

      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function submitForm() {
      v$.value.$touch();

      if (v$.value.$invalid) {
        return;
      }

      const customPaymentAmounts = _prepareCustomPaymentAmountsResult();

      const resultPaymentType = calculateResultPaymentsAmount();

      emits('action:submit', {customPaymentAmounts, resultPaymentType});
    }

    function calculateResultPaymentsAmount() {
      let resultPaymentAmount;

      if (!customersPaymentAmountEditable.value) {
        return;
      }

      props.config.paymentCustomerDetails.forEach(item => {
        const paymentAmountField = formData[item.id + CUSTOMER_TYPE_SUFFIX];
        const paymentAmount = paymentAmountField.value;

        if (!resultPaymentAmount) {
          resultPaymentAmount = paymentAmount;
        } else if (paymentAmount !== resultPaymentAmount) {
          resultPaymentAmount = 'custom';
        }
      });

      return resultPaymentAmount;
    }

    
    init();

    v$ = useVuelidate(formValidationRules, formData);


    watch(() => props.config, v => {
      init();
    });

    watch(() => props.paymentType, v => {
      init();
    });
    
    return {
      formData,
      v$,
      CUSTOMER_TYPE_SUFFIX,
      CUSTOMER_AMOUNT_SUFFIX,

      totalPaymentAmountEditable,
      customersPaymentAmountEditable,

      calculateTotalPaymentAmount,
      getMinAmountForTotalPayment,
      getMaxAmountForTotalPayment,
      getErrorMessage,
      onPaymentMethodForCustomerValueChange,
      prepareCustomerPaymentTypeView,
      getMinAmountForCustomer,
      getMaxAmountForCustomer,
      submitForm,
      isButtonDisabled
    }
  }
}
</script>

<style lang="scss" scoped>
  .amounts-section {
    text-align: center;
    padding: 20px;
  }

  .edit-customers-payment-section {
    display: flex;
    justify-content: space-between
  }

  .field {
    min-width: 150px;
    padding-top: 20px;
  }

  .cs-select-container {
    width: 100%;
    position: relative;

    .placeholder {
      position: absolute;
      font-size: 2rem;
      padding-left: 0.75rem;
      left: 0;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }

</style>
