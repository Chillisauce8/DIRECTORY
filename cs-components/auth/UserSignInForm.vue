<script setup lang="ts">
import type {AuthErrorWithLink} from '~/service/helpers/auth/auth-errors-helper.service';
import {useAuthErrorsHelperService} from '~/service/helpers/auth/auth-errors-helper.service.factory';
import {useResetPasswordDialogService} from '~/service/dialog/reset-password-dialog.service';
import {useGlobalElementsTemplateService} from '~/service/helpers/data-templates/global-elements-template.factory';


interface UserSignInFormProps {
  disallowOAuthGoogleLogin?: boolean;
  errorWithLink?: AuthErrorWithLink;
}


interface UserSignInFormEmits {
  (e: 'action:signInFailed', value: {errorMessage: string; email: string}): void;
}


const signInErrorsHelperService = useAuthErrorsHelperService();
const resetPasswordDialogService = useResetPasswordDialogService();
const globalElementsTemplateService = useGlobalElementsTemplateService();


const props = withDefaults(defineProps<UserSignInFormProps>(), {
  disallowOAuthGoogleLogin: false,
  errorWithLink: null,
});
const emits = defineEmits<UserSignInFormEmits>();

const errorWithLinkInternal = ref<AuthErrorWithLink>(null);

const errorWithLink = computed(() => {
  return props?.errorWithLink ?? errorWithLinkInternal?.value;
});


function onSignInFailed(context: any) {
  let errorType = signInErrorsHelperService.getSignInErrorType(context.errorMessage);

  if (errorType === 'email') {
    errorWithLinkInternal.value = {
      message: getLoginEmailError(context.email),
    };
  } else if (errorType === 'password') {
    errorWithLinkInternal.value = {
      message: getLoginPasswordError(),
      linkText: 'Click here to reset password.',
      onLinkClick: () => showResetPasswordDialog(context.email)
    };
  } else if (errorType === 'attempts') {
    errorWithLinkInternal.value = {
      message: getLoginAttemptsError()
    };
  } else if (errorType === 'googleAuthRequired') {
    errorWithLinkInternal.value = {
      message: getGoogleAuthRequiredError(),
    };
  } else if (!errorType && context?.errorMessage) {
    errorWithLinkInternal.value = {
      message: context.errorMessage === 'fetch failed' ? 'Login error' : context.errorMessage,
    };
  }

  emits('action:signInFailed', context);
}

function showResetPasswordDialog(email): void {
  resetPasswordDialogService.show({data: {email}});
}

function getLoginEmailError(email: string): string {
  return globalElementsTemplateService.getMessageFromDictionaryVariables('loginEmailError', {email});
}

function getLoginPasswordError(): string {
  return globalElementsTemplateService.getMessageFromDictionaryVariables('loginPasswordError');
}

function getLoginAttemptsError(): string {
  return globalElementsTemplateService.getMessageFromDictionaryVariables('loginAttemptsError');
}

function getGoogleAuthRequiredError() {
  return globalElementsTemplateService.getMessageFromDictionaryVariables('googleAuthRequired');
}
</script>

<template>
  <SignInForm @action:signInFailed="onSignInFailed">
    <template #default>
      <slot></slot>
    </template>

    <template #error-messages>
      <slot name="error-message">
        <DialogError class="dialog-text"
                     v-if="errorWithLink"
                     :link="errorWithLink.link"
                     :link-text="errorWithLink.linkText"
                     :message="errorWithLink.message"
                     @link:click="errorWithLink.onLinkClick()">
        </DialogError>
      </slot>
    </template>
  </SignInForm>
</template>

<style lang="scss">
</style>
