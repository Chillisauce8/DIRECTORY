<script setup lang="ts">
import type {AuthFormDescription} from '~/service/helpers/auth/sign-up-or-login-description-helper.service';
import {useEnquiryFormHelperService} from '~/service/helpers/enquiry/enquiry-form-helper.service.factory';
import {EnquiryFormHelperService} from '~/service/helpers/enquiry/enquiry-form-helper.service';


interface EnquiryUserSignUpFormProps {
  formDescription: AuthFormDescription;
  enquiryConfig: any;
}


const enquiryFormHelperService = useEnquiryFormHelperService();

const enquiryTrackingParams = EnquiryFormHelperService.getEnquiryFormTrackingParams('enquiry-sign-up-form');

const userSignUpForm = ref(null);

const props = defineProps<EnquiryUserSignUpFormProps>();

const defaultModelValue = computed(() => {
  return enquiryFormHelperService.prepareFormModelValue(props?.formDescription)
});

const defaultValidationRules = computed(() => {
  return enquiryFormHelperService.prepareFormValidationRules(props?.formDescription);
});

defineExpose({userSignUpForm});
</script>

<template>
  <UserSignUpForm ref="userSignUpForm"
                  :form-description="props?.formDescription"
                  :default-model-value="defaultModelValue"
                  :default-validation-rules="defaultValidationRules">
    <template #default>
      <EnquiryForm :form-description="props.formDescription"
                   :form-tracking-params="enquiryTrackingParams"
                   :enquiry-config="props?.enquiryConfig"
                   :model-value="userSignUpForm?.modelValue"
                   :validation="userSignUpForm?.validation">
      </EnquiryForm>
    </template>
  </UserSignUpForm>
</template>

<style lang="scss">
</style>
