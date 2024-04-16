<template>
  <LazyCSAutocomplete v-model="dataState.value"
                  @update:modelValue="onCustomerSelect"
                  placeholder="Select customer"
                  :options-list-getter="getCustomerOptionsList"
                  :model-match-option="(model, optionValue) => model?._doc === optionValue?._doc"
                  :label-getter="v => getItemLabel(v)">
  </LazyCSAutocomplete>
</template>


<script setup lang="ts">
import { useCustomerService} from '~/services/helpers/customer/customer.service';
import {reactive} from 'vue';
import type {CS5CustomerDbNode} from '~/helpers/user-data-helpers';
import {useCurrentCustomerIdStore} from '~/store/currentCustomerId';


interface SelectCustomerProps {
  modelValue: CS5CustomerDbNode;
}


export interface SelectCustomerEmits {
  (e: 'update:modelValue', value: CS5CustomerDbNode): void;
}


const props = defineProps<SelectCustomerProps>();
const emits = defineEmits<SelectCustomerEmits>()


const customerService = useCustomerService();
const currentCustomerStore = useCurrentCustomerIdStore();

currentCustomerStore.$onAction(({name, after}) => {
  if (name !== 'reset') {
    return;
  }

  after(() => {
    dataState.value = null;
    dataState.customerList = [];
  });
});

const dataState = reactive({
  customerList: [],
  value: props?.modelValue ?? null,
});

function getItemLabel(item): string {
  if (!item) {
    return '';
  }

  return `${item?.firstName} ${item?.lastName} (${item?.email})`;
}

async function fetchAndCacheCustomerList(searchString: string): Promise<CS5CustomerDbNode[]> {
  const customerList = await customerService.getList({
    searchString,
    limit: 10000,
    skip: 0,
  });

  dataState.customerList = customerList;

  return customerList;
}

async function getCustomerOptionsList(searchString: string): Promise<CS5CustomerDbNode[]> {
  const customerList = await fetchAndCacheCustomerList(searchString);

  const list = customerList
    .sort((v, v2) =>  {
      const name1 = v.firstName.toLowerCase();
      const name2 = v2.firstName.toLowerCase();

      if (name1 < name2) { return -1; }
      if (name1 > name2) { return 1; }
      return 0;
    });

  dataState.value = list.find(i => i._doc === dataState?.value?._doc ?? dataState?.value?.id);

  return list;
}

function onCustomerSelect(customer: CS5CustomerDbNode): void {
  if (!customer) {
    return;
  }

  emits('update:modelValue', customer);
}

</script>

<style lang="scss">
</style>
