<template>
  <TheDialog :title="dataState.title"
             :form-name="dataState.formName"
             class="dialog-with-form">

    <user-form :user="dataState.user"
               v-on:action:submit="onSubmit"
               v-on:action:sign-out="onSignOut">
    </user-form>
  </TheDialog>
</template>

<script lang="ts">
import {reactive} from 'vue';
import type {UserFormUserData} from '~/components/auth/UserForm.vue';
import {useUserService} from '~/service/helpers/user-common/user-service.factory';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {useCurrentUser} from '~/service/helpers/user-common/current-user.factory';
import type {BaseUserDbNode} from '~/helpers/user-data-helpers';


export interface UserDialogData {
  user: BaseUserDbNode
}


export interface UserDialogResult {
  updatedUser: BaseUserDbNode;
}


interface UserDialogDataState {
  user: BaseUserDbNode;
  formName: string;
  title: string;
  updateError: Error;
  isCustomerUser: boolean;
}


export default {
  setup() {
    const dialogData = useDialogData<UserDialogData>();
    const dialogInstance = useDialogInstance<UserDialogResult>();

    const userService = useUserService();
    const currentUser = useCurrentUser();


    const dataState = reactive<UserDialogDataState>({
      user: {...dialogData.user},
      title: 'User',
      formName: 'user-form',
      updateError: null,
      isCustomerUser: currentUser?.isCustomer() && !currentUser?.isHiddenStaff(),
    });


    async function onSubmit(userData: UserFormUserData) {
      try {
        const updatedUser = await userService.updateAccount(userData);

        dialogInstance.close({updatedUser});
      } catch (e) {
        dataState.updateError = e;
      }
    }

    async function onSignOut() {
      await userService.logout();

      dialogInstance.close();
    }


    return {
      dataState,
      onSubmit: u => onSubmit(u),
      onSignOut: () => onSignOut(),
    }
  }
}
</script>

<style lang="scss">

</style>
