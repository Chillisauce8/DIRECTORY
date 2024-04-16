<script setup lang="ts">
import {vZukoAttrsPreparer} from '~/utils/directives/zuko-attrs-preparer.directive';
import {vAutofocus} from '~/utils/directives/autofocus';
import {email, helpers, required} from '@vuelidate/validators';
import {useUserService} from '~/services/helpers/user-common/user-service.factory';
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useVuelidate} from '@vuelidate/core';
import type {EmailVerificationResult} from '~/services/helpers/user-common/user.service';
import type {BaseValidation, ValidationRule} from '@vuelidate/core';
import type {FormTrackingParams} from '~/services/helpers/forms-tracking/form-tracking-params';


export interface EmailFormValidationData {
  isEmailValid: boolean;
  isValidationOverridden?: boolean;
}


interface UserEmailProps {
  modelValue?: string;
  validation?: BaseValidation;
  validationRules?: ValidationRule[];
  placeholder?: string;
  trackingParams?: FormTrackingParams;
  autofocus?: boolean;
  verifyEmail?: boolean;
  disabled?: boolean;
  isEmailValid?: EmailFormValidationData;
  verifyOnInit?: boolean;
}

interface UserEmailEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'update:isEmailValid', value: EmailFormValidationData): void;
}


const userService = useUserService();
const currentUser = useCurrentUser();


const props = defineProps<UserEmailProps>();
const emits = defineEmits<UserEmailEmits>();

const showBypassValidationCheckbox = ref(false);
const customerEmailVerificationResult = ref(null);
const customerEmailValidationResult = reactive<any>({});


const validationRules = computed(() => {
  return {
    modelValue: props?.validationRules ?? {
      required,
      email,
      pattern: helpers.regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    },
  };
});

const v$ = useVuelidate(validationRules, props, {
  $registerAs: 'userEmail',
  $autoDirty: true,
  $externalResults: customerEmailValidationResult,
});


let previousEmailValue: string = null;
let emailWasInvalid: boolean = false;


function setCustomerEmailVerificationResult(isValid: boolean): void {
  customerEmailValidationResult.modelValue = isValid ? null : [{name: 'email'}];
}


async function onEmailInputBlur() {
  if (!props.verifyEmail) {
    return;
  }

  if (v$.value.modelValue.$invalid) {
    return;
  }

  const email = props.modelValue;

  if (email === previousEmailValue) {
    if (emailWasInvalid) {
      setCustomerEmailVerificationResult(true);
    }

    return;
  }

  previousEmailValue = email;

  const verifyResult = await userService.verifyCustomerEmail(email);
  handleEmailVerificationResult(verifyResult);
  v$.value.$touch();
}

function onSkipEmailValidationCheckboxChange() {
  customerEmailVerificationResult.value.isValidationOverridden = !customerEmailVerificationResult.value.isValidationOverridden;

  handleCurrentEmailValidationValue();

  emits('update:isEmailValid', customerEmailVerificationResult.value);
}

function handleCurrentEmailValidationValue() {
  let errors = customerEmailValidationResult.modelValue ?? [];

  if (customerEmailVerificationResult.value === null ||
      customerEmailVerificationResult.value.isEmailValid === true ||
      customerEmailVerificationResult.value.isValidationOverridden === true) {
    errors = errors.filter(i => i.name !== 'email');

    emailWasInvalid = false;
  } else {
    errors = [{name: 'email'}];

    emailWasInvalid = true;
  }

  customerEmailValidationResult.modelValue = errors;
}

function showSkipEmailValidationCheckboxIfNeeded(): void {
  if (!props.verifyEmail) {
    return;
  }

  if (!currentUser.isStaffOrHiddenStaff()) {
    return;
  }

  if (!customerEmailVerificationResult.value || customerEmailVerificationResult.value.isEmailValid !== false) {
    return;
  }

  showBypassValidationCheckbox.value = true;
}

function handleIsEmailValidChanges(value: EmailVerificationResult,
                                   oldValue?: EmailVerificationResult): void {
  if (!value || !oldValue) {
    return;
  }

  handleCurrentEmailValidationValue();
}

function handleEmailVerificationResult(verifyResult: {safety: boolean, freeEmail?: boolean}) {
  const isEmailValid = verifyResult ? verifyResult.safety : null;

  const isEmailValidResult = verifyResult === null ? null : {isEmailValid};

  customerEmailVerificationResult.value = isEmailValidResult;
  emits('update:isEmailValid', customerEmailVerificationResult.value);

  showSkipEmailValidationCheckboxIfNeeded();

  handleCurrentEmailValidationValue();
}


onMounted(() => {
  if (props?.verifyOnInit && props.verifyEmail) {
    v$.value.$validate();

    onEmailInputBlur();
  }
});

watch(() => props.isEmailValid, (v, o) => handleIsEmailValidChanges(v, o))
</script>

<template>
  <CSFormField>
    <CSInput :model-value="props.modelValue"
             type="email"
             name="email"
             autocapitalize="off"
             autocorrect="off"
             autocomplete="email"
             :disabled="props?.disabled"
             :placeholder="props.placeholder ?? 'Email'"
             :id="props?.trackingParams?.nativeElementId"
             v-zuko-attrs-preparer="props?.trackingParams?.zuko"
             v-autofocus="{disabled: props?.autofocus !== true}"
             @update:modelValue="emits('update:modelValue', $event)"
             @blur="onEmailInputBlur">
    </CSInput>

    <template #suffix>
      <CSError class="cs-form-text-error" :vuelidate-field="v$.modelValue"></CSError>
    </template>
  </CSFormField>

  <span v-if="showBypassValidationCheckbox" class="Flex Row Grow">
    <CSCheckbox @change="onSkipEmailValidationCheckboxChange"></CSCheckbox>
    <label class="skip-validation-label">Bypass email validation? - Note emails may bounce!</label>
  </span>
</template>

<style lang="scss">
.skip-validation-label {
  font-size: $fc-font-size;
}
</style>