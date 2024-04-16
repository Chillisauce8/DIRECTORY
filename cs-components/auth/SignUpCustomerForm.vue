<script setup lang="ts">
import {provideSignUpStrategy, useSignUpCustomerStrategy} from '~/services/helpers/auth/sign-up-strategy';
import type {SignUpError} from '~/services/helpers/auth/sign-up-strategy';
import {email, helpers, required} from '@vuelidate/validators';
import SignUpForm from '~/components/auth/SignUpForm.vue';
import type {SignUpFormValidationRules} from '~/components/auth/SignUpForm.vue';
import type {AuthErrorWithLink} from '~/services/helpers/auth/auth-errors-helper.service';


interface UserSignUpFormEmits {
  (e: 'action:signUpFailed', value: SignUpError): void;
}


interface UserSignUpFormVM {
  errorWithLink: AuthErrorWithLink;
}

provideSignUpStrategy(useSignUpCustomerStrategy());

const emits = defineEmits<UserSignUpFormEmits>();

const vm = reactive<UserSignUpFormVM>({
  errorWithLink: null,
});

const defaultModelValue = computed(() => ({
  fullName: '',
  email: '',
  phone: '',
}));

const validationRules = computed(() => ({
  fullName: {required, pattern: helpers.regex(/^(?:([A-Za-z\-\.]{2,}){1}( {1,}[A-Za-z\-\.\']{2,} {0,})+)$/)},
}));


function onSignUpFailed(signUpError: SignUpError) {
  const {error} = signUpError;

  vm.errorWithLink = {message: typeof error === 'string' ? error : error?.error};

  emits('action:signUpFailed', signUpError);
}
</script>

<template>
  <SignUpForm ref="signUpForm"
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
