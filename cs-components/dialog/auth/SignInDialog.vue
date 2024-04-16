<template>
  <the-dialog :title="vm.title">
    <UserSignInForm :possibleToDoOAuthGoogleLogin="true"
                    @action:signInSuccess="onSignInSuccess">
    </UserSignInForm>
  </the-dialog>
</template>

<script setup lang="ts">
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';
import {eventEmitterTake, eventEmitterTap} from '~/services/models/event-emitter-observable-helpers';
import {useRoutingHelper} from '~/services/helpers/routing-helper.fabric';
import type {AuthErrorWithLink} from '~/services/helpers/auth/auth-errors-helper.service';


export interface SignInDialogData {
  email?: string;
}


interface SignInFormVM {
  title: string,
  errorWithLink?: AuthErrorWithLink;
}


const dialogData = useDialogData<SignInDialogData>();
const dialogInstance = useDialogInstance<never>();
const routingHelper = useRoutingHelper();


const vm = reactive<SignInFormVM>({
  title: 'Sign In',
});


function onSignInSuccess() {
  dialogInstance.close();
}


dialogInstance.onResultPublish()
  .pipe(
    eventEmitterTake(1),
    eventEmitterTap(() => {
      routingHelper.resetFormRefQueryParam();
    }),
  )
  .subscribe();
</script>

<style lang="scss">
</style>
