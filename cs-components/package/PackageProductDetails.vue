<template>
  <div>
    <template v-for="detailItem in details">
      <div v-if="detailItem.text" :class="detailItem.additionalClasses">
        <LazySvgIcon :svg="detailItem.iconName" class="inline"/> {{ detailItem.text }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  usePermissionDetailsService
} from "~/services/helpers/package/permission-details.service.factory";
import { SupplierConfirmMethod } from "~/services/models/supplier";
import type { IConfirmation } from "~/services/models/packageProduct";
import { useTaskListService } from "~/services/helpers/event/task-list.service.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import { useCurrentUser } from "~/services/helpers/user-common/current-user.factory";

export default {
  props: ['packageProductDescription'],
  data() {
    return {
      details: []
    }
  },
  setup() {
    return {
      currentEvent: useCurrentEvent(),
      currentUser: useCurrentUser(),
      permissionDetailsService: usePermissionDetailsService(),
      taskListService: useTaskListService(),
    };
  },
  watch: {
    packageProductDescription: function (newVal, oldVal) {
      this._initPackageProductDetails();
    }
  },
  beforeMount() {
    this._initPackageProductDetails();
  },
  methods: {
    _initPackageProductDetails() {
      const product = this.packageProductDescription.packageProduct.product;

      const additionalContext = {
        itineraryId: this.packageProductDescription.packageProduct.itineraryId,
        productType: product ? product.getType() : null,
        productStage: this.packageProductDescription.packageProduct.stage,
      };

      const possiblePermissions = ['supplier', 'stage', 'declinedReason',
        'staffTasks', 'supplierTasks', 'supplierPhone'];

      const detailsParameters = {
        possiblePermissions: possiblePermissions,
        permissionsGroup: 'packageProductDetails',
        additionalContext: additionalContext,
        getDetailText: this._getDetailText.bind(this),
        getDetailClasses: this._getDetailClasses.bind(this),
      };

      this.details = this.permissionDetailsService.createDetailsOrderedArray(detailsParameters);
    },

    _getDetailClasses(permissionName: string): string {
      switch (permissionName) {
        case 'supplier':
          return this._getSupplierClasses();
        case 'stage': {
          return this.getStageClasses();
        }
      }

      return '';
    },

    getStageClasses(): string {
      if (this.packageProductDescription.packageProduct.stageOverride) {
        return 'text-color_red';
      }

      return '';
    },

    _getSupplierClasses(): string {
      const supplier = this.packageProductDescription.packageProduct.getSupplier();

      let isLoginUser;

      if (this.currentEvent.has()) {
        isLoginUser = this.currentEvent.getIsLoginUserForSupplier(supplier.id);
      } else {
        isLoginUser = supplier.confirmMethod === SupplierConfirmMethod.login;
      }

      if (isLoginUser === false && this.currentUser.isStaffOrHiddenStaff()) {
        return 'text-color_red';
      }

      return '';
    },

    _getDetailText(permissionName: string): string {
      let text: string;

      switch(permissionName) {
        case 'supplier':
          text = this._getSupplierText();
          break;
        case 'stage':
          text = this._getStageText();
          break;
        case 'staffTasks':
          text = this._getStaffTasksText();
          break;
        case 'supplierTasks':
          text = this._getSupplierTasksText();
          break;
        case 'declinedReason':
          text = this._getDeclinedReasonText();
          break;
        case 'supplierPhone':
          text = this._getSupplierPhoneText();
          break;
        default:
          break;
      }

      return text;
    },

    _getSupplierText(): string {
      const supplier = this.packageProductDescription.packageProduct.getSupplier();

      if (supplier && supplier.hasOwnProperty('name')) {
        return supplier.name;
      }

      return '';
    },

    _getStageText(): string {
      return this.packageProductDescription.packageProduct.stage;
    },

    _getStaffTasksText(): string {
      return this.taskListService.getStaffTasksForProduct(this.packageProductDescription.packageProduct);
    },

    _getSupplierTasksText(): string {
      return this.taskListService.getSupplierTasksForProduct(this.packageProductDescription.packageProduct);
    },

    _getSupplierPhoneText(): string {
      if (!this.currentEvent.has()) {
        return '';
      }

      const productSupplier = this.packageProductDescription.packageProduct.getSupplier();

      if (!productSupplier) {
        return '';
      }

      const supplierId = productSupplier?.id;

      const supplierSummary = this.currentEvent.getSummaryForSupplier(supplierId);

      const supplier = supplierSummary?.supplier ?? productSupplier;

      return supplier?.emergencyPhone || supplier?.phone;
    },

    _getDeclinedReasonText(): string {
      const confirmation: IConfirmation = this.packageProductDescription.packageProduct.getLastConfirmation();
      return confirmation ? confirmation.declineReason : '';
    },
  }
};
</script>

<style>

</style>
