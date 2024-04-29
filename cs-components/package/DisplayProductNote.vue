<template>
  <div v-if="sortedProductNoteList?.length">
    <template v-for="item in sortedProductNoteList">

      <template v-if="!showFullProductNoteItem && showProductNoteItem(item)">
        <div><LazySvgIcon svg="edit" class="inline"/> {{ item.note }}</div>
      </template>

      <template v-if="showFullProductNoteItem && showProductNoteItem(item)">
        <div><LazySvgIcon svg="edit" class="inline"/> {{ getPrefix(item) }}</div>
        <div>{{ item.note }}</div>
      </template>

    </template>
  </div>
</template>

<script lang="ts">
import * as _ from "~/service/cs-lodash";
import { useDateHelper } from "~/service/helpers/date-helper.factory";
import { useUserService } from "~/service/helpers/user-common/user-service.factory";
import { useCurrentUser } from "~/service/helpers/user-common/current-user.factory";
import type { ProductNote } from "~/service/models/packageProduct";

export default {
  props: ['productNote'],
  data() {
    return {
      sortedProductNoteList: undefined,
      showFullProductNoteItem: undefined,
    }
  },
  setup() {
    return {
      dateHelper: useDateHelper(),
      userService: useUserService(),
      currentUser: useCurrentUser(),
    };
  },
  mounted() {
    this.init();
  },
  beforeUpdate() {
    this.init();
  },
  methods: {
    init() {
      this.showFullProductNoteItem = this.currentUser.isStaffOrHiddenStaff();

      this.sortedProductNoteList = this.productNote?.length > 0 ?
        _.sortBy(this.productNote, 'doneBy.dateTime').reverse() : [];
    },
    getPrefix(note: ProductNote): string {
      const dateObj = note.doneBy?.dateTime ? this.dateHelper.parseSaveDateFormat(note.doneBy.dateTime) : null;
      const dateStr = dateObj && this.dateHelper.isValidDate(dateObj) ? this.dateHelper.inputDateFormat(dateObj) + ' ' : '';

      const userType = note.doneBy?.userType;
      const userName = note.doneBy?.name;
      const preparedUserType = userType ? this.getPreparedUserType(userType) : '';

      const showTo = note.showTo?.length > 0 ? note.showTo.join(', ') : note.show;

      return `${dateStr}${(preparedUserType && userName) ? preparedUserType + ' ' + userName + ' ' : ''}-> ${showTo}:`;
    },
    showProductNoteItem(productNoteItem: ProductNote): boolean {
      if (!productNoteItem || !productNoteItem.note) {
        return false;
      }

      if (productNoteItem.showTo) {
        return this.checkShowToCondition(productNoteItem);
      }

      switch (productNoteItem.show) {
        case 'Everyone':
          return true;
        case 'Customer':
          return this.currentUser.isCustomer() || this.currentUser.isStaffOrHiddenStaff();
        case 'Supplier':
          return this.currentUser.isSupplierContact() || this.currentUser.isStaffOrHiddenStaff();
        default:
          return false;
      }
    },

    checkShowToCondition(productNote: ProductNote): boolean {
      const userType = this.currentUser.isHiddenStaff() ? 'staff' : this.currentUser.getVisibleUserType();
      const preparedUserType = this.getPreparedUserType(userType);
      return productNote.showTo.indexOf(preparedUserType) !== -1;
    },

    getPreparedUserType(userType: string): string {
      switch (userType) {
        case 'staff':
          return 'Staff';
        case 'supplierContact':
          return 'Supplier';
        default:
          return 'Customer';
      }
    }
  }
};
</script>

<style>

</style>
