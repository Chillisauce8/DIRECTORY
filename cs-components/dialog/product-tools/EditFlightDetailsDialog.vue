<script setup lang="ts">
import type {IFlightDetails} from '~/services/models/packageProduct';
import {useVuelidate} from '@vuelidate/core';
import {maxLength, required} from '@vuelidate/validators';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface EditFlightDetailsDialogData extends IFlightDetails {}


export interface EditFlightDetailsDialogResult {
  flightDetails: IFlightDetails;
}


export interface EditFlightDetailsDialogVM extends IFlightDetails {}


const dialogData = useDialogData<EditFlightDetailsDialogData>();
const dialogInstance = useDialogInstance<EditFlightDetailsDialogResult>();


const vm = reactive<EditFlightDetailsDialogVM>({
  flightCode: dialogData?.flightCode ?? '',
  departureTime: dialogData?.departureTime ?? '',
  arrivalTime: dialogData?.arrivalTime ?? '',
});

const formValidationRules = computed(() => ({
  flightCode: [required, maxLength(10)],
  departureTime: [required],
  arrivalTime: [required],
}));


const v$ = useVuelidate(formValidationRules, vm, {$autoDirty: true});


function submit() {
  if (v$.value.$invalid) {
    return;
  }

  dialogInstance.close({
    flightDetails: {
      flightCode: vm.flightCode,
      departureTime: vm.departureTime,
      arrivalTime: vm.arrivalTime,
    }
  });
}
</script>

<template>
  <tool-dialog title="Flight Details">
    <form name="flight-details" @submit.prevent="submit">
      <CSFormField>
        <CSInput type="text"
                 name="flightCode"
                 class="full-width"
                 placeholder="Flight Code"
                 v-model="vm.flightCode">
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.flightCode"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <CSInput type="text"
                 name="departureTime"
                 class="full-width"
                 placeholder="Departure Time"
                 v-model="vm.departureTime">
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.departureTime"></CSError>
        </template>
      </CSFormField>

      <CSFormField>
        <CSInput type="text"
                 name="arrivalTime"
                 class="full-width"
                 placeholder="Arrival Time"
                 v-model="vm.arrivalTime">
        </CSInput>

        <template #suffix>
          <CSError class="cs-form-text-error" :vuelidate-field="v$.arrivalTime"></CSError>
        </template>
      </CSFormField>

      <ButtonMain type="submit" >OK</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>