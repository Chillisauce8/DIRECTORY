<template>
  <LazyCSAutocomplete v-model="vm.modelValue"
                  @update:modelValue="onSupplierSelect"
                  placeholder="Select supplier"
                  :options-list-getter="getSupplierOptionList"
                  :label-getter="v => getSupplierItemLabel(v)"
                  :model-match-option="(model, optionValue) => (model?._doc ?? model?.id) === optionValue?.id">
  </LazyCSAutocomplete>
</template>

<script setup lang="ts">
import {useSupplierService} from '~/service/helpers/supplier-common/supplier-service.factory';
import type {SupplierDbNode} from '~/service/helpers/supplier-common/supplier.service';


export interface SupplierItemValue {
  _doc?: string;
  currency: any;
  id: string;
  name: string;
  legalName: string;
  sageId: string;
  currencyName: string;
  currencySymbol: string;
  confirmMethod: string;
}

interface SelectSupplierVM {
  modelValue: SupplierDbNode;
}

interface SelectSupplierProps {
  modelValue: SupplierItemValue;
  excludeHeadOfOffice?: boolean;
}

interface SelectSupplierEmits {
  (e: 'update:modelValue', value: SupplierItemValue): void;
}

const props = defineProps<SelectSupplierProps>();
const emits = defineEmits<SelectSupplierEmits>();

const vm = reactive<SelectSupplierVM>({
  modelValue: props?.modelValue ?? null,
});

const supplierService = useSupplierService();


function sortSupplierList(suppliers: SupplierDbNode[]): SupplierDbNode[] {
  return suppliers.sort((item1, item2) => {
    const name1 = item1.name.toLowerCase();
    const name2 = item2.name.toLowerCase();

    if (name1 < name2) {
      return -1;
    }
    if (name1 > name2) {
      return 1;
    }
    return 0;
  });
}

async function fetchAndSortSupplierOptionsList(searchString: string): Promise<SupplierItemValue[]> {
  const fields = {
    name: 1, currency: 1, _doc: 1, legalName: 1, sageId: 1, confirmMethod: 1
  };

  const supplierList = await supplierService.query(searchString.trim(), fields, props.excludeHeadOfOffice);

  const sortedSupplierList = sortSupplierList(supplierList);

  return sortedSupplierList.map(s => ({
    // _doc: s._doc,
    currency: s.currency,
    id: s._doc,
    name: s.name,
    legalName: s.legalName,
    sageId: s.sageId,
    currencyName: s.currency ? s.currency.name : null,
    currencySymbol: s.currency ? s.currency.symbol : null,
    confirmMethod: s.confirmMethod,
  }));
}

async function getSupplierOptionList(searchString: string): Promise<SupplierItemValue[]> {
  return searchString ? await fetchAndSortSupplierOptionsList(searchString) : [props.modelValue];
}

function onSupplierSelect(item: SupplierItemValue): void {
  emits('update:modelValue', item);
}

function getSupplierItemLabel(item: SupplierItemValue): string {
  return [item.name, item.legalName, item.sageId].filter(item => !!item).join(' - ');
}
</script>

<style lang="scss">

</style>
