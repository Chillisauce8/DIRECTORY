<script setup lang="ts">
import {required} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';

export type DeclineProductDialogData = never;
export type DeclineProductDialogResult = string | never;


const dialogInstance = useDialogInstance<DeclineProductDialogResult>();


const vm = reactive({
  declineReason: null,
});

const validationRules = computed(() => {
  return {declineReason: [required]}
});

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


async function confirm(): Promise<void> {
  const validationResult = await v$.value.$validate();

  if (!validationResult) {
    return;
  }

  dialogInstance.close(vm.declineReason);
}
</script>

<template>
  <tool-dialog title="Confirm Decline">
    <form name="confirm-decline" @submit.prevent="confirm">
      <CSFormField>
        <CSInput type="text"
                 name="declineReason"
                 placeholder="Please Enter A Reason"
                 v-model="vm.declineReason"/>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.declineReason"></CSError>
        </template>
      </CSFormField>

      <ButtonMain type="submit">Confirm Decline</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style scoped lang="scss">

</style>
