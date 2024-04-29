<script setup lang="ts">
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';

export type AddBookingFormDialogData = never;


export interface AddBookingFormDialogResult {
  variantToBook: string;
}


interface AddBookingFormDialogVM {
  selected: string;
  possibleVariants: string[];
}


const dialogInstance = useDialogInstance<AddBookingFormDialogResult>();


const vm = reactive<AddBookingFormDialogVM>({
  selected: null,
  possibleVariants: ['Booking Form Received'],
});

function save(): void {
  dialogInstance.close({variantToBook: vm.selected});
}
</script>

<template>
  <tool-dialog title="Book product">
    <form name="add-booking-form" @submit.prevent="save">
      <p class="full-width tool-dialog-text Row-Center">
        Allows an event to be turned into a 'Booking' without having to receive any monetary funds
      </p>

      <CSFormField>
        <LazyCSSelect v-model="vm.selected"
                  :option-list="vm.possibleVariants">
        </LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit" >Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style scoped lang="scss">

</style>
