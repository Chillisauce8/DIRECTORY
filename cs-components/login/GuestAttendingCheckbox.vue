<template>
  <input type="checkbox" name="attending"
         :disabled="(isCustomerAttended() && isGuestOfHonour) || disabled"
         :checked="isCustomerAttended()"
         @click.stop="click()"/>
</template>

<script>
import {useCurrentCustomer} from "~/service/helpers/user-common/current-customer-service.factory";

export default {
  props: ["isGuestOfHonour", "customerId", "savePackageInProgress", "hasEditOwnAttendingPermission",
    "hasEditGuestAttendingPermission", "attending"],
  setup() {
    return {
      currentCustomer: useCurrentCustomer()
    }
  },
  data() {
    return {
      disabled: undefined,
      hasEditPermission: undefined,
    }
  },
  emits: ['change'],
  beforeMount() {
    this.init();
  },
  methods: {
    isCustomerAttended() {
      return this.attending === 'Yes';
    },

    init() {
      this.hasEditPermission = this.customerId === this.currentCustomer.getId() ?
          this.hasEditOwnAttendingPermission : this.hasEditGuestAttendingPermission;
      this.disableIfNeed();
    },

    click() {
      if (!this.disabled) {
        this.$emit('change');
      }
    },

    disableIfNeed() {
      if (this.hasEditPermission) {
        this.disabled = this.savePackageInProgress;
      } else {
        this.disabled = true;
      }
    },
  }
}
</script>

<style>

</style>
