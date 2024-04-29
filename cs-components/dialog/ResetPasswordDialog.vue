<script setup lang="ts">
import {email, required} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {useUserService} from '~/service/helpers/user-common/user-service.factory';
import {useGlobalElementsTemplateService} from '~/service/helpers/data-templates/global-elements-template.factory';
import {useRoutingHelper} from '~/service/helpers/routing-helper.fabric';


export interface ResetPasswordDialogData {
  email?: string;
}


export type ResetPasswordDialogResult = void;


const dialogData = useDialogData<ResetPasswordDialogData>();
const dialogInstance = useDialogInstance<ResetPasswordDialogResult>();

const userService = useUserService();
const globalElementsTemplateService = useGlobalElementsTemplateService();
const router = useRouter();
const routingHelper = useRoutingHelper();


const vm = reactive({
  email: dialogData?.email ?? '',
  success: null,
  error: false,
  inProgress: false,
});

const validationRules = {
  email: [required, email],
}

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


function showLoginDialog() {
  dialogInstance.close();
}

async function doReset() {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  vm.success = false;
  vm.error = false;
  vm.inProgress = true;

  try {
    await userService.sendRecoveryPasswordMessage(vm.email.toLowerCase());

    vm.success = true;
    routingHelper.setQueryParam('password-reset', 'sent');
  } catch (e) {
    vm.success = false;
    vm.error = true;
  }

  vm.inProgress = false;
}

function getEmailError(email: string) {
  return globalElementsTemplateService.getMessageFromDictionaryVariables('resetPasswordEmailError', {email});
}

function getSuccessTitle() {
  return globalElementsTemplateService.getMessageFromDictionaryVariables('resetPasswordSuccessTitle');
}

function getSuccessMessage() {
  return globalElementsTemplateService.getMessageFromDictionaryVariables('resetPasswordSuccess');
}


onMounted(() => {
  routingHelper.setQueryParams([{
    name: 'password-reset',
    value: 'enter',
  }, {
    name: 'tab',
    value: undefined,
  }]);
})

onUnmounted(() => {
  routingHelper.setQueryParam('password-reset', undefined);
});
</script>

<template>
  <TheDialog class="dialog-with-form"
             title="Reset Password">
    <form v-if="!vm.success" name="reset-password-form" @submit.prevent="doReset">
      <CSFormField>
        <CSInput v-model="vm.email"
                 type="email"
                 name="email"
                 autocapitalize="off"
                 autocorrect="off"
                 placeholder="Email">
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.email"></CSError>
        </template>
      </CSFormField>

      <DialogError v-if="vm.error"
                   :message="getEmailError(vm.email)">
      </DialogError>
      <ButtonMain type="submit" :processing="vm.inProgress">Reset password</ButtonMain>

      <ButtonMain class="_3rd" @click="showLoginDialog()">
        <a href="javascript:void(0)">Back to Login</a>
      </ButtonMain>
    </form>
    <SuccessErrorMessage v-if="vm.success"
                         :isSuccessMessage="true"
                         :header="getSuccessTitle()"
                         :message="getSuccessMessage()"></SuccessErrorMessage>
  </TheDialog>
</template>

<style lang="scss">
</style>
