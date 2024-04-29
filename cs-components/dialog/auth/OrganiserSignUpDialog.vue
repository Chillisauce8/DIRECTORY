<script setup lang="ts">
import {useOrganiserSignUpDialog,} from '~/service/helpers/auth/sign-in-or-sign-up-dialog.composable';
import {
  provideSignUpStrategy,
  type SignUpResult,
  useSignUpOrganiserStrategy
} from '~/service/helpers/auth/sign-up-strategy';

const {
  vm,
  signUpFormTitle,
  setTabUrlQueryParam,
  onSignUpStarted,
  loginAfterRegistrationSuccess: superLoginAfterRegistrationSuccess,
  onSignUpFailed,
} = useOrganiserSignUpDialog();


onUpdated(() => {
  setTimeout(() => setTabUrlQueryParam());
});

async function loginAfterRegistrationSuccess(data: SignUpResult) {
  await superLoginAfterRegistrationSuccess(data);
}


provideSignUpStrategy(useSignUpOrganiserStrategy());
</script>

<template>
  <the-dialog :title="signUpFormTitle">

    <template #default>
      <div class="sign-in-or-sign-up-form">
        <UserSignUpForm :form-description="vm.signUpFormDescription"
                        :ip-data="vm.ipData"
                        :form-tracking-params="vm.signUpFormTrackingParams"
                        @action:sign-up-started="onSignUpStarted"
                        @action:sign-up-success="loginAfterRegistrationSuccess"
                        @action:sign-up-failed="onSignUpFailed">
        </UserSignUpForm>
      </div>
    </template>

  </the-dialog>
</template>

<style lang="scss">

</style>
