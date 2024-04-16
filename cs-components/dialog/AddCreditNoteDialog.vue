<script setup lang="ts">
import type {YesNoValue} from '~/utils/common.types';
import {useVuelidate} from '@vuelidate/core';
import {required} from '@vuelidate/validators';
import {useCsLodash} from '~/services/cs-lodash.factory';
import {useDialogInstance} from '~/services/dialog/core/dialog.composables';


enum OverrideOptionTypes {
  postponed = 'postponed',
  refundCreditNote = 'refundCreditNote',
}


export type AddCreditNoteDialogData = void;


export interface AddCreditNoteDialogResult {
  type: OverrideOptionTypes;
  costOverride: boolean;
  priceOverride: boolean;
}


interface AddCreditNoteDialogVM {
  type: OverrideOptionTypes;
  costOverride: YesNoValue;
  priceOverride: YesNoValue;
  overrideOptions: YesNoValue[];
  typeOptions: OverrideOptionTypes[];
}


const dialogInstance = useDialogInstance<AddCreditNoteDialogResult>();
const csLodash = useCsLodash();


const vm = reactive<AddCreditNoteDialogVM>({
  type: null,
  costOverride: 'Yes',
  priceOverride: 'Yes',
  overrideOptions: ['Yes', 'No'],
  typeOptions: [OverrideOptionTypes.postponed, OverrideOptionTypes.refundCreditNote]
});


const validationRules = {
  type: [required],
  costOverride: [required],
  priceOverride: [required],
}

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


function getTypeOptionsLabel(option: OverrideOptionTypes): string {
  return csLodash.startCase(option);
}

function save() {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  dialogInstance.close({
    type: vm.type,
    costOverride: vm.costOverride === 'Yes',
    priceOverride: vm.priceOverride === 'Yes',
  });
}
</script>

<template>
  <tool-dialog title="Add Credit Note">
    <form name="add-credit-note" @submit.prevent="save">
      <CSFormField>
        <LazyCSSelect v-model="vm.type"
                  placeholder="Type"
                  :option-list="vm.typeOptions"
                  :label-getter="v => getTypeOptionsLabel(v)">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.type"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="vm.costOverride"
                  placeholder="Set Cost of all products to £0"
                  :option-list="vm.overrideOptions">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.costOverride"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="vm.priceOverride"
                  placeholder="Set Price of all products to £0"
                  :option-list="vm.overrideOptions">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="vm.priceOverride"></CSError>
        </template>
      </CSFormField>

      <ButtonMain type="submit" >Process</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style scoped lang="scss">

</style>
