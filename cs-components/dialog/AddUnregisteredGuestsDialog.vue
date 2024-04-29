<template>
  <tool-dialog title="Add Guests With No Email" :form-name="dataState.formName">
    <form name="add-guest-with-no-email" @submit.prevent="onFormSubmit">
      <CSFormField>
        <CSInput v-model="dataState.form.name"
                 type="text"
                 name="name"
                 placeholder="Name"></CSInput>
        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.name"></CSError>
        </template>
      </CSFormField>

      <ButtonMain type="submit">Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<script lang="ts">
import { computed, inject, reactive } from 'vue';
import { minLength, required, helpers } from "@vuelidate/validators";
import { nameUniqValidator, csUserNameValidator } from "~/utils/cs-form-validators";
import type { Validation } from '@vuelidate/core';
import { useVuelidate } from '@vuelidate/core';
import {getValidationErrorMessage} from '~/utils/cs-form-validation-helpers';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';
import {useUserService} from '~/service/helpers/user-common/user-service.factory';



export interface AddUnregisteredGuestsDialogData {
  guestList: any[],
}


export interface AddUnregisteredGuestsDialogResult {
  name: string
}


export default {
  setup() {
    const userService = useUserService();

    const dialogInstance = useDialogInstance<AddUnregisteredGuestsDialogResult>();
    const dialogData = useDialogData<AddUnregisteredGuestsDialogData>();


    const dataState = reactive({
      formName: 'addUnregisteredGuestForm',
      error: null,
      form: {
        name: ''
      }
    });

    const nameList = dialogData.guestList.map(item => item.customer.name.toLowerCase());

    const formValidationRules = computed(() => ({
      name: {
        required,
        minLength: minLength(3),
        name: csUserNameValidator('Use full name (Firstname and Surname)'),
        nameUniq: nameUniqValidator(nameList, 'The name must be unique')
      }
    }));

    const v$ = useVuelidate(formValidationRules, dataState.form, {$autoDirty: true});

    function getValidationError(validation: Validation): string | null {
      return getValidationErrorMessage(validation);
    }

    async function onFormSubmit(): Promise<void> {
      if (v$.value.$invalid) {
        return;
      }

      const preparedName = userService.getParsedNameParts(dataState.form.name);

      const name = preparedName.join(' ');

      dialogInstance.close({
        name
      });
    }

    return {
      dataState,
      v$,
      getValidationError: v => getValidationError(v),
      onFormSubmit: () => onFormSubmit(),
    };
  }
}
</script>

<style>

</style>
