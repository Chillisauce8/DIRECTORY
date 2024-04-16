<template>
  <TheDialog class="dialog-with-form"
             :title="dataState.title">
    <form :name="dataState.formName" @submit.prevent="onFormSubmit">
      <p class="dialog-text text-align_center margin_0_0_1"
         v-if="dataState.text">{{ dataState.text }}</p>
      <CSFormField>
        <CSInput class="input"
                 type="text"
                 name="name"
                 placeholder="Name"
                 v-model="dataState.form.name">
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.name"></CSError>
        </template>
      </CSFormField>

      <ButtonMain type="submit">Ok</ButtonMain>
    </form>
  </TheDialog>
</template>

<script lang="ts">
import { computed, reactive } from 'vue';
import { minLength, required } from '@vuelidate/validators';
import type { Validation } from '@vuelidate/core';
import { useVuelidate } from '@vuelidate/core';
import {getValidationErrorMessage} from '~/utils/cs-form-validation-helpers';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface InputNameDialogData {
  title: string,
  text: string,
  initialValue?: string;
}


export interface InputNameDialogResult {
  name: string
}


export default {
  setup() {
    const dialogInstance = useDialogInstance<InputNameDialogResult>();
    const dialogData = useDialogData<InputNameDialogData>();


    const dataState = reactive({
      title: dialogData.title ?? 'Input Name',
      text: dialogData.text ?? '',
      formName: 'nameForm',
      error: null,
      form: {
        name: dialogData.initialValue ?? ''
      }
    });

    const formValidationRules = computed(() => ({
      name: {
        required,
        minLength: minLength(3),
      }
    }));

    const v$ = useVuelidate(formValidationRules, dataState.form, {$autoDirty: true});

    function getValidationError(validation: Validation): string | null {
      return getValidationErrorMessage(validation);
    }

    async function onFormSubmit(): Promise<void> {
      dialogInstance.close({
        name: dataState.form.name
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
