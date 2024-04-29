<script setup lang="ts">
import {useCsLodash} from '~/service/cs-lodash.factory';
import {useCurrentEvent} from '~/service/helpers/event/current-event.service.factory';
import {helpers, required} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';
import CSCheckbox from '~/components/forms/CSCheckbox.vue';
import {useDialogInstance} from '~/service/dialog/core/dialog.composables';

interface CustomerInfo {
  id: string;
  name: string;
  fixedPrice: boolean;
  priceGBP: number;
}


interface EditFixedPriceCustomerInfo extends CustomerInfo {
  newFixedPrice?: boolean;
  newPriceGBP?: number;
  originalPrice?: number;
}


export type EditFixedCustomerPriceDialogData = void;


export type EditFixedCustomerPriceDialogResult = CustomerInfo[];


interface EditFixedCustomerPriceDialogVM {
  customers: EditFixedPriceCustomerInfo[];
}


const dialogInstance = useDialogInstance<EditFixedCustomerPriceDialogResult>();
const currentEvent = useCurrentEvent();
const csLodash = useCsLodash();

const vm = reactive<EditFixedCustomerPriceDialogVM>({
  customers: getCustomerInfo(),
});

const validationRules = computed(() => ({
  customers: {
    $each: helpers.forEach({
      newFixedPrice: {required},
      newPriceGBP: {required: requiredConditional((v, s) => toRaw(s)?.newFixedPrice === true)},
    }),
  },
}));

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


function getCustomerInfo(): EditFixedPriceCustomerInfo[] {
  return csLodash.sortBy(
      currentEvent.getCustomerSummary()
        .map((item: any) => {
          const fixedPrice = item.fixedPrice === 'Yes';
          const priceGBP = item?.money?.priceGBP;
          let originalPrice;

          if (priceGBP) {
            const marginDiscount = currentEvent.getBookedPackage().getDiscountMargin();
            const packageMarginGBP = item?.money?.packageMarginGBP ?? 0;

            const discount = packageMarginGBP > marginDiscount ? packageMarginGBP - marginDiscount : 0;

            originalPrice = item?.money?.packagePriceGBP - discount;
          }

          return {
            id: item.customer.id,
            name: item.customer.name,
            newFixedPrice: fixedPrice,
            newPriceGBP: priceGBP,
            fixedPrice, priceGBP, originalPrice
          }
        }),
      'name');
}

function save() {
  const resultData = vm.customers
    .filter(data => (data.fixedPrice !== data.newFixedPrice) || (data.newFixedPrice && data.priceGBP !== data.newPriceGBP))
    .map(_data => {
      const data = {..._data};
      if (data.newFixedPrice) {
        data.priceGBP = data.newPriceGBP;
      }

      if (data.newFixedPrice !== data.fixedPrice) {
        data.fixedPrice = data.newFixedPrice;
      }

      delete data.newFixedPrice;
      delete data.newPriceGBP;

      return data;
    });

  dialogInstance.close(resultData);
}

function needDisableSaveButton(): boolean {
  const dataChanged = vm.customers
    .some(data => data.newFixedPrice !== data.fixedPrice || data.newPriceGBP !== data.priceGBP);

  if (!dataChanged) {
    return true;
  }

  const dataInvalid = vm.customers
    .some(data => !csLodash.isNumber(data.newPriceGBP));

  if (dataInvalid) {
    return true;
  }

  return false;
}
</script>

<template>
  <tool-dialog class="x-large dialog-with-table" title="Edit Fixed Price">
    <form name="edit-fixed-price" @submit.prevent="save">
      <table>
        <thead class="table-header">
        <tr>
          <th class="text-align_center name-column">Name</th>
          <th class="text-align_center">Fixed price</th>
          <th class="text-align_center column-with-input">Price</th>
          <th class="text-align_center column-with-input">Original Price</th>
        </tr>
        </thead>

        <tbody class="bg-color_white" v-if="vm.customers">

        <template v-for="(customer, index) in vm.customers">
          <tr>
            <td class="text-align_center white-space-normal">{{ customer.name }}</td>

            <td class="text-align_center">
              <CSCheckbox v-model="customer.newFixedPrice" @update:modelValue="v$.customers?.$validate()"></CSCheckbox>
            </td>
            <td class="column-with-input">
              <!--              <CSFormField>-->
              <CSInput type="number"
                       class="text-align_center cs-input-no-number-arrows"
                       placeholder="Price"
                       :disabled="!customer.newFixedPrice"
                       v-model="customer.newPriceGBP">
              </CSInput>

              <CSErrorEachItem class="cs-form-text-error text-align_center"
                               :vuelidate-collection-field="v$.customers"
                               :item-index="index"
                               item-field-name="newPriceGBP">
              </CSErrorEachItem>
            </td>

            <td class="text-align_center column-with-input">
              <CSInput type="number"
                       :disabled="true"
                       class="text-align_center cs-input-no-number-arrows"
                       v-model="customer.originalPrice">
              </CSInput>
            </td>
          </tr>
        </template>
        </tbody>
      </table>

      <ButtonMain type="submit" :disabled="needDisableSaveButton()">Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">
.column-name {
  min-width: 250px;
}

.column-with-input {
  width: 150px;
}

</style>
