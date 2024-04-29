<script setup lang="ts">
import {useCsLodash} from '~/service/cs-lodash.factory';

interface PackageEditCustomerAttendingProps {
  eventCustomerSummary: any[];
  customersAttending: any[];
}


interface PackageEditCustomerAttendingEmits {
  (e: 'click:customer', value: any);
}


interface PackageEditCustomerAttendingVM {
  sortedEventCustomerSummary: any[];
}


const csLodash = useCsLodash();

const props = defineProps<PackageEditCustomerAttendingProps>();
const emits = defineEmits<PackageEditCustomerAttendingEmits>();


const vm = reactive<PackageEditCustomerAttendingVM>({
  sortedEventCustomerSummary: sortCustomerSummary(props?.eventCustomerSummary ?? []),
});


function initVMFromProps(): void {
  vm.sortedEventCustomerSummary = sortCustomerSummary(props.eventCustomerSummary);
}

function isCustomerAttended(customerSummary: any): boolean {
  const customerId = customerSummary.customer.id;

  for (let item of props.customersAttending) {
    if (item.customerId.indexOf(customerId) !== -1) {
      return item.attending === 'Yes';
    }
  }

  return null;
}

function revertCustomerAttending(customerSummary: any) {
  emits('click:customer', customerSummary);
}

function sortCustomerSummary(eventCustomerSummary: any[]): any[] {
  return csLodash.sortBy(eventCustomerSummary, 'customer.name');
}


watch(() => props.eventCustomerSummary, () => initVMFromProps());
</script>

<template>
  <div class="edit-customers-attending Column">
    <template v-for="(customerSummaryItem, customerIndex) in vm.sortedEventCustomerSummary">
      <article :class="{checked: isCustomerAttended(customerSummaryItem)}"
               @click="revertCustomerAttending(customerSummaryItem)"
               class="list-item">
        <div class="list-item-content Row">
          <div class="circle-icon CB-1 Row Center">
            <LazySvgIcon svg="person"></LazySvgIcon>
            <LazySvgIcon v-if="isCustomerAttended(customerSummaryItem)" class="icon-checked-circle text-color_blue" svg="check-circle-fill"></LazySvgIcon>
            <div class="icon icon-checked-circle text-color_blue animate_check"></div>
          </div>

          <section class="customer-info Column Center Grow">
            <h3 class="m-header ellipsis">{{ customerSummaryItem?.customer?.name }}</h3>
            <p class="s-header ellipsis">{{ customerSummaryItem?.customer?.email }}</p>
          </section>
        </div>
      </article>

    </template>
  </div>
</template>

<style lang="scss">
.edit-customers-attending {
  width: 100%;
  .list-item {
    cursor: pointer;

    .list-item-content {
      width: 100%;
    }
  }

  .circle-icon {
    position: relative;
    width: 2.5em !important;
    height: 2.5em !important;
    border-radius: 50%;
    margin: 0 0.5em 0 0;
  }

  .icon-checked-circle {
    position: absolute;
    width: 1em !important;
    height: 1em !important;
    right: -.25em;
    top: -.25em;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .customer-info {
    width: calc(100% - 2.5em);

    .m-header {
      font-size: 24px;
      font-weight: 600;
    }

    .s-header {
      font-size: 16px;
      font-weight: 100;
    }
  }
}
</style>
