<script setup lang="ts">
import {
  provideSignUpStrategy,
  useDefaultSignUpStrategy
} from '~/service/helpers/auth/sign-up-strategy';
import type {SignUpError} from '~/service/helpers/auth/sign-up-strategy';
import {email, helpers, required} from '@vuelidate/validators';
import type {AuthFormDescription} from '~/service/helpers/auth/sign-up-or-login-description-helper.service';
import type {SignUpFormValidationRules} from '~/components/auth/SignUpForm.vue';
import {useAuthErrorsHelperService} from '~/service/helpers/auth/auth-errors-helper.service.factory';
import type {AuthErrorWithLink} from '~/service/helpers/auth/auth-errors-helper.service';
import type {ValidationRule} from '@vuelidate/core';
import {useGlobalElementsTemplateService} from '~/service/helpers/data-templates/global-elements-template.factory';


interface UserSignUpFormProps {
  formDescription?: AuthFormDescription;
  defaultModelValue?: Record<string, any>;
  defaultValidationRules?: Record<string, ValidationRule[]>;
}


interface UserSignUpFormEmits {
  (e: 'action:signUpFailed', value: SignUpError): void;
}


interface UserSignUpFormVM {
  errorWithLink: AuthErrorWithLink;
}


const signInErrorsHelperService = useAuthErrorsHelperService();
const globalElementsTemplateService = useGlobalElementsTemplateService();

const signUpForm = ref(null);

const props = defineProps<UserSignUpFormProps>();
const emits = defineEmits<UserSignUpFormEmits>();

const vm = reactive<UserSignUpFormVM>({
  errorWithLink: null,
});

const phoneRequiredPattern = /^((\+){0,1}([0-9]){10,})$/;
const phoneNotRequiredPattern = /^((\+){0,1}([0-9]){10,})?$/;

const defaultModelValue = computed(() => {
  if (props?.defaultModelValue?.hasOwnProperty('email')) {
    return props.defaultModelValue;
  }

  const value: any = {
    ...props?.defaultModelValue,
    fullName: '',
    email: '',
    password: '',
  };

  if (props?.formDescription?.attendingField) {
    value.attending = 'Yes'
  }

  if (props?.formDescription?.phoneField) {
    value.phone = '';
  }

  return value;
});

const validationRules = computed(() => {
  const value: any = {
    fullName: {required, pattern: helpers.regex(/^(?:([A-Za-z\-\.]{2,}){1}( {1}[A-Za-z\-\.\']{2,} {0,1})+)$/)},
    ...props?.defaultValidationRules,
  }

  if (props?.formDescription?.phoneField) {
    const isRequired = props?.formDescription?.phoneField.required;

    value.phone = isRequired ? {required, pattern: helpers.regex(phoneRequiredPattern)} :
        {pattern: helpers.regex(phoneNotRequiredPattern)};
  }

  return value;
});

function getSignUpEmailExistError(email: string) {
  return globalElementsTemplateService.getMessageFromDictionaryVariables('signUpEmailExistError', {email});
}

function onSignUpFailed(signUpError: SignUpError) {
  const errorType = signInErrorsHelperService.getSignUpErrorType(signUpError.error);

  if (errorType === 'email') {
    vm.errorWithLink = {message: getSignUpEmailExistError(signUpError?.formModel?.email)};
  }

  if (!errorType && signUpError) {
    vm.errorWithLink = {message: signUpError.error === 'fetch failed' ? 'New user creating error' : signUpError.error};
  }

  emits('action:signUpFailed', signUpError);
}

defineExpose({
  formModel: signUpForm?.value?.formModel,
  validation: signUpForm?.value?.validation,
});
</script>

<template>
  <SignUpForm ref="signUpForm"
              :form-description="props.formDescription"
              :default-model-value="defaultModelValue"
              :default-validation-rules="validationRules"
              @action:sign-up-failed="onSignUpFailed">
    <template #default>
      <slot></slot>
    </template>

    <template v-if="vm.errorWithLink" #error-messages>
      <DialogError class="dialog-text"
                   v-if="vm.errorWithLink"
                   :link="vm.errorWithLink?.link"
                   :link-text="vm.errorWithLink?.linkText"
                   :message="vm.errorWithLink?.message"
                   @link:click="vm.errorWithLink?.onLinkClick()">
      </DialogError>
    </template>
  </SignUpForm>
</template>

<style lang="scss">

</style>
