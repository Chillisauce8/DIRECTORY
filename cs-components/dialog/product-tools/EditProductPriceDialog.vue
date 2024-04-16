<script setup lang="ts">
import type {YesNoValue} from '~/utils/common.types';
import {minValue, required} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface EditProductPriceDialogData {
  priceOverride: YesNoValue;
  bookedPricePerPersonGBP: number;
  minPricePerPersonGBP: number;
  pricePerPersonGBP: number;
  notOverriddenPricePerPersonGBP: number;
  hasFixedPrice: boolean;
}


export interface EditProductPriceDialogResult {
  priceOverride: YesNoValue;
  minPricePerPersonGBP: number;
  pricePerPersonGBP: number
}


interface EditProductPriceDialogVM {
  priceOverride: YesNoValue;
  bookedPricePerPersonGBP: number;
  notOverriddenPricePerPersonGBP: number;
  minPricePerPersonGBP: number;
  pricePerPersonGBP: number;
  hasFixedPrice: boolean;
  priceOverrideOptions: YesNoValue[];
  test: any;
}


const dialogData = useDialogData<EditProductPriceDialogData>();
const dialogInstance = useDialogInstance<EditProductPriceDialogResult>();


const vm = reactive<EditProductPriceDialogVM>({
  priceOverride: dialogData?.priceOverride ?? 'No',
  bookedPricePerPersonGBP: dialogData?.bookedPricePerPersonGBP,
  notOverriddenPricePerPersonGBP: dialogData?.notOverriddenPricePerPersonGBP,
  minPricePerPersonGBP: dialogData?.minPricePerPersonGBP,
  pricePerPersonGBP: dialogData?.pricePerPersonGBP,
  hasFixedPrice: dialogData?.hasFixedPrice,
  priceOverrideOptions: ['Yes', 'No'],
  test: null,
});

const validationRules = computed(() => ({
  priceOverride: [required],
  minPricePerPersonGBP: [minValue(0)],
  pricePerPersonGBP: [required, minValue(vm?.minPricePerPersonGBP ?? 0)],
}));

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});

const priceOverrideEnabled = computed(() => vm.priceOverride === 'Yes');

watch(() => vm.minPricePerPersonGBP, currentMinPricePerPerson => {
  if (currentMinPricePerPerson > vm.pricePerPersonGBP) {
    vm.pricePerPersonGBP = currentMinPricePerPerson;
  }
});


function save() {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  const minPricePerPersonGBP = getParsedNumberValue(vm.minPricePerPersonGBP);
  const pricePerPersonGBP = getParsedNumberValue(vm.pricePerPersonGBP);

  dialogInstance.close({
    priceOverride: vm.priceOverride,
    minPricePerPersonGBP,
    pricePerPersonGBP,
  });
}

function getParsedNumberValue(rawPriceValue: any): number {
  if (rawPriceValue === null) {
    return null;
  }

  if (rawPriceValue === undefined) {
    return null;
  }

  return parseInt(rawPriceValue, 10);
}
</script>

<template>
<tool-dialog title="Edit Price">
  <form name="edit-price" @submit.prevent="save">
    <CSFormField>
      <LazyCSSelect v-model="vm.priceOverride"
                :option-list="vm.priceOverrideOptions"
                placeholder="Override Price">
      </LazyCSSelect>
    </CSFormField>

    <CSFormField>
      <CSInput v-model="vm.notOverriddenPricePerPersonGBP"
               placeholder="Calculated Price Per Person"
               type="number"
               :disabled="true">
      </CSInput>
    </CSFormField>

    <CSFormField>
      <CSInput v-model="vm.bookedPricePerPersonGBP"
               placeholder="Booked Price Per Person"
               type="number"
               :disabled="true">
      </CSInput>
    </CSFormField>

    <CSFormField>
      <CSInput v-model="vm.minPricePerPersonGBP"
               :restrictPattern="/^[0-9]*$/"
               placeholder="Minimum Price Per Person">
      </CSInput>

      <template #suffix>
        <CSError class="cs-form-text-error" :vuelidate-field="v$.minPricePerPersonGBP"></CSError>
      </template>
    </CSFormField>

    <CSFormField>
      <CSInput v-model="vm.pricePerPersonGBP"
               :restrictPattern="/^[0-9]*$/"
               placeholder="Per Person Price"
               :disabled="!priceOverrideEnabled">
      </CSInput>

      <template #suffix>
        <CSError class="cs-form-text-error" :vuelidate-field="v$.pricePerPersonGBP"></CSError>
      </template>
    </CSFormField>

    <ButtonMain type="submit" >OK</ButtonMain>
  </form>
</tool-dialog>
</template>

<style lang="scss">

</style>