<script setup lang="ts">
import {vRestrictPattern} from '~/utils/directives/restrict-pattern.directive';
import {testName} from '~/utils/test-name-helper';
import {vZukoAttrsPreparer} from '~/utils/directives/zuko-attrs-preparer.directive';
import type {AuthFormDescription} from '~/service/helpers/auth/sign-up-or-login-description-helper.service';
import type {FormTrackingParams} from '~/service/helpers/forms-tracking/form-tracking-params';
import {useLoginOrSignUpFormHelperService} from '~/service/helpers/auth/login-or-sign-up-form-helper.service.factory';
import type {EmailFormValidationData} from '~/components/auth/UserEmail.vue';
import {eventEmitterTap} from '~/service/models/event-emitter-observable-helpers';
import {useUserService} from '~/service/helpers/user-common/user-service.factory';
import {EventEmitterSubscription} from '~/service/models/event-emitter-observable';
import type {ValidationRule} from '@vuelidate/core';
import {useVuelidate} from '@vuelidate/core';
import type {
  SignUpError,
  SignUpFormModelValue,
  SignUpResult,
} from '~/service/helpers/auth/sign-up-strategy';
import {helpers, required} from '@vuelidate/validators';
import {getDocumentSafe} from '~/service/helpers/browser/browser.helpers';
import type {ExternalResultMessageData} from '~/utils/cs-form-validation-helpers';
import {DEFAULT_SIGN_UP_FORM} from '~/service/helpers/auth/auth-form.types';
import {vAutofocus} from '~/utils/directives/autofocus';
import {useDefaultSignUpStrategy, useSignUpStrategy} from '~/service/helpers/auth/sign-up-strategy';


export interface SignUpFormTrackingParams {
  nameField?: FormTrackingParams;
  emailField?: FormTrackingParams;
  phoneField?: FormTrackingParams;
  passwordField?: FormTrackingParams;
  submitButton?: FormTrackingParams;
}


export interface SignUpFormValidationRules {
  [fieldName: string]: ValidationRule[];
  fullName: ValidationRule[];
  email: ValidationRule[];
  password: ValidationRule[];
}


interface SignUpFormProps {
  formDescription?: AuthFormDescription;
  defaultModelValue?: Partial<SignUpFormModelValue>;
  defaultValidationRules?: Partial<SignUpFormValidationRules>;
  formTrackingParams?: SignUpFormTrackingParams;
  ipData?: any;
}


interface SignUpFormEmits {
  (e: 'action:signUpStarted'): void;
  (e: 'action:signUpSuccess', value: SignUpResult): void;
  (e: 'action:signUpFailed', value: SignUpError): void;
}


interface SignUpFormVM {
  formModel: SignUpFormModelValue;
  inProgress: boolean;
  signUpError: any;
  emailValidationResult: EmailFormValidationData;
  verifyPhoneResults: {[index: string]: boolean};
  disabled: boolean;
}


const loginOrSignUpFormHelper = useLoginOrSignUpFormHelperService();
const userService = useUserService();
const signUpStrategy = useSignUpStrategy() ?? useDefaultSignUpStrategy();
const document = getDocumentSafe();
const currentInstance = getCurrentInstance();


const props = withDefaults(defineProps<SignUpFormProps>(), {
  formDescription: DEFAULT_SIGN_UP_FORM,
});

const emits = defineEmits<SignUpFormEmits>();

const vm = reactive<SignUpFormVM>({
  formModel: props?.defaultModelValue ?? {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    attending: 'Yes',
  },
  inProgress: false,
  signUpError: null,
  emailValidationResult: null,
  verifyPhoneResults: {},
  disabled: false,
});

const phoneEl = ref(null);

const externalValidationResults =
    reactive<Partial<Record<keyof SignUpFormModelValue | string, ExternalResultMessageData[]>>>({});

const validationRules = computed(() => {
  return props?.defaultValidationRules ?? {
    fullName: {required, pattern: helpers.regex(/^(?:([A-Za-z\-\.]{2,}){1}( {1}[A-Za-z\-\.\']{2,} {0,1})+)$/)},
  };
});

const showPasswordField = computed(() => {
  return vm.formModel.hasOwnProperty('password');
});

const v$ = useVuelidate(validationRules, vm.formModel, {
  $autoDirty: true,
  $externalResults: externalValidationResults as any,
});

let internationalPhoneNumber: string;
let phonePrevValue: string;
let checkPhonePromise: Promise<any>;
let phoneChangeSubscription: EventEmitterSubscription;
let formValuesChangesSubscription: EventEmitterSubscription;
let selectedTabChangesSubscription: EventEmitterSubscription;


function init() {
  initForm();
  subscribeOnFormValuesChanges();
  subscribeOnSelectedTabChanges();
}

function destroy() {
  unsubscribeFromPhoneChange();

  if (formValuesChangesSubscription) {
    formValuesChangesSubscription.unsubscribe();
    formValuesChangesSubscription = null;
  }

  if (selectedTabChangesSubscription) {
    selectedTabChangesSubscription.unsubscribe();
    selectedTabChangesSubscription = null;
  }
}


async function doRegister(): Promise<any> {
  const checkObservable = checkPhonePromise ? checkPhonePromise : Promise.resolve(true);

  await checkObservable;

  return register();
}

function getCurrentFormPhoneValue(): string {
  return vm.formModel.phone;
}

function telInputChangeDetectorFunc() {
  currentInstance.proxy.$forceUpdate();
}

async function onPhoneInputBlur() {
  checkPhonePromise = checkPhoneBeforeSave();

  await checkPhonePromise;

  checkPhonePromise = null;
}

function initForm() {
  loginOrSignUpFormHelper.patchFormValues(vm.formModel);
}

function subscribeOnFormValuesChanges() {
  formValuesChangesSubscription = loginOrSignUpFormHelper.subscribeOnValueChanges(vm.formModel);
}

function subscribeOnSelectedTabChanges() {
  selectedTabChangesSubscription = loginOrSignUpFormHelper.onLoginOrSignUpTabSelected()
    .pipe(
      eventEmitterTap((tabIndex: number) => {
        if (tabIndex !== 0) {
          return;
        }

        loginOrSignUpFormHelper.patchFormValues(vm.formModel);
      }),
    )
    .subscribe();
}

function unsubscribeFromPhoneChange() {
  if (phoneChangeSubscription) {
    phoneChangeSubscription.unsubscribe();
  }
}

function needToValidatePhone(): boolean {
  if (!props.ipData) {
    return false;
  }

  if (typeof props?.ipData?.countryCode !== 'string') {
    return false;
  }

  return ['gb', 'ru', ''].includes(props.ipData.countryCode.toLowerCase());
}

async function checkPhoneBeforeSave(): Promise<any> {
  if (!needToValidatePhone()) {
    return Promise.resolve(true);
  }

  const phone = getCurrentFormPhoneValue();

  if (!phone) {
    if (props.formDescription?.phoneField.required) {
      setPhoneError();
    }

    return Promise.resolve(true);
  }

  if (phone === phonePrevValue) {
    if (!vm.verifyPhoneResults[getCurrentFormPhoneValue()]) {
      setPhoneError();
    }

    return Promise.resolve(true);
  }

  if (v$?.value?.phone?.$invalid) {
    return Promise.resolve(true);
  }

  internationalPhoneNumber = null;

  return validatePhoneWithApi(phone);
}

async function validatePhoneWithApi(phone: string): Promise<any> {
  const result = await userService.validatePhone(phone, 10000);

  if (!result?.ok) {
    return;
  }

  if (!result?.data?.hasOwnProperty('valid')) {
    return;
  }

  if (result.data.valid) {
    internationalPhoneNumber = result?.data?.internationalNumber;
    vm.verifyPhoneResults[getCurrentFormPhoneValue()] = true;
  } else {
    setPhoneError();
  }

  phonePrevValue = phone;
}

function setPhoneError() {
  console.log('_setPhoneError');

  externalValidationResults.phone = [{name: 'phone', message: 'This field needs to be a valid phone number'}];
}

function setInProgress() {
  vm.inProgress = true;

  if (vm.disabled) {
    return;
  }

  unsubscribeFromPhoneChange();

  vm.disabled = true;
}

function resetInProgress() {
  vm.inProgress = false;

  if (!vm.disabled) {
    return;
  }

  unsubscribeFromPhoneChange();
  vm.disabled = false;
}

async function register() {
  if (vm.inProgress) {
    return;
  }

  vm.signUpError = null;

  v$.value.$touch();

  const fieldListShouldBeValid = [v$.value.userEmail];

  if (fieldListShouldBeValid.some(f => f.$invalid)) {
    resetInProgress();
    return;
  }

  if (showPasswordField.value && !vm.formModel.password) {
    resetInProgress();
    return;
  }

  if (!vm.formModel.fullName) {
    resetInProgress();
    return;
  }

  setInProgress();

  emits('action:signUpStarted');

  const fullName = userService.prepareFullName(vm.formModel.fullName);
  const {firstName, lastName} = userService.splitFullName(vm.formModel.fullName);

  try {
    const result = await signUpStrategy.process({
      ...vm?.formModel,
      fullName,
      firstName,
      lastName,
      email: vm.formModel.email,
      phone: internationalPhoneNumber ?? vm?.formModel?.phone ?? null,
      password: vm.formModel?.password ?? null,
      attending: vm.formModel?.attending ?? null,
      emailValidation: vm.emailValidationResult,
      verifiedPhone: vm.verifyPhoneResults?.[getCurrentFormPhoneValue()] ?? false,
    });

    emits('action:signUpSuccess', result);
  } catch (e) {
    vm.signUpError = e;

    emits('action:signUpFailed', e);
  }

  resetInProgress();
}


onMounted(() => init());

onUnmounted(() => destroy());

watch(() => props?.ipData, ipData => {
  if (!getCurrentFormPhoneValue()) {
    return;
  }

  if (!document) {
    return;
  }

  if (!props?.formTrackingParams?.phoneField?.nativeElementId) {
    return;
  }

  const phoneElement = document.getElementById(props?.formTrackingParams?.phoneField?.nativeElementId);

  if (!phoneElement) {
    return;
  }

  if (document.activeElement !== phoneElement) {
    onPhoneInputBlur();
  }
}, {deep: true});


defineExpose({formModel: vm.formModel, validation: v$});
</script>

<template>
  <AuthForm form-name="registrationForm"
            @submit="doRegister">
    <p class="dialog-text text-align_center margin_0_0_1"
       v-if="props?.formDescription?.formIntro?.title">{{ props.formDescription.formIntro.title }}</p>

    <CSFormField>
      <CSInput type="text"
               name="fullName"
               autocomplete="name"
               v-model="vm.formModel.fullName"
               v-restrict-pattern="/^[A-Za-z\-.' ]+$/"
               v-zuko-attrs-preparer="props?.formTrackingParams?.nameField?.zuko"
               :id="props?.formTrackingParams?.nameField?.nativeElementId"
               :placeholder="props?.formDescription?.nameField?.title"
               :disabled="vm.disabled">
      </CSInput>

      <template #suffix>
        <CSError class="cs-form-text-error"
                 :vuelidate-field="v$.fullName"
                 :custom-validation-message-map="{'pattern': 'Please add: `Firstname Surname`'}"></CSError>
      </template>
    </CSFormField>

    <UserEmail v-model="vm.formModel.email"
               v-model:is-email-valid="vm.emailValidationResult"
               :disabled="vm.disabled"
               :placeholder="props?.formDescription?.emailField?.title"
               :verify-email="false"
               :tracking-params="props?.formTrackingParams?.emailField">
    </UserEmail>

    <CSFormField v-if="props.formDescription.phoneField.display !== false">
      <CSInput ref="phoneEl"
               type="tel"
               name="phone"
               autocomplete="tel"
               v-model="vm.formModel.phone"
               :disabled="vm.disabled"
               :placeholder="props.formDescription.phoneField.title"
               :id="props?.formTrackingParams?.phoneField?.nativeElementId"
               v-zuko-attrs-preparer="props?.formTrackingParams?.phoneField?.zuko"
               v-restrict-pattern="/^((\+){0,1}([0-9]){0,})$/"
               @keydown.enter="onPhoneInputBlur()"
               @blur="onPhoneInputBlur()"
               @input=telInputChangeDetectorFunc()>
      </CSInput>

      <template #suffix>
        <CSError class="cs-form-text-error"
                 :vuelidate-field="v$?.phone"
                 :custom-validation-message-map="{'pattern': 'Please add a valid phone number'}"
        >
        </CSError>
      </template>
    </CSFormField>

    <UserPassword v-model="vm.formModel.password"
                  v-if="showPasswordField"
                  :is-new-password="true"
                  :placeholder="props?.formDescription?.passwordField.title"
                  :disabled="vm.disabled"
                  :required="props?.formDescription?.passwordField?.required ?? true"
                  :check:="props?.formDescription?.passwordField?.required ?? true"
                  :trackingParams="props.formTrackingParams?.passwordField">
    </UserPassword>

    <AttendingSelect v-if="props.formDescription.attendingField"
                     v-show="props.formDescription.attendingField.show"
                     v-model="vm.formModel.attending"
                     :disabled="vm.disabled"
                     :placeholder="props?.formDescription?.attendingField?.title"
                     :default-value="props?.formDescription?.attendingField?.defaultValue">
    </AttendingSelect>


    <slot></slot>

    <slot name="error-messages"></slot>

    <ButtonMain type="submit"
                v-zuko-attrs-preparer="props?.formTrackingParams?.submitButton?.zuko"
                :disabled="vm.disabled"
                :processing="vm.inProgress"
                :id="props?.formTrackingParams?.submitButton?.nativeElementId">
      {{ props.formDescription.buttonLabel.title }}
    </ButtonMain>

 <!--   <p class="sub-text text-align_center"
       v-if="props.formDescription.formFooter"
       v-markdown="{data: props?.formDescription?.formFooter?.title}"></p>
 -->
  </AuthForm>
</template>

<style scoped lang="scss">

</style>
