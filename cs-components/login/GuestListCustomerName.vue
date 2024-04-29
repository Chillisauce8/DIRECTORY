<template>
  <div>

    <div class="nowrap column center-start">
      <div v-if="!editInProgress">
        <span v-if="savePackageInProgress">
          {{ formData.updatedName ?? formData.name }}
        </span>

        <span class="select-customer" v-else-if="!savePackageInProgress && customerSelectionPossible"
              @click.stop="selectCurrentCustomer()">
          {{ formData.updatedName ?? formData.name }}
        </span>

        <span v-else> <LazySvgIcon svg="person" class="inline current-user-icon"/>
          {{ formData.updatedName ?? formData.name }}
        </span>
      </div>

      <form v-if="canEditName" v-show="editInProgress" @submit.prevent>
        <div class="input-container">
          <input name="name" type="text" v-model="formData.name"
                 @focus="v$?.name.$touch()" ref="nameInput"
                 @blur="cancelEditing()"
                 @keyup="handleKeyUp"
                 autocomplete="name"
                 v-restrict-pattern="testName">
          <CSError class="error text-color_error" :vuelidate-field="v$?.name"></CSError>
        </div>

        <LazySvgIcon svg="check-circle" class="inline" v-if="canEditName"
                 @mousedown="finishEditingStarted()"
                 @click.stop="finishEditing"
        ></LazySvgIcon>
      </form>

      <LazySvgIcon svg="edit" class="inline" v-if="canEditName && !editInProgress"
               @click.stop="startEditName()"></LazySvgIcon>

    </div>

    <div class="role">{{ customerSummary.role }}</div>
  </div>
</template>

<script lang="ts">
import { useCurrentUser } from '~/service/helpers/user-common/current-user.factory';
import { useCurrentEvent } from '~/service/helpers/event/current-event.service.factory';
import { useUserService } from '~/service/helpers/user-common/user-service.factory';
import { useEventPermissionsService } from '~/service/helpers/event/event-permissions.service.factory';
import { computed } from 'vue';
import type { Validation } from "@vuelidate/core";
import { useVuelidate} from "@vuelidate/core";
import { usePackageSaver } from "~/service/helpers/package-builder/package-saver.service.factory";
import { useCustomerEvents } from "~/service/helpers/event/customer-events.service.factory";
import { useCurrentCustomer } from "~/service/helpers/user-common/current-customer-service.factory";
import { useMessageService } from "~/service/helpers/message.factory";
import { nameUniqValidator, csUserNameValidator } from "~/utils/cs-form-validators";
import { minLength } from "@vuelidate/validators";
import { useCurrentUserStore } from "~/store/currentUser";
import {getValidationErrorMessage} from '~/utils/cs-form-validation-helpers';
import {testName} from '~/utils/test-name-helper';
import {vRestrictPattern} from '~/utils/directives/restrict-pattern.directive';


export default {
  directives: {restrictPattern: vRestrictPattern},
  props: ['customerSummary', 'guestList'],
  setup: function() {
    return {
      userService: useUserService(),
      currentUser: useCurrentUser(),
      currentUserStore: useCurrentUserStore(),
      currentCustomer: useCurrentCustomer(),
      currentEvent: useCurrentEvent(),
      eventPermissionsService: useEventPermissionsService(),
      packageSaver: usePackageSaver(),
      customerEvents: useCustomerEvents(),
      messageService: useMessageService(),
    };
  },
  data() {
    return {
      v$: undefined,
      patternMessage: 'Use full name (Firstname and Surname)',
      isNotUniqMessage: 'The name must be unique',
      formData: {
        name: '',
        updatedName: null,
      },
      canEditName: false,
      editInProgress: false,
      _finishEditingStarted: false,
      savePackageInProgress: false,
      beforeCurrentPackageSavedSubscription: undefined,
      afterCurrentPackageSavedSubscription: undefined,
      customerSelectionPossible: false
    };
  },
  beforeMount() {
    this.init();
  },
  beforeUpdate() {
    this.initData();
  },
  unmounted() {
    if (this.beforeCurrentPackageSavedSubscription) {
      this.beforeCurrentPackageSavedSubscription.unsubscribe();
    }

    if (this.afterCurrentPackageSavedSubscription) {
      this.afterCurrentPackageSavedSubscription.unsubscribe();
    }
  },
  methods: {
    testName,
    init() {
      this._initCustomerName();

      this.initData();

      this._initCurrentPackageSavedListeners();
      this.subscribeCurrentUserChanged();
    },
    initData() {
      this._initCustomerName();
      this._initCanEditName();
      this._initFormValidation();
      this.customerSelectionPossible = this._customerSelectionPossible();
    },
    onFormInputChange(event: InputEvent): void {
      const {name} = (event.target as any);

      if (this.v$.value?.[name]?.$dirty) {
        setTimeout(() => this.v$.value?.[name].$touch());
      }
    },

    isPossibleToGoToBookedPackageAsCustomer() {
      return this.currentUser.isStaffOrHiddenStaff();
    },

    async goToPackageAsCustomer() {
      await this.currentCustomer.load(this.customerSummary.customer.id);
      this.customerEvents.reload();
      await this.currentEvent.goToCurrentEvent();
    },

    _customerSelectionPossible(): boolean {
      const currentCustomerId = this.currentCustomer.getId();
      return this.currentUser.isStaffOrHiddenStaff() &&
        this.customerSummary.customer.id !== currentCustomerId;
    },

    isGuestVirtual(): boolean {
      return this.customerSummary.customer.id.indexOf('v_') === 0;
    },

    selectCurrentCustomer() {
      this.currentCustomer.load(this.customerSummary.customer.id)
        .then(() => {
          this.customerEvents.reload();
          this.currentEvent.goToCurrentEvent();
          this.customerSelectionPossible = this._customerSelectionPossible();
        });
    },

    handleKeyUp(event) {
      if (event.code === 'Enter') {
        this.finishEditingStarted();
        this.finishEditing();
      } else if (event.code === 'Escape') {
        this.cancelEditing();
      }
    },

    startEditName() {
      this.editInProgress = true;

      setTimeout(() => {
        this.$refs['nameInput'].focus();
      }, 100);
    },

    finishEditingStarted() {
      if (this.v$.$invalid) {
        return;
      }

      this._finishEditingStarted = true;
    },

    finishEditing() {
      if (!this._finishEditingStarted) {
        return;
      }

      const value = this.$refs['nameInput'].value;

      this.formData.name = value;
      this.formData.updatedName = value;

      this._finishEditingStarted = false;
      this.editInProgress = false;

      if (this.v$.$invalid) {
        let errorMessage = this.v$.name.$errors?.[0]?.$message;
        this._restoreName();
        this.messageService.showErrorMessage(errorMessage);
      }

      this.currentEvent.updateVirtualGuestName(this.customerSummary.customer.id, value)
        .then(() => {
          const subscription = this.currentEvent.afterCurrentEventLoaded(
            () => {
              subscription.unsubscribe();

              if (this.customerSummary.customer.id === this.currentUser.getId()) {
                const nameSplit = this.userService.splitFullName(value);

                const data = this.currentUser.getRawData();

                data.firstName = nameSplit.firstName;
                data.lastName = nameSplit.lastName;
                data.name = value;

                const roles = this.currentUser.getRoles();
                this.currentUser.set(data);
                this.currentUser.setRoles(roles);
              }

              this.formData.updatedName = null;

              this.messageService.showMessage('Guest name is updated');

            }
          );

          this.currentEvent.reload();
        });

      return false;
    },

    cancelEditing() {
      if (this._finishEditingStarted) {
        return;
      }

      if (!this.editInProgress) {
        return;
      }

      this._restoreName();
      this.editInProgress = false;
    },

    _restoreName() {
      this.formData.name = this.customerSummary.customer.name;
    },

    _initCustomerName() {
      if (this.formData.name) {
        return;
      }

      if (this.editInProgress) {
        return;
      }

      this.formData.name = this.customerSummary.customer.name;
    },

    _initCanEditName() {
      if (!this.isGuestVirtual()) {
        return;
      }

      this.canEditName = this.eventPermissionsService.hasPermission(
        'manageGuestFunctions.editVirtualGuest', {});
    },

    _initFormValidation() {
      if (!this.canEditName) {
        return;
      }

      if (this.v$) {
        return;
      }

      const nameList = this.guestList
        .filter(item => item.customer.id !== this.customerSummary.customer.id)
        .map(item => item.customer.name.toLowerCase());

      const formValidationRules = computed(() => ({
        name: {
          minLength: minLength(3),
          name: csUserNameValidator('Use full name (Firstname and Surname)'),
          nameUniq: nameUniqValidator(nameList, 'The name must be unique')
        }
      }));

      this.v$ = useVuelidate(formValidationRules, this.formData, {$autoDirty: true});
    },

    _initCurrentPackageSavedListeners() {
      this.beforeCurrentPackageSavedSubscription = this.packageSaver.beforeCurrentPackageSaved(() => {
        this.savePackageInProgress = true;
      });

      this.afterCurrentPackageSavedSubscription = this.packageSaver.afterCurrentPackageSaved(() => {
        this.savePackageInProgress = false;
      });
    },

    getErrorMessage(validation: Validation): string | null {
      return getValidationErrorMessage(validation);
    },

    subscribeCurrentUserChanged() {
      this.currentUserStore.$onAction(({name, after}) => {
        if (!['set'].includes(name)) {
          return;
        }

        after(() => {
          this.customerSelectionPossible = this._customerSelectionPossible();
        });
      });
    },
  }
}
</script>

<style>
  .current-user-icon {
    float: left !important;
    padding-right: 5px;
  }

  .error {
    font-size: 12px;
  }
</style>
