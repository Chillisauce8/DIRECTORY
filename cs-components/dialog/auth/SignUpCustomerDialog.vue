<script setup lang="ts">
import SignUpCustomerForm from '~/components/auth/SignUpCustomerForm.vue';
import {useRoutingHelper} from '~/service/helpers/routing-helper.fabric';
import {useCurrentUser} from '~/service/helpers/user-common/current-user.factory';
import {useUserService} from '~/service/helpers/user-common/user-service.factory';
import {eventEmitterTake, eventEmitterTap} from '~/service/models/event-emitter-observable-helpers';
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';
import type {SignUpResult} from '~/service/helpers/auth/sign-up-strategy';


export type SignUpCustomerDialogData = void;


export type SignUpCustomerDialogResult = any;


const currentUser = useCurrentUser();
const userService = useUserService();
const routingHelper = useRoutingHelper();
const dialogInstance = useDialogInstance<SignUpCustomerDialogResult>();


const formRef = routingHelper.setFormRefQueryParamIfNeed();
const ipData = ref(null);

dialogInstance.onResultPublish()
  .pipe(
      eventEmitterTake(1),
      eventEmitterTap(() => {
        routingHelper.resetFormRefQueryParam();
      }),
  )
  .subscribe();


function onSignUpSuccess(result: SignUpResult) {
  dialogInstance.close(result.apiResult);
}

async function getUserIpData() {
  ipData.value = await userService.getIpInfo();
}

onMounted(() => getUserIpData)
</script>

<template>
  <TheDialog class="dialog-with-form"
             title="Sign up customer">
    <SignUpCustomerForm :ip-data="ipData" @action:signUpSuccess="onSignUpSuccess"></SignUpCustomerForm>
  </TheDialog>
</template>

<style lang="scss">
</style>
