<script setup lang="ts">
import {
  useEnquirySignInOrSignUpDialog,
} from '~/service/helpers/auth/sign-in-or-sign-up-dialog.composable';


const {
  vm,
  formOptions,
  selectedTabChange,
  setTabUrlQueryParam,
  isSignUpFormActive,
  onSignUpStarted,
  loginAfterRegistrationSuccess,
  onSignUpFailed,
  onSignInStarted,
  onSignInSuccess,
  onSignInFailed,
  signUpFormModel,
} = useEnquirySignInOrSignUpDialog();

onUpdated(() => {
  setTimeout(() => setTabUrlQueryParam());
});
</script>

<template>
  <the-dialog>
    <template v-slot:header-content>
      <ButtonToggle :itemList="formOptions"
                    :model-value="vm.activeForm"
                    @update:modelValue="selectedTabChange">
      </ButtonToggle>
    </template>

    <template #default>
      <div class="sign-in-or-sign-up-form">
        <EnquiryUserSignUpForm ref="signUpForm"
                               v-show="isSignUpFormActive"
                               :form-description="vm.signUpFormDescription"
                               :ip-data="vm.ipData"
                               :form-tracking-params="vm.signUpFormTrackingParams"
                               @action:sign-up-started="onSignUpStarted"
                               @action:sign-up-success="loginAfterRegistrationSuccess"
                               @action:sign-up-failed="onSignUpFailed">
        </EnquiryUserSignUpForm>

        <EnquiryUserSignInForm v-show="!isSignUpFormActive"
                               :disallow-o-auth-google-login="true"
                               :enquiry-sign-up-form-model="signUpFormModel"
                               :form-description="vm.signInFormDescription"
                               :form-tracking-params="vm.signInFormTrackingParams"
                               :pre-populated-email="vm.prePopulatedLoginEmail"
                               @action:sign-in-started="onSignInStarted"
                               @action:sign-in-success="onSignInSuccess"
                               @action:sign-in-failed="onSignInFailed">
        </EnquiryUserSignInForm>
      </div>
    </template>
  </the-dialog>
</template>

<style lang="scss">

</style>
