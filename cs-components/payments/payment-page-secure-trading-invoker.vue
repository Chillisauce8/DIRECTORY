<template>
  <form data-private ref="form" method="POST" class="form-element" v-show="false"
        target="payment-iframe"
        action="https://payments.securetrading.net/process/payments/details">
    <input type="hidden" name="sitereference" :value="siteReference">
    <input type="hidden" name="stprofile" value="default">
    <input type="hidden" name="currencyiso3a" value="GBP">
    <input type="hidden" name="mainamount" :value="preparedAmount">
    <input type="hidden" name="version" value="2">
    <input type="hidden" name="stdefaultprofile" value="st_paymentcardonly">
    <input type="hidden" name="orderreference" :value="paymentParams.vendorTxCode">
    <input type="hidden" name="billingfirstname" :value="billingFirstName">
    <input type="hidden" name="billinglastname" :value="billingLastName">
    <input type="hidden" name="customerfirstname" :value="customerFirstName">
    <input type="hidden" name="customerlastname" :value="customerLastName">
    <input type="hidden" name="accounttypedescription" :value="accountType">
    <input v-if="allowTheedQuery" type="hidden" name="requesttypedescriptions" value="THREEDQUERY">
    <input type="hidden" name="requesttypedescriptions" value="AUTH">
    <!--Enables rule that redirects the customer following a successful transaction-->
    <input type="hidden" name="ruleidentifier" value="STR-6">
    <input type="hidden" name="successfulurlredirect" :value="successRedirectUrl">
    <input type="hidden" name="ruleidentifier" value="STR-7">
    <input type="hidden" name="declinedurlredirect" :value="declineRedirectUrl">
    <!--This enables the successful URL notification rule-->
    <input type=hidden name="ruleidentifier" value="STR-8">
    <input type=hidden name="successfulurlnotification" :value="successNotificationUrl">
    <!--This enables the declined URL notification rule-->
    <input type=hidden name="ruleidentifier" value="STR-9">
    <input type=hidden name="declinedurlnotification" :value="declineNotificationUrl">
    <input type="hidden" name="sitesecurity" :value="paymentParams.siteSecurity">
    <input type="hidden" name="sitesecuritytimestamp" :value="paymentParams.siteSecurityTimestamp">
    <!--    <input type="submit" value="Pay">-->
  </form>

  <iframe class="Column Flex" name="payment-iframe" ref="iframe"></iframe>
</template>
<script>
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { useCurrentUser } from "~/service/helpers/user-common/current-user.factory";


export default {
  props: ['successNotificationUrl', 'declineNotificationUrl',
    'successRedirectUrl', 'declineRedirectUrl', 'paymentParams', 'dialogInstance'],
  setup() {
    return {
      appConfig: useAppConfig(),
      currentEvent: useCurrentEvent(),
      currentUser: useCurrentUser(),
      router: useRouter(),
    }
  },
  data() {
    let accountType;
    let allowTheedQuery;

    const SecureTradingAccountType = 'ECOM';
    const SecureTradingAccountTypeForStaffs = 'MOTO';

    if (this.currentUser.isStaffOrHiddenStaff()) {
      accountType = SecureTradingAccountTypeForStaffs;
      allowTheedQuery = false;
    } else {
      accountType = SecureTradingAccountType;
      allowTheedQuery = true;
    }

    let billingFirstName = this.paymentParams.paymentDetails.firstName.substr(0, 20);
    let billingLastName = this.paymentParams.paymentDetails.lastName.substr(0, 20);
    let customerFirstName = this.paymentParams.paymentDetails.organiserFirstName.substr(0, 20);
    let customerLastName = this.paymentParams.paymentDetails.organiserLastName.substr(0, 20);

    let preparedAmount = (this.paymentParams.paymentDetails.amount).toFixed(2);

    return {
      SecureTradingAccountType,
      SecureTradingAccountTypeForStaffs,

      siteReference: this.appConfig.ST_SITE_REFERENCE,

      accountType,
      preparedAmount,
      allowTheedQuery,

      billingFirstName,
      billingLastName,
      customerFirstName,
      customerLastName,
    }
  },
  mounted() {
    this.$refs.form.submit();

    this.$refs.iframe.onload = async () => {
      try {
        const frameLocation = this.$refs.iframe?.contentWindow?.location?.href;

        if (frameLocation) {
          await this.dialogInstance?.close();

          setTimeout(() => {
            const redirectPath = this.$refs.iframe.contentWindow?.location.pathname +
                this.$refs.iframe.contentWindow?.location.search;
            this.router.push(redirectPath);
          }, 300);
        }
      } catch {
        // catch cross-origin error when trying to read iframe location
      }
    };
  }
};
</script>

<style scoped>

</style>
