<script setup lang="ts">
import {useDateHelper} from '~/services/helpers/date-helper.factory';
import type {YesNoValue} from '~/utils/common.types';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';
import {roundNumberAtLeastDecimalPoints} from '~/services/models/pricing';
import {helpers, minValue, required} from '@vuelidate/validators';
import {useVuelidate} from '@vuelidate/core';


interface CancelBookingItineraryData {
  itineraryId: string;
  productName: string;
  date: Date;
  startTime: Date;
  supplierName: string;
  costCurrency: number;
  currencySymbol: string;
  exchangeRate: number;
  priceGBP: number;
}


interface CancelBookingItineraryResultData {
  itineraryId: string;
  costCurrency: number;
  priceGBP: number;
  pricingOverride: YesNoValue;
  stage: string;
}


type CancelBookingItineraryVMData = (CancelBookingItineraryData & CancelBookingItineraryResultData);


export type CancelBookingDialogData = CancelBookingItineraryData[];


export type CancelBookingDialogResult = CancelBookingItineraryResultData[];


interface CancelBookingDialogVM {
  productList: CancelBookingItineraryVMData[];
}


const dialogData = useDialogData<CancelBookingDialogData>();
const dialogInstance = useDialogInstance<CancelBookingDialogResult>();
const dateHelper = useDateHelper();


const vm = reactive<CancelBookingDialogVM>({
  productList: getProductList(),
});

const validationRules = computed(() => ({
  productList: {
    $each: helpers.forEach({
      pricingOverride: {required},
      costCurrency: {required, minValue: minValue(0)},
      priceGBP: {required, minValue: minValue(0)},
      stage: {required},
    }),
  },
}));

const v$ = useVuelidate(validationRules, vm, {$autoDirty: true});


function getProductList(): CancelBookingItineraryVMData[] {
  return dialogData.map(i => ({
    ...i,
    pricingOverride: 'No',
    stage: null,
  }));
}

function getCostGBP(index: number): number {
  const itinerary = vm.productList[index];

  const {costCurrency, exchangeRate} = itinerary ?? {};

  if (!costCurrency) {
    return 0;
  }

  const costGBP = costCurrency / exchangeRate;

  return roundNumberAtLeastDecimalPoints(costGBP);
}

function save() {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  const result = vm.productList.map(p => ({
    itineraryId: p.itineraryId,
    pricingOverride: p.pricingOverride,
    costCurrency: p.costCurrency,
    priceGBP: p.priceGBP,
    stage: p.stage,
  }));

  dialogInstance.close(result);
}
</script>

<template>
  <the-dialog title="Cancel Booking" class="dialog-with-table" :fullscreen="true">
    <table>
      <thead class="table-header">
        <tr>
          <th>Product</th>
          <th>Date/Time</th>
          <th class="control-container">Pricing Override</th>
          <th class="price-controls-container">Cost/Price</th>
          <th class="stage-control-container">Stage</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="(product, index) in vm.productList">
          <tr>
            <td>
              <div>
                <p>{{product.productName}}</p>
                <p class="text-color_grey50">{{product.supplierName}}</p>
              </div>
            </td>

            <td>
              <div>
                <p>{{ dateHelper.viewDateFormat(product.date) }}</p>
                <p>{{ dateHelper.viewTimeFormat(product.startTime) }}</p>
              </div>
            </td>

            <td class="control-container">
              <CSFormField>
                <LazyCSSelect v-model="product.pricingOverride"
                          :name="'pricingOverride' + index"
                          :option-list="['Yes', 'No']">
                </LazyCSSelect>

                <template #suffix>
                  <CSErrorEachItem class="cs-form-text-error"
                                   :vuelidate-collection-field="v$.productList"
                                   :item-index="index"
                                   item-field-name="pricingOverride">
                  </CSErrorEachItem>
                </template>
              </CSFormField>
            </td>

            <td class="price-controls-container">
              <div class="Row">
                <CSFormField class="price-control">
                  <CSInput type="number"
                           v-model="product.costCurrency"
                           :placeholder="'Cost ' + product.currencySymbol"
                           :disabled="product.pricingOverride !== 'Yes'">
                  </CSInput>

                  <template #suffix>
                    <CSErrorEachItem class="cs-form-text-error"
                                     :vuelidate-collection-field="v$.productList"
                                     :item-index="index"
                                     item-field-name="costCurrency">
                    </CSErrorEachItem>
                  </template>
                </CSFormField>

                <template v-if="product.currencySymbol !== '£'">
                  <CSFormField class="price-control">
                    <CSInput type="number"
                             placeholder="Cost £"
                             :model-value="getCostGBP(index)"
                             :disabled="true">
                    </CSInput>
                  </CSFormField>
                </template>

                <CSFormField class="price-control">
                  <CSInput type="number"
                           placeholder="Price £"
                           v-model="product.priceGBP"
                           :disabled="product.pricingOverride !== 'Yes'">
                  </CSInput>

                  <template #suffix>
                    <CSErrorEachItem class="cs-form-text-error"
                                     :vuelidate-collection-field="v$.productList"
                                     :item-index="index"
                                     item-field-name="priceGBP">
                    </CSErrorEachItem>
                  </template>
                </CSFormField>
              </div>
            </td>

            <td class="stage-control-container">
              <CSFormField >
                <LazyCSSelect v-model="product.stage"
                          placeholder="Stage"
                          :option-list="['Pending Cancellation']">
                </LazyCSSelect>

                <template #suffix>
                  <CSErrorEachItem class="cs-form-text-error"
                                   :vuelidate-collection-field="v$.productList"
                                   :item-index="index"
                                   item-field-name="stage">
                  </CSErrorEachItem>
                </template>
              </CSFormField>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <ButtonMain  @click.native="save">Save</ButtonMain>
  </the-dialog>
</template>

<style lang="scss">
$form-item-width: 110px;
$price-control-margin-x: 10px;

.control-container {
  width: $form-item-width;
}

.price-controls-container {
  width: calc(($form-item-width + $price-control-margin-x) * 3);

  .price-control {
    margin: 0 $price-control-margin-x;
  }
}

.stage-control-container {
  width: calc(($form-item-width) * 2);
}
</style>