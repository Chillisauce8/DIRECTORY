<script setup lang="ts">
import {useVuelidate} from '@vuelidate/core';
import {minValue, required} from '@vuelidate/validators';
import {roundNumberAtLeastDecimalPoints} from '~/services/models/pricing';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface CancelProductDialogData {
  costCurrency: number;
  currencySymbol: string;
  exchangeRate: number;
  priceGBP: number;
}


export interface CancelProductDialogResult {
  pricingOverride: 'Yes' | 'No';
  costCurrency: number;
  priceGBP: number;
  stage: string;
}


interface CancelProductDialogVM {
  cost: number;
  price: number;
  currencySymbol: string;
  exchangeRate: number;
  pricingOverride: 'Yes' | 'No';
  stage: string;
  pricingOverrideOptionsList: ('Yes' | 'No')[];
  stageOptionsList: string[];
}


const dialogData = useDialogData<CancelProductDialogData>();
const dialogInstance = useDialogInstance<CancelProductDialogResult>();

const vm = reactive<CancelProductDialogVM>({
  cost: dialogData.costCurrency,
  currencySymbol: dialogData.currencySymbol,
  exchangeRate: dialogData.exchangeRate,
  price: dialogData.priceGBP,
  pricingOverride: null,
  stage: null,
  pricingOverrideOptionsList: ['Yes', 'No'],
  stageOptionsList: ['Pending Cancellation'],
});

const pricingOverrideEnabled = ref(false);

const validationRules = computed(() => ({
  pricingOverride: [required],
  cost: [required, minValue(0)],
  price: [required, minValue(0)],
  stage: [required],
}));

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


function getCostGBP(): number {
  if (!vm.cost) {
    return 0;
  }

  let val = vm.cost / vm.exchangeRate;

  return roundNumberAtLeastDecimalPoints(val);
}

function save() {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  dialogInstance.close({
    pricingOverride: vm.pricingOverride,
    costCurrency: vm.cost,
    priceGBP: vm.price,
    stage: vm.stage,
  });
}

watch(() => vm.pricingOverride, (v) => pricingOverrideEnabled.value = v === 'Yes');
</script>

<template>
  <tool-dialog title="Cancel product">
    <form name="cancel-product" @submit.prevent="save">
      <CSFormField>
        <LazyCSSelect v-model="vm.pricingOverride"
                  :option-list="vm.pricingOverrideOptionsList"
                  placeholder="Pricing Override">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.pricingOverride"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <CSInput type="number"
                 :placeholder="`Cost ${vm.currencySymbol}`"
                 v-model="vm.cost"
                 novalidate step="0.01"
                 :disabled="!pricingOverrideEnabled">
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.cost"></CSError>
        </template>
      </CSFormField>


      <template v-if="vm.currencySymbol !== '£'">
        <CSFormField>
          <CSInput :disabled="true"
                   type="number"
                   novalidate step="0.01"
                   :placeholder="`Cost ${vm.currencySymbol}`"
                   :model-value="getCostGBP()">
          </CSInput>
        </CSFormField>
      </template>

      <CSFormField>
        <CSInput type="number"
                 placeholder="Price £"
                 v-model="vm.price"
                 :disabled="!pricingOverrideEnabled">
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.price"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="vm.stage" :option-list="vm.stageOptionsList" placeholder="Stage">
        </LazyCSSelect>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.stage"></CSError>
        </template>
      </CSFormField>

      <ButtonMain type="submit" >OK</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>