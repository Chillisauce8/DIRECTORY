<script setup lang="ts">
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';

enum DisplayPricesValue {
  auto = 'Auto',
  show = 'Show',
  hide = 'Hide',
}


interface DisplayPricesSetting {
  guest?: DisplayPricesValue;
  organiser?: DisplayPricesValue
}


export interface EditDisplayPricesDialogData {
  displayPrices: {
    productPrices: DisplayPricesSetting;
    packagePrices: DisplayPricesSetting;
  };
}


export interface EditDisplayPricesDialogResult extends EditDisplayPricesDialogData {}


interface EditDisplayPricesDialogVM {
  productPricesGuest: DisplayPricesValue;
  productPricesOrganiser: DisplayPricesValue;
  packagePricesGuest: DisplayPricesValue;
  packagePricesOrganiser: DisplayPricesValue;
  possibleValues: (DisplayPricesValue | null)[];
}


const dialogData = useDialogData<EditDisplayPricesDialogData>();
const dialogInstance = useDialogInstance<EditDisplayPricesDialogResult>();


const vm = reactive<EditDisplayPricesDialogVM>({
  productPricesGuest: dialogData?.displayPrices?.productPrices?.guest ?? null,
  productPricesOrganiser: dialogData?.displayPrices?.productPrices?.organiser ?? null,
  packagePricesGuest: dialogData?.displayPrices?.packagePrices?.guest ?? null,
  packagePricesOrganiser: dialogData?.displayPrices?.packagePrices?.organiser ?? null,
  possibleValues: [null, DisplayPricesValue.auto, DisplayPricesValue.show, DisplayPricesValue.hide],
});


function getOptionLabel(value: string): string {
  if (!value) {
    return 'NULL';
  }

  return value;
}

function save() {
  let displayPrices;
  let productPrices;
  let packagePrices;

  if (vm.productPricesGuest || vm.productPricesOrganiser) {
    productPrices = {};

    if (vm.productPricesGuest) {
      productPrices.guest = vm.productPricesGuest;
    }

    if (vm.productPricesOrganiser) {
      productPrices.organiser = vm.productPricesOrganiser;
    }
  }

  if (vm.packagePricesGuest || vm.packagePricesOrganiser) {
    packagePrices = {};

    if (vm.packagePricesGuest) {
      packagePrices.guest = vm.packagePricesGuest;
    }

    if (vm.packagePricesOrganiser) {
      packagePrices.organiser = vm.packagePricesOrganiser;
    }
  }

  if (productPrices || packagePrices) {
    displayPrices = {};

    if (productPrices) {
      displayPrices.productPrices = productPrices;
    }

    if (packagePrices) {
      displayPrices.packagePrices = packagePrices;
    }
  }

  dialogInstance.close({displayPrices});
}
</script>

<template>
  <tool-dialog title="Show / Hide Prices">
    <form name="show-hide-prices" @submit.prevent="save">
      <span class="text-align_center">Product Prices</span>

      <CSFormField>
        <LazyCSSelect v-model="vm.productPricesGuest"
                  placeholder="Guest"
                  name="productPricesGuest"
                  :option-list="vm.possibleValues"
                  :label-getter="v => getOptionLabel(v)">
        </LazyCSSelect>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="vm.productPricesOrganiser"
                  placeholder="Organiser"
                  name="productPricesOrganiser"
                  :option-list="vm.possibleValues"
                  :label-getter="v => getOptionLabel(v)">
        </LazyCSSelect>
      </CSFormField>

      <span class="text-align_center">Package Prices</span>

      <CSFormField>
        <LazyCSSelect v-model="vm.packagePricesGuest"
                  placeholder="Guest"
                  name="packagePricesGuest"
                  :option-list="vm.possibleValues"
                  :label-getter="v => getOptionLabel(v)">
        </LazyCSSelect>
      </CSFormField>

      <CSFormField>
        <LazyCSSelect v-model="vm.packagePricesOrganiser"
                  placeholder="Organiser"
                  name="packagePricesOrganiser"
                  :option-list="vm.possibleValues"
                  :label-getter="v => getOptionLabel(v)">
        </LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit" >Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">

</style>
