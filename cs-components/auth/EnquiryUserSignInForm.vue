<script setup lang="ts">
import type {EnquiryFormModelValue} from '~/services/helpers/enquiry/enquiry-form-helper.service';
import {EnquiryFormHelperService} from '~/services/helpers/enquiry/enquiry-form-helper.service';
import type {SignInFormModelValue} from '~/components/auth/SignInForm.vue';
import {useEnquiryFormHelperService} from '~/services/helpers/enquiry/enquiry-form-helper.service.factory';
import type {AuthFormDescription} from '~/services/helpers/auth/sign-up-or-login-description-helper.service';
import {email, minLength, required} from '@vuelidate/validators';


interface EnquiryUserSignInFormProps {
  enquirySignUpFormModel: EnquiryFormModelValue;
  formDescription: AuthFormDescription;
  prePopulatedEmail?: string;
  enquiryConfig?: any;
}


interface EnquirySignInFormModelValue extends SignInFormModelValue, EnquiryFormModelValue {}


const enquiryFormHelperService = useEnquiryFormHelperService();


const props = defineProps<EnquiryUserSignInFormProps>();

const signInFormComponent = ref(null);
const enquiryTrackingParams = EnquiryFormHelperService.getEnquiryFormTrackingParams('enquiry-login-form');

const defaultFormModelValue = {
  email: props?.prePopulatedEmail ?? null,
  password: null,
  ...enquiryFormHelperService.prepareFormModelValue(props.formDescription),
};

const defaultFormValidation = {
  email: [required, email],
  password: [required, minLength(6)],
  ...enquiryFormHelperService.prepareFormValidationRules(props.formDescription),
}


onBeforeUpdate(() => {
  const enquirySignUpFormModel = props.enquirySignUpFormModel;
  const signInFormModel = signInFormComponent.value.formModel;

  if (!enquirySignUpFormModel) {
    return;
  }

  if (!signInFormModel) {
    return;
  }

  syncValueBetweenSignInFormModelAndSignUpFromModel(signInFormModel, enquirySignUpFormModel, 'locationField');
  syncValueBetweenSignInFormModelAndSignUpFromModel(signInFormModel, enquirySignUpFormModel, 'peopleField');
  syncValueBetweenSignInFormModelAndSignUpFromModel(signInFormModel, enquirySignUpFormModel, 'dateField');
  syncValueBetweenSignInFormModelAndSignUpFromModel(signInFormModel, enquirySignUpFormModel, 'nightsField');
  syncValueBetweenSignInFormModelAndSignUpFromModel(signInFormModel, enquirySignUpFormModel, 'notesField');
});


function syncValueBetweenSignInFormModelAndSignUpFromModel(dest: EnquirySignInFormModelValue,
                                                           src: EnquiryFormModelValue,
                                                           field: keyof EnquiryFormModelValue): void {
  if (!src.hasOwnProperty(field)) {
    return;
  }

  if (!dest.hasOwnProperty(field)) {
    return;
  }

  dest[field as string] = src[field];
}
</script>

<template>
  <UserSignInForm ref="signInFormComponent"
              :default-model-value="defaultFormModelValue"
              :default-validation-rules="defaultFormValidation"
              :form-tracking-params="enquiryTrackingParams"
              :pre-populated-email="prePopulatedEmail"
              :form-description="props.formDescription">
    <template #default>
      <EnquiryForm :form-description="props?.formDescription"
                   :enquiry-config="props?.enquiryConfig"
                   :form-tracking-params="enquiryTrackingParams"
                   :model-value="signInFormComponent?.modelValue"
                   :validation="signInFormComponent?.validation">
      </EnquiryForm>
      <slot></slot>
    </template>

    <template #error-messages>
      <slot name="error-message"></slot>
    </template>
  </UserSignInForm>
</template>

<style lang="scss">

</style>