<script setup lang="ts">
import {useEnquiryFormHelperService} from '~/service/helpers/enquiry/enquiry-form-helper.service.factory';
import {useLoginOrSignUpFormHelperService} from '~/service/helpers/auth/login-or-sign-up-form-helper.service.factory';
import type {AuthFormDescription} from '~/service/helpers/auth/sign-up-or-login-description-helper.service';
import {useVuelidate} from '@vuelidate/core';
import type {IEnquiryFormData} from '~/service/helpers/enquiry/enquiry-form-helper.service';
import {EnquiryFormHelperService} from '~/service/helpers/enquiry/enquiry-form-helper.service';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {EventEmitterSubscription} from '~/service/models/event-emitter-observable';


export interface EnquiryFormDialogData {
  enquiryFormDescription?: AuthFormDescription;
}


export type EnquiryFormDialogResult = IEnquiryFormData;


interface EnquiryFormDialogVM {
  enquiryConfig: any;
  formDescription: AuthFormDescription;
  formTrackingParams: any;
  enquiryFormModelValue: any;
  inProgress: boolean;
}


const dialogData = useDialogData<EnquiryFormDialogData>();
const dialogInstance = useDialogInstance<EnquiryFormDialogResult>();

const enquiryFormHelper = useEnquiryFormHelperService();
const loginOrSignUpFormHelperService = useLoginOrSignUpFormHelperService();


const vm = reactive<EnquiryFormDialogVM>({
  enquiryConfig: null,
  formDescription: dialogData.enquiryFormDescription,
  formTrackingParams: EnquiryFormHelperService.getEnquiryFormTrackingParams('enquiry-form'),
  enquiryFormModelValue: {},
  inProgress: true,
});


const validationRules = enquiryFormHelper.prepareFormValidationRules(toRaw(vm.formDescription));
const validation = useVuelidate(validationRules, vm.enquiryFormModelValue, {$autoDirty: true});

let valueChangesSubscription: EventEmitterSubscription;

onMounted(async () => {
  Object.assign(vm.enquiryFormModelValue, enquiryFormHelper.prepareFormModelValue(toRaw(vm.formDescription)));
  loginOrSignUpFormHelperService.storeFormValues(vm.enquiryFormModelValue);
  valueChangesSubscription = loginOrSignUpFormHelperService.subscribeOnValueChanges(vm.enquiryFormModelValue);

  validation.value.$reset();

  vm.enquiryConfig = await enquiryFormHelper.loadDataForEnquiryForm(true);
  vm.inProgress = false;
});

onUnmounted(() => {
  if (valueChangesSubscription) {
    valueChangesSubscription.unsubscribe();

    valueChangesSubscription = null;
  }
});

function buttonClick() {
  if (validation.value.$invalid) {
    validation.value.$validate();

    nextTick(() => validation?.value?.$touch());

    return;
  }

  const data = enquiryFormHelper.prepareFormData(toRaw(vm.enquiryFormModelValue));

  dialogInstance.close(data);
}

function cancel() {
  const data = enquiryFormHelper.prepareFormData(toRaw(vm.enquiryFormModelValue));

  dialogInstance.cancel(data);
}
</script>

<template>
  <TheDialog v-if="!vm.inProgress"
             class="dialog-with-form"
             :title="vm.formDescription.tabLabel.title"
             @dialog:closeClick="cancel">
    <form name="enquiry-form" @submit.prevent="buttonClick">
      <div class="dialog-text text-align_center margin_0_0_1">{{ vm.formDescription.formIntro.title }}</div>

      <EnquiryForm :model-value="vm.enquiryFormModelValue"
                   :enquiry-config="vm.enquiryConfig"
                   :form-description="vm.formDescription"
                   :form-tracking-params="vm.formTrackingParams"
                   :validation="validation">
      </EnquiryForm>

      <div class="text-align_center Column Center">
        <ButtonMain :id="vm.formTrackingParams?.submitButton?.nativeElementId"
                    :processing="vm.inProgress"
                    type="submit"
                 >
          {{ vm.formDescription.buttonLabel.title }}
        </ButtonMain>
        <p class="sub-text text-align_center"
           v-if="vm.formDescription.formFooter"
           v-markdown="{data: vm.formDescription.formFooter.title}">
        </p>
      </div>
    </form>
  </TheDialog>
</template>

<style scoped lang="scss">

</style>
