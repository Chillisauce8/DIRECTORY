<script setup lang="ts">
import {
  useEnquirySignInOrSignUpDialog, useEnquirySignUpDialog,
} from '~/services/helpers/auth/sign-in-or-sign-up-dialog.composable';
import {provideSignUpStrategy, useSignUpOrganiserStrategy} from '~/services/helpers/auth/sign-up-strategy';


const {
  vm,
  signUpFormTitle,
  setTabUrlQueryParam,
  onSignUpStarted,
  loginAfterRegistrationSuccess,
  onSignUpFailed,
} = useEnquirySignUpDialog();

onUpdated(() => {
  setTimeout(() => setTabUrlQueryParam());
});

provideSignUpStrategy(useSignUpOrganiserStrategy());
</script>

<template>
  <the-dialog :title="signUpFormTitle">

    <template #default>
      <div class="sign-in-or-sign-up-form">
        <EnquiryUserSignUpForm ref="signUpForm"
                               :form-description="vm.signUpFormDescription"
                               :ip-data="vm.ipData"
                               :form-tracking-params="vm.signUpFormTrackingParams"
                               @action:sign-up-started="onSignUpStarted"
                               @action:sign-up-success="loginAfterRegistrationSuccess"
                               @action:sign-up-failed="onSignUpFailed">
        </EnquiryUserSignUpForm>
      </div>
    </template>
  </the-dialog>
</template>

<style lang="scss">

</style>
