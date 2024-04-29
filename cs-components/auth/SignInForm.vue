<script setup lang="ts">
import {vZukoAttrsPreparer} from '~/utils/directives/zuko-attrs-preparer.directive';
import type {FormTrackingParams} from '~/service/helpers/forms-tracking/form-tracking-params';
import type {ValidationRule} from '@vuelidate/core';
import {useVuelidate} from '@vuelidate/core';
import type {YesNoValue} from '~/utils/common.types';
import type {AuthFormDescription} from '~/service/helpers/auth/sign-up-or-login-description-helper.service';
import {email, minLength, required} from '@vuelidate/validators';
import {useLoginOrSignUpFormHelperService} from '~/service/helpers/auth/login-or-sign-up-form-helper.service.factory';
import {EventEmitterSubscription} from '~/service/models/event-emitter-observable';
import {eventEmitterTap} from '~/service/models/event-emitter-observable-helpers';
import {useUserService} from '~/service/helpers/user-common/user-service.factory';
import {useResetPasswordDialogService} from '~/service/dialog/reset-password-dialog.service';
import {DEFAULT_SIGN_IN_FORM} from '~/service/helpers/auth/auth-form.types';


export interface SignInFormTrackingParams {
  emailField?: FormTrackingParams;
  passwordField?: FormTrackingParams;
  submitButton?: FormTrackingParams;
  forgottenPassword?: FormTrackingParams;
}


export interface SignInFormModelValue {
  email: string;
  password?: string;
  attending?: YesNoValue;
}


export interface SignInFormValidationRules {
  email: ValidationRule[];
  password?: ValidationRule[];
  attending?: ValidationRule[];
}


interface SignInFormProps {
  formDescription?: AuthFormDescription;
  prePopulatedEmail?: string;
  possibleToDoOAuthGoogleLogin?: boolean;
  defaultModelValue?: SignInFormModelValue;
  defaultValidationRules?: SignInFormValidationRules;
  formTrackingParams?: SignInFormTrackingParams;
}



interface SignInFormSuccessResultObj {
  attending?: YesNoValue;
  formModel?: SignInFormModelValue;
}


export type SignInResult = SignInFormSuccessResultObj | boolean;


interface SignInFormEmits {
  (e: 'action:signInStarted'): void;
  (e: 'action:signInSuccess', value: SignInResult): void;
  (e: 'action:signInFailed', value: {errorMessage: string; email: string}): void;
}


interface SignInFormVM {
  inProgress: boolean;
  formModel: SignInFormModelValue;
  needUseOAuthGoogleTokenLogin: boolean;
}


const loginOrSignUpFormHelper = useLoginOrSignUpFormHelperService();
const userService = useUserService();
const resetPasswordDialogService = useResetPasswordDialogService();


const props = withDefaults(defineProps<SignInFormProps>(), {
  prePopulatedEmail: null,
  formDescription: DEFAULT_SIGN_IN_FORM,
  possibleToDoOAuthGoogleLogin: false,
});

const emits = defineEmits<SignInFormEmits>();

const vm = reactive<SignInFormVM>({
  inProgress: false,
  formModel: props?.defaultModelValue ?? {
    email: props?.prePopulatedEmail ?? null,
    password: null,
    attending: 'Yes'
  },
  needUseOAuthGoogleTokenLogin: false,
});

const validationRules = computed(() => {
  return props?.defaultValidationRules ?? {
    email: [required, email],
    password: [required, minLength(6)],
  }
});

const v$ = useVuelidate(validationRules, vm.formModel, {$autoDirty: true});

let formValuesChangesSubscription: EventEmitterSubscription;
let selectedTabChangesSubscription: EventEmitterSubscription;


async function doLogin(): Promise<void> {
  if (vm.needUseOAuthGoogleTokenLogin && !v$.value.email.$invalid) {
    await doLoginWithOAuthGoogleToken();

    return;
  }

  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  setInProgress();

  emits('action:signInStarted');

  return doLoginWithPassword();
}

async function doLoginWithOAuthGoogleToken(): Promise<void> {
  const email = vm?.formModel?.email.toLowerCase();

  return userService.loginUrlWithOAuthGoogleToken(email);
}

async function doLoginWithPassword(): Promise<void> {
  try {
    await userService.login(vm?.formModel?.email.toLowerCase(), vm.formModel.password);
  } catch (e) {
    resetInProgress();

    emits('action:signInFailed', {errorMessage: e?.message ?? e, email: vm.formModel.email});
    return;
  }

  resetInProgress();

  let res: SignInResult;

  if (props.formDescription?.attendingField) {
    res = {attending: vm.formModel?.attending};
  } else if (props.formDescription?.locationField || props.formDescription?.peopleField ||
      props.formDescription?.dateField || props.formDescription?.nightsField) {
    res = {formModel: vm.formModel}
  } else {
    res = true;
  }

  emits('action:signInSuccess', res);
}

function checkNeedUseOAuthGoogleTokenLogin(): Promise<boolean> {
  if (!props.possibleToDoOAuthGoogleLogin) {
    return Promise.resolve(false);
  }

  if (v$.value.email.$invalid) {
    return Promise.resolve(false);
  }

  const email = vm.formModel.email;

  if (!email) {
    return Promise.resolve(false);
  }

  return userService.needUseOAuthGoogleTokenLogin(email);
}

function showResetPasswordDialog() {
  resetPasswordDialogService.show({
    closeOnNavigation: false,
    data: {
      email: v$.value.email?.$invalid ? null : vm.formModel.email
    }
  });
}

function checkNeedUseOAuthGoogleTokenOnEmailFieldChange() {
  if (!props.possibleToDoOAuthGoogleLogin) {
    return;
  }

  watch(() => vm.formModel.email, () => {
    checkNeedUseOAuthGoogleTokenLogin().then(v => vm.needUseOAuthGoogleTokenLogin = v);
  });
}

function subscribeOnFormValuesChanges() {
  formValuesChangesSubscription = loginOrSignUpFormHelper.subscribeOnValueChanges(vm.formModel);
}

function subscribeOnSelectedTabChanges() {
  selectedTabChangesSubscription = loginOrSignUpFormHelper.onLoginOrSignUpTabSelected()
    .pipe(
      eventEmitterTap((tabIndex: number) => {
        if (tabIndex !== 1) {
          return;
        }

        loginOrSignUpFormHelper.patchFormValues(vm.formModel);
      }),
    )
    .subscribe();
}

function setInProgress() {
  vm.inProgress = true;
}

function resetInProgress() {
  vm.inProgress = false;
}


watch(() => props?.prePopulatedEmail, v => vm.formModel.email = v);

onMounted(() => {
  subscribeOnFormValuesChanges();
  subscribeOnSelectedTabChanges();
  checkNeedUseOAuthGoogleTokenOnEmailFieldChange();
});

onUnmounted(() => {
  if (formValuesChangesSubscription) {
    formValuesChangesSubscription.unsubscribe();
    formValuesChangesSubscription = null;
  }

  if (selectedTabChangesSubscription) {
    selectedTabChangesSubscription.unsubscribe();
    selectedTabChangesSubscription = null;
  }
});


defineExpose({formModel: vm.formModel, validation: v$});
</script>

<template>
  <AuthForm form-name="loginForm" @submit="doLogin">
    <div class="auth-form">
      <UserEmail v-model="vm.formModel.email"
                 :disabled="vm.inProgress"
                 :tracking-params="formTrackingParams?.emailField"
                 :autofocus="true"
                 :placeholder="props.formDescription.emailField.title"
                 :validation="v$.email">
      </UserEmail>

      <template v-if="!vm?.needUseOAuthGoogleTokenLogin">
        <UserPassword :tracking-params="formTrackingParams?.passwordField"
                      :disabled="vm.inProgress"
                      v-model="vm.formModel.password"
                      :placeholder="props.formDescription.passwordField.title"
                      :validation-rules="validationRules.password">
        </UserPassword>

        <AttendingSelect v-if="props.formDescription.attendingField"
                         v-show="props.formDescription.attendingField.show"
                         :disabled="vm.inProgress"
                         :default-value="props.formDescription.attendingField.defaultValue"
                         :model-value="vm.formModel.attending"
                         :placeholder="props.formDescription.attendingField.title">
        </AttendingSelect>

        <slot></slot>

        <slot name="error-messages"></slot>

        <ButtonMain type="submit"
                    :processing="vm.inProgress"
                    :id="formTrackingParams?.submitButton?.nativeElementId"
                    v-zuko-attrs-preparer="formTrackingParams?.submitButton?.zuko">Login</ButtonMain>

        <ButtonMain class="_3rd" @click="showResetPasswordDialog()">
          <a href="javascript:void(0)"
             :id="formTrackingParams?.forgottenPassword?.nativeElementId"
             :disabled="vm.inProgress"
             v-zuko-attrs-preparer="formTrackingParams?.forgottenPassword?.zuko">Forgot your Password?</a>
        </ButtonMain>
      </template>

      <ButtonMain v-if="vm.needUseOAuthGoogleTokenLogin"
                  :processing="vm.inProgress"

                  type="submit"
                  @click.native="doLoginWithOAuthGoogleToken">Sign In Via Google</ButtonMain>
    </div>
  </AuthForm>
</template>

<style lang="scss">
</style>
