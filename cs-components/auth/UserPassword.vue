<script setup lang="ts">
import type {FormTrackingParams} from '~/service/helpers/forms-tracking/form-tracking-params';
import {
  useUserPasswordFieldSettingsService
} from '~/service/helpers/user-common/user-password-field-settings.service.factory';
import {SettingsPasswordVisibilityOption} from '~/service/helpers/user-common/user-password-field-settings.service';
import {useVuelidate} from '@vuelidate/core';
import type {BaseValidation, ValidationRule} from '@vuelidate/core';
import {vZukoAttrsPreparer} from '~/utils/directives/zuko-attrs-preparer.directive';


interface UserPasswordProps {
  isNewPassword?: boolean;
  modelValue?: string;
  placeholder?: string;
  trackingParams?: FormTrackingParams;
  validationRules?: ValidationRule[];
  required?: boolean;
  check?: boolean;
  strengthData?: any;
  disabled?: boolean;
  autocomplete?: boolean;
}


interface UserPasswordEmits {
  (e: 'update:modelValue', value: string): void;
}


const userPasswordFieldSettingsService = useUserPasswordFieldSettingsService();


const props = withDefaults(defineProps<UserPasswordProps>(), {
  autocomplete: true,
  isNewPassword: false
});

const emits = defineEmits<UserPasswordEmits>();


const vm = reactive({
  modelValue: props?.modelValue ?? '',
  inProgress: true,
  hiddenPasswordMode: userPasswordFieldSettingsService.getVisibility(props?.strengthData) === SettingsPasswordVisibilityOption.hidden,
  customErrorMessages: userPasswordFieldSettingsService.getCustomValidationErrorMessages(props?.strengthData),
  trackingParams: props.trackingParams,
});

const validationRules = computed(() => {
  return {
    modelValue: props?.validationRules ?? userPasswordFieldSettingsService.getPasswordFieldValidators({
      required: props.required ?? false,
      checkStrength: props?.check ?? false,
    }, props?.strengthData)
  }
});

const v$ = useVuelidate(validationRules, vm, {
  $registerAs: 'userPassword',
  $autoDirty: true,
});


function triggerPasswordMode() {
  vm.hiddenPasswordMode = !vm.hiddenPasswordMode;
}


watch(() => props.modelValue, v => vm.modelValue = v);
</script>

<template>
  <CSFormField lass="password-field">
    <CSInput class="input"
             data-private
             :autocomplete="props.isNewPassword ? 'new-password' : 'password'"
             :id="props.trackingParams?.nativeElementId"
             v-zuko-attrs-preparer="props.trackingParams?.zuko"
             v-bind:type="vm.hiddenPasswordMode ? 'password' : 'text'"
             v-bind:autocomplete="props?.autocomplete ? null : 'off'"
             name="password"
             :disabled="props?.disabled"
             :placeholder="props.placeholder ?? 'Password'"
             :model-value="vm.modelValue"
             @update:modelValue="emits('update:modelValue', $event)">
    </CSInput>

    <button type="button"
            class="show-hide-button"
            :disabled="props?.disabled"
            @click="triggerPasswordMode">
      <LazySvgIcon :svg="vm.hiddenPasswordMode ? 'eye-close' : 'eye'"></LazySvgIcon>
    </button>

    <template #suffix>
      <CSError class="cs-form-text-error"
               :vuelidate-field="v$.modelValue"
               :custom-validation-message-map="vm.customErrorMessages">
      </CSError>
    </template>
  </CSFormField>
</template>

<style scoped lang="scss">

</style>
