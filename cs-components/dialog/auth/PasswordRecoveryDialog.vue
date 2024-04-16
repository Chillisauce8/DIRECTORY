<script setup lang="ts">
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useUserService} from '~/services/helpers/user-common/user-service.factory';
import {useDialogInstance, useDialogData} from '~/services/dialog/core/dialog.composables';
import {
  useGlobalElementsTemplateService
} from '~/services/helpers/data-templates/global-elements-template.factory';
import type { ExternalResultMessageData } from '~/utils/cs-form-validation-helpers';


export type PasswordRecoveryDialogData = {
  token: string
};

export interface RecoveryPasswordFormModelValue {
  password: string;
}


interface RecoveryPasswordFormVM {
  formModel: RecoveryPasswordFormModelValue;
  inProgress: boolean;
  recoveryError: any;
  disabled: boolean;
}


const vm = reactive<RecoveryPasswordFormVM>({
  formModel: {
    password: '',
  },
  inProgress: false,
  recoveryError: null,
  disabled: false,
});

export type PasswordRecoveryDialogResult = any;


const externalValidationResults =
    reactive<Partial<Record<keyof RecoveryPasswordFormModelValue | string, ExternalResultMessageData[]>>>({});

const validationRules = computed(() => {
  return {
  };
});



const currentUser = useCurrentUser();
const userService = useUserService();
const globalElementsTemplateService = useGlobalElementsTemplateService();


const dialogData = useDialogData<PasswordRecoveryDialogData>();
const dialogInstance = useDialogInstance<PasswordRecoveryDialogResult>();



async function doPasswordRecovery(): Promise<any> {
  // v$.value.$touch();

  if (vm.inProgress) {
    return;
  }

  setInProgress();

  try {
    await onPasswordSet(vm.formModel.password, dialogData.token);
  } catch (e) {
    vm.recoveryError = e;
  }

  resetInProgress();
}


function setInProgress() {
  if (vm.disabled) {
    return;
  }

  vm.inProgress = true;
  vm.disabled = true;
}

function resetInProgress() {
  if (!vm.disabled) {
    return;
  }

  vm.inProgress = false;
  vm.disabled = false;
}



function onRecoveryPasswordSuccess() {
  dialogInstance.close(true);
}


async function onPasswordSet(password: string, token: string) {
  vm.recoveryError = null;

  try {
    const data = await userService.setNewPasswordWithToken(token, password);
    await onRegistrationSucceed(data.email, password);
    onRecoveryPasswordSuccess();
  } catch(err) {
    if (err === 'This password is invalid because it was already used recently, please try another') {
      vm.recoveryError = globalElementsTemplateService.getMessageFromDictionaryVariables('resetPasswordUsedBeforeError');
    } else {
      vm.recoveryError = `Password save failed: ${err}`;
    }
  }

  vm.inProgress = false;
}


async function onRegistrationSucceed(email: string, password: string) {
  return userService.login(email, password, true);
}

onMounted(() => {

});
</script>

<template>
  <TheDialog class="dialog-with-form"
             title="Set New Password">
    <AuthForm form-name="passwordRecoveryForm" @submit="doPasswordRecovery">

      <UserPassword v-model="vm.formModel.password"
                    v-autofocus
                    :is-new-password="true"
                    placeholder="Password"
                    :required="true"
                    :check:="true">
      </UserPassword>

      <slot name="error-messages"></slot>

      <ButtonMain type="submit"
                  :disabled="vm.disabled"
                  :processing="vm.inProgress">
        Save password
      </ButtonMain>
    </AuthForm>
  </TheDialog>
</template>

<style lang="scss">
</style>