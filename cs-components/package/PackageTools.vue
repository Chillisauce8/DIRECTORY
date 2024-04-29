<template>

  <template v-if="!needShowToolsButton">
    <template v-for="func in possibleEventFunctions">
      <template v-for="button in func.buttons">
        <ButtonMain class="_2nd outline" @click.native="button.onClick">
          {{ button.longLabel || button.shortLabel }}
        </ButtonMain>

      </template>
    </template>
  </template>

  <template v-if="needShowToolsButton">
    <button-main class="_2nd outline" @click.native="showTools()">
      Tools
    </button-main>
  </template>
</template>

<script lang="ts">
import {usePermissionFunctionsService} from "~/service/helpers/event/permission-functions.service.factory";
import {useEventService} from "~/service/helpers/event/event.service.factory";
import {useCurrentEvent} from "~/service/helpers/event/current-event.service.factory";
import {useEventPermissionsService} from "~/service/helpers/event/event-permissions.service.factory";
import {usePackageSaver} from "~/service/helpers/package-builder/package-saver.service.factory";
import {useGlobalElementsTemplateService} from "~/service/helpers/data-templates/global-elements-template.factory";
import {useCurrentUser} from '~/service/helpers/user-common/current-user.factory';
import {useCurrentCustomer} from "~/service/helpers/user-common/current-customer-service.factory";
import {useEventPackageBuilder} from "~/service/helpers/package-builder/package-builder.service.factory";
import {useMessageService} from "~/service/helpers/message.factory";
import {useCsLodash} from "~/service/cs-lodash.factory";
import {useToolsDialogShowService} from "~/service/dialog/tools-dialog-show.service";
import { useCurrentEventStore } from "~/store/currentEvent";
import {useEditManagerDialogShowService} from '~/service/dialog/package-tools/edit-manager-dialog-show.service';
import type {EditManagerDialogResult} from '~/components/dialog/package-tools/EditManagerDialog.vue';
import type {DialogResult} from '~/service/dialog/core/dialog.typings';
import {useEditOrganiserDialogShowService} from '~/service/dialog/package-tools/edit-organiser-dialog-show.service';
import {
  useEditDiscountMarginDialogShowService
} from '~/service/dialog/package-tools/edit-discount-margin-dialog-show.service';
import {useSwapLocationDialogShowService} from '~/service/dialog/package-tools/swap-location-dialog-show.service';
import {useSwapEventTypeDialogShowService} from '~/service/dialog/package-tools/swap-event-type-dialog-show.service';
import {useAddBookingFormDialogShowService} from '~/service/dialog/package-tools/add-booking-form-dialog-show.service';
import {usePackageBookingNotifyService} from '~/service/helpers/package/package-booking-notify.service.factory';
import {
  eventEmitterObsFirstValueFrom
} from '~/service/models/event-emitter-observable-helpers';
import {useAdminAreaUrlBuilderService} from '~/service/helpers/admin-area-url-builder.service.factory';
import {getWindowSafe} from '~/service/helpers/browser/browser.helpers';
import {
  useEditPaymentDatesDialogShowService
} from '~/service/dialog/package-tools/edit-payment-dates-dialog-show.service';
import {useCustomerRefundDialogShowService} from '~/service/dialog/package-tools/customer-refund-dialog-show.service';
import {
  useAbortTransactionDialogShowService
} from '~/service/dialog/package-tools/abort-transaction-dialog-show.service';
import {
  useEditCustomerNotesDialogShowService
} from '~/service/dialog/package-tools/edit-customer-notes-dialog-show.service';
import {useEditStaffNotesDialogShowService} from '~/service/dialog/package-tools/edit-staff-notes-dialog-show.service';
import {useAddCreditNoteDialogShowService} from '~/service/dialog/package-tools/add-credit-note-dialog-show.service';
import {useEditFixedCustomerPriceDialogShowService} from '~/service/dialog/package-tools/edit-fixed-customer-price-dialog-show.service';
import {useEditDisplayPricesDialogShowService} from '~/service/dialog/package-tools/edit-display-prices-dialog-show.service';
import {useEditAutoTransactionsDialogShowService} from '~/service/dialog/package-tools/edit-auto-transactions-dialog-show.service';
import {PackageProduct} from '~/service/models/packageProduct';
import {useCancelBookingDialogShowService} from '~/service/dialog/package-tools/cancel-booking-dialog-show.service';
import {useEditCommissionDialogShowService} from '~/service/dialog/package-tools/edit-commission-dialog-show.service';
import {useMoveMoneyDialogShowService} from '~/service/dialog/package-tools/move-money-dialog-show.service';
import {useAddBankPaymentDialogShowService} from "~/service/dialog/payment/bank-payment-dialog-show.service";
import { useCurrentCustomerIdStore } from "~/store/currentCustomerId";
import {useConfirmDialogShowService} from '~/service/dialog/confirm-dialog-show.service';
import {useCustomerEvents} from '~/service/helpers/event/customer-events.service.factory';


interface EventFunctionEditManager {
  showDialog: () => Promise<DialogResult<EditManagerDialogResult>>;
  updateManager: (eventId: string, managerId: string) => Promise<any>;
  successMessageName: string;
  errorMessageName: string;
}


export default {
  name: "PackageTools",
  setup() {
    return {
      permissionFunctionsService: usePermissionFunctionsService(),
      eventService: useEventService(),
      currentEvent: useCurrentEvent(),
      currentEventStore: useCurrentEventStore(),
      eventPermissionsService: useEventPermissionsService(),
      packageSaver: usePackageSaver(),
      globalElementsTemplateService: useGlobalElementsTemplateService(),
      currentUser: useCurrentUser(),
      currentCustomer: useCurrentCustomer(),
      currentCustomerIdStore: useCurrentCustomerIdStore(),
      customerEvents: useCustomerEvents(),
      packageBuilder: useEventPackageBuilder(),
      messageService: useMessageService(),
      csLodash: useCsLodash(),
      router: useRouter(),
      packageBookingNotifyService: usePackageBookingNotifyService(),
      adminAreaUrlBuilderService: useAdminAreaUrlBuilderService(),
      toolsDialogShowService: useToolsDialogShowService(),
      editManagerDialogShowService: useEditManagerDialogShowService(),
      editOrganiserDialogShowService: useEditOrganiserDialogShowService(),
      editDiscountMarginDialogShowService: useEditDiscountMarginDialogShowService(),
      swapLocationDialogShowService: useSwapLocationDialogShowService(),
      swapEventTypeDialogShowService: useSwapEventTypeDialogShowService(),
      addBookingFormDialogShowService: useAddBookingFormDialogShowService(),
      editPaymentDatesDialogShowService: useEditPaymentDatesDialogShowService(),
      customerRefundDialogShowService: useCustomerRefundDialogShowService(),
      abortTransactionDialogShowService: useAbortTransactionDialogShowService(),
      editCustomerNotesDialogShowService: useEditCustomerNotesDialogShowService(),
      editStaffNotesDialogShowService: useEditStaffNotesDialogShowService(),
      addCreditNoteDialogShowService: useAddCreditNoteDialogShowService(),
      editFixedCustomerPriceDialogShowService: useEditFixedCustomerPriceDialogShowService(),
      editDisplayPricesDialogShowService: useEditDisplayPricesDialogShowService(),
      editAutoTransactionsDialogShowService: useEditAutoTransactionsDialogShowService(),
      cancelBookingDialogShowService: useCancelBookingDialogShowService(),
      editCommissionDialogShowService: useEditCommissionDialogShowService(),
      moveMoneyDialogShowService: useMoveMoneyDialogShowService(),
      bankPaymentDialog: useAddBankPaymentDialogShowService(),
      confirmDialogShowService: useConfirmDialogShowService(),
    }
  },
  data() {
    return {
      possibleEventFunctions: [],
      afterCurrentPackageChangedSubscription: undefined,
      currentCustomerIdStoreActionSubscription: undefined,
    }
  },
  computed: {
    needShowToolsButton() {
      const buttonsCount = (this.possibleEventFunctions ?? [])
        .map(f => f.buttons)
        .reduce((fullList, buttons) => fullList.concat(buttons ?? []), [])
        .length;

      return buttonsCount > 1;
    }
  },
  mounted() {
    this.init();
  },
  unmounted() {
    if (this.afterCurrentPackageChangedSubscription) {
      this.afterCurrentPackageChangedSubscription.unsubscribe();
    }

    if (this.currentCustomerIdStoreActionSubscription) {
      this.currentCustomerIdStoreActionSubscription();
    }
  },
  methods: {
    init() {
      this.initEventFunctions();

      this.currentEventStore.$onAction(({name, after}) => {
        if (!['setCurrentEventBookedMode'].includes(name)) {
          return;
        }

        after(() => {
          if (this.currentUser?.isCustomer()) {
            this.initEventFunctions();
          }
        });
      });

      this.afterCurrentPackageChangedSubscription =
          this.currentEvent.afterCurrentPackageChanged((value) => {
        if (value) {
          this.initEventFunctions();
        }
      });

      this.currentCustomerIdStoreActionSubscription =
          this.currentCustomerIdStore.$onAction(({name, after}) => {
        if (!['set', 'reset'].includes(name)) {
          return;
        }

        this.initEventFunctions();
      });
    },

    async showCustomerRefundDialog() {
      const BANK_PAYMENT_WAY = 'Bank';

      const result = await this.customerRefundDialogShowService.show();

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      const data = result.data;
      const isBankPayment = data.paymentWay === BANK_PAYMENT_WAY;

      try {
        await this.eventService.refundCustomer(this.currentEvent.getId(), isBankPayment, data);
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('moneyRefundError');
        this.messageService.showErrorMessage(message);

        console.error(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('moneyRefundSuccess');
      this._processResultSaves(message);
    },

    async showAbortTransactionDialog() {
      const result = await this.abortTransactionDialogShowService.show();

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      const data = result.data;

      try {
        await this.eventService.saveTransactionAborted(this.currentEvent.getId(), data);
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();
        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('transactionSetAbortError');
        this.messageService.showErrorMessage(message);
        console.error(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('transactionSetAbortSuccess');
      this._processResultSaves(message);
    },

    async showEditOrganiserDialog() {
      const result = await this.editOrganiserDialogShowService.show();

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      try {
        this.packageSaver.notifyBeforeCurrentPackageSaved();
        await this.eventService.updateEventOrganiser(this.currentEvent.getId(), result.data.selectedOrganiser.id);
        await this.customerEvents.reload();
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('editOrganiserError');
        this.messageService.showErrorMessage(message);

        console.error(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('editOrganiserSuccess');

      this._processResultSaves(message);
    },

    showEditManagerDialog() {
      if (!this.currentEvent.has()) {
        return;
      }

      const data = {
        selectedManager: this.currentEvent.getManager(),
        eventId: this.currentEvent.getId(),
        title: 'Edit Event Manager',
      };

      this.editManager({
        showDialog: () => this.editManagerDialogShowService.show({data}),
        updateManager: (eventId: string, managerId: string) => this.eventService.updateEventManager(eventId, managerId),
        successMessageName: 'editManagerSuccess',
        errorMessageName: 'editManagerError',
      });
    },

    showEditManagerAtBookingDialog() {
      if (!this.currentEvent.has()) {
        return;
      }

      const data = {
        selectedManager: this.currentEvent.getManagerAtBooking(),
        eventId: this.currentEvent.getId(),
        title: 'Edit Manager At Booking',
      };

      this.editManager({
        showDialog: () => this.editManagerDialogShowService.show({data}),
        updateManager: (eventId: string, managerId: string) => this.eventService.updateEventManagerAtBooking(eventId, managerId),
        successMessageName: 'editManagerAtBookingSuccess',
        errorMessageName: 'editManagerAtBookingError',
      });
    },

    async editManager(params: EventFunctionEditManager) {
      const {showDialog, updateManager, successMessageName, errorMessageName} = params;

      const showErrorMessage = () => {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables(errorMessageName);
        this.messageService.showErrorMessage(message);
      };

      const result = await showDialog();

      if (!result || result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        const data = await updateManager(this.currentEvent.getId(), result.data.selectedManager.id);

        if (data?.ok) {
          await this.customerEvents.reload();
        } else {
          return showErrorMessage();
        }
      } catch (e) {
        console.error(e);
        return showErrorMessage();
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables(successMessageName);
      this._processResultSaves(message);
    },

    async showMoveMoneyDialog() {
      const result = await this.moveMoneyDialogShowService.show();

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.updateEventMoveMoney(this.currentEvent.getId(), result.data);
        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('moveMoneySuccess');
        this._processResultSaves(message);
      } catch (e) {
        const eventAfter = new CustomEvent('afterCurrentPackageSaved', {cancelable: true});
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('moveMoneyError');
        this.messageService.showErrorMessage(message);
        console.error(message);
      }
    },

    async showEditPaymentDatesDialog() {

      const permissionsResult =
        this.eventPermissionsService.getPermission('packageToolFunctions.editPaymentDates',
          {}, {
            ignorePermissionYes: true
          });

      const data = {
        depositDueDate: this.currentEvent.getDepositDueDate(),
        balanceDueDate: this.currentEvent.getBalanceDueDate(),
        adjustmentDueDate: this.currentEvent.getAdjustmentDate(),
        permissions: permissionsResult?.permission,
      };

      const result = await this.editPaymentDatesDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.updateEventDueDates(this.currentEvent.getId(), {
          depositDueDate: result.data['depositDueDate'],
          balanceDueDate: result.data['balanceDueDate'],
          adjustmentDate: result.data['adjustmentDueDate'],
        });
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('editPaymentDatesError');
        this.messageService.showErrorMessage(message);
        console.error(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('editPaymentDatesSuccess');
      this._processResultSaves(message);
    },

    async showBookPackageDialog() {
      const showAndProcessDialog = async () => {
        const result = await this.addBookingFormDialogShowService.show();

        if (!result) {
          return;
        }

        if (result.cancelled) {
          return;
        }

        this.packageSaver.notifyBeforeCurrentPackageSaved();

        try {
          await this.eventService.bookWithoutPayment(this.currentEvent.getId(),
              this.currentEvent.getCurrentPackage().getId(), {});
        } catch (e) {
          this.packageSaver.notifyAfterCurrentPackageSaved();

          const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('packageBookingError');
          this.messageService.showErrorMessage(message);
          console.error(e);

          return;
        }

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('packageBookingSuccess');
        this._processResultSaves(message);

      };

      const event = this.packageBookingNotifyService.notifyBeforePackageBooking();

      if (event.defaultPrevented) {
        await eventEmitterObsFirstValueFrom(this.packageBookingNotifyService.onNeedBookPackage())
        await showAndProcessDialog();
      } else {
        await showAndProcessDialog();
      }
    },

    openViewEditDataPage() {
      if (!this.currentEvent.has()) {
        return;
      }

      const window = getWindowSafe();

      const {query} = this.router.currentRoute.value;

      const urlQueryParams = {
        customerId: query.customerId,
        packageId: query.packageId,
      };

      const href = window.location.origin + `/admin/view-event-data/${this.currentEvent.getId()}`;

      const queryString = Object.entries(urlQueryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const url = [href, queryString].filter(v => !!v).join('?');

      window.open(url, '_blank');
    },

    async showCancelBookingDialog() {
      const data: Array<any> = [];
      const productList =  this.currentEvent.getCurrentPackage().productList;

      const cancelProductPermissions = this._getCancelProductPermissions();

      productList.forEach((packageProduct: PackageProduct, index: number) => {
        if (cancelProductPermissions[index]) {
          data.push(this._getCancelBookingDialogConfigItem(packageProduct));
        }
      });

      const result = await this.cancelBookingDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.cancelBooking(this.currentEvent.getId(), result.data);
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('bookingCancelError');
        this.messageService.showErrorMessage(message);
        console.error(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('bookingCancelSuccess');
      this._processResultSaves(message);
    },

    async showSwapLocationDialog() {

      const location = this.currentEvent.getCurrentPackage().getLocation();

      const data = {
        locationId: location?.id ?? null,
      };

      const result = await this.swapLocationDialogShowService.show({data, hideOverflow: true});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.swapLocation(this.currentEvent.getId(),
          this.currentEvent.getCurrentPackage().getId(), {locationId: result.data.locationId});
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('swapLocationError');
        this.messageService.showErrorMessage(message);
        console.error(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('swapLocationSuccess');
      this._processResultSaves(message);
    },

    async showAddBankPaymentDialog() {
      const showAndProcessDialog = async () => {
        const result = await this.bankPaymentDialog.show({});

        if (result && !result.cancelled) {
          this.packageSaver.notifyAfterCurrentPackageSaved();
        }
      };

      const event = this.packageBookingNotifyService.notifyBeforePackageBooking();

      if (event.defaultPrevented) {
        await eventEmitterObsFirstValueFrom(this.packageBookingNotifyService.onNeedBookPackage())

        if (this.packageBuilder.getPackage().getPrice() === null) {
          return;
        }

        await showAndProcessDialog();
      } else {
        await showAndProcessDialog();
      }
    },

    async showEditCommissionDialog() {
      const data = this.currentEvent.getEvent().getCommission();

      const result = await this.editCommissionDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.updateCommission(this.currentEvent.getId(), result.data);

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('editCommissionSuccess');
        this._processResultSaves(message);
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('editCommissionError');
        this.messageService.showErrorMessage(message);
        console.error(e);
      }
    },

    async showEditAutomaticTransactionsAllowedDialog() {
      const data = {
        automaticTransactionsAllowed: this.currentEvent.isAutomaticTransactionsAllowed(),
      };

      const result = await this.editAutoTransactionsDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.updateAutomaticTransactionsAllowed(this.currentEvent.getId(), result.data);
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables(
          'automaticTransactionsError');
        this.messageService.showErrorMessage(message);
        console.error(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('automaticTransactionsSuccess');
      this._processResultSaves(message);
    },

    async showEditDiscountMarginDialog() {
      const result = await this.editDiscountMarginDialogShowService.show();

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.updateDiscountMargin(this.currentEvent.getId(), result.data);
      } catch (e) {
        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables(
          'discountMarginUpdateFail');
        this.messageService.showErrorMessage(message);
        console.log(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables(
        'discountMarginUpdateSuccess');
      this._processResultSaves(message);
    },

    async updateCalculations() {
      try {
        await this.eventService.updateCalculations(this.currentEvent.getId());
      } catch (e) {
        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables(
            'updateCalculationsFail');
        this.messageService.showErrorMessage(message);
        console.log(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables(
          'updateCalculationsSuccess');
      this._processResultSaves(message);
    },

    async showEditDisplayPricesDialog() {
      const data = {
        displayPrices: this.currentEvent.getDisplayPrices()
      };

      const result = await this.editDisplayPricesDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.updateDisplayPrices(this.currentEvent.getId(), result.data);
      } catch (e) {
        this.packageSaver.notifyAfterCurrentPackageSaved();

        const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('editDisplayPricesError');
        this.messageService.showErrorMessage(message);
        console.error(e);

        return;
      }

      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('editDisplayPricesSuccess');
      this._processResultSaves(message);
    },

    async showEditFixedCustomerPriceDialog() {
      const result = await this.editFixedCustomerPriceDialogShowService.show();

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      try {
        const customerData = result.data;
        await this.eventService.updateFixedPriceForCustomerList(this.currentEvent.getId(), customerData)
      } catch (e) {
        this.messageService.showErrorMessage('Customer fixed price wasn\'t updated');

        console.log(e);
      }

      this._processResultSaves('Customer fixed price was updated');

      this.packageSaver.notifyBeforeCurrentPackageSaved();
    },

    async showEditCustomerNoteDialog() {
      const data = {
        customerNote: this.packageBuilder.getPackage().getCustomerNote(),
        eventCustomerNote: this.packageBuilder.getPackage().getEventCustomerNote()
      };

      const result = await this.editCustomerNotesDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageSaver.notifyBeforeCurrentPackageSaved();

      try {
        await this.eventService.updateCustomerNotes(this.currentEvent.getId(), {
          packageId: this.packageBuilder.getPackage().getId(),
          ...(result.data)
        });
      } catch (e) {
        this.messageService.showErrorMessage(`Customer notes wasn't updated. Error: ${e}`);

        console.log(e);
        return;
      }

      this._processResultSaves('Customer notes was updated');
    },

    async showEditStaffNoteDialog() {
      const data = {
        staffNote: this.packageBuilder.getPackage().getStaffNote(),
        eventStaffNote: this.packageBuilder.getPackage().getEventStaffNote()
      };

      const result = await this.editStaffNotesDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      try {
        await this.eventService.updateStaffNotes(this.currentEvent.getId(), {
          packageId: this.packageBuilder.getPackage().getId(),
          ...(result?.data)
        });
      } catch (e) {
        this.messageService.showErrorMessage(`Staff notes wasn't updated. Error: ${e}`);

        console.log(e);
        return;
      }

      this._processResultSaves('Staff notes was updated');
    },

    async showAddCreditNoteDialog() {
      const result = await this.addCreditNoteDialogShowService.show();

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      const eventId = this.currentEvent.getId();
      const packageId = this.packageBuilder.getPackage().getId();

      await this.eventService.addCreditNote(eventId, packageId, result.data);

      this._processResultSaves('Done');
    },

    async showSwapEventTypeDialog() {
      const eventType = this.packageBuilder.getViewData().section;

      const result = await this.swapEventTypeDialogShowService.show({data: {eventType}});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      if (result.data === eventType) {
        return;
      }

      await this.eventService.swapEventType(this.currentEvent.getId(), result.data);

      this.currentEvent
        .afterCurrentEventLoaded( () => {
          const eventPath = this.currentEvent.getCurrentEventPath();

          this.router.push(eventPath);
        });

      this._processResultSaves('Done');
    },

    async deletePackage() {
      const title = this.globalElementsTemplateService.getMessageFromDictionaryVariables('deletePackageConfirmTitle');
      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('deletePackageConfirmMessage');

      const res = await this.confirmDialogShowService.show({title, data: {text: message}});

      if (!res || res.cancelled) {
        return;
      }

      const currentPackageId = this.currentEvent.getCurrentPackageId();
      const packageIdAfterDelete = this.currentEvent.getPackages()
          .filter(p => p.getId() !== currentPackageId)
          .map(p => p.getId())?.[0];

      this.currentEvent.afterCurrentPackageDeleted(async () => {
        if (!packageIdAfterDelete) {
          console.log('redirect reason - no current package')
          return this.router.push({path: '/'});
        }

        await this.currentEvent.reload();

        this.currentEvent.setCurrentPackageById(packageIdAfterDelete);
        await this.currentEvent.setCurrentPackageIdToUrl();
      });

      this.currentEvent.deleteCurrentPackage();
    },

    async copyPackage() {
      const title = this.globalElementsTemplateService.getMessageFromDictionaryVariables('copyPackageConfirmTitle');
      const message = this.globalElementsTemplateService.getMessageFromDictionaryVariables('copyPackageConfirmMessage');

      const dialogResult = await this.confirmDialogShowService.show({title, data: {text: message}});

      if (!dialogResult || dialogResult.cancelled) {
        return;
      }

      const subscription = this.currentEvent.afterPackageCreated(async (res: {packageId?: string, errorMessage?: string}) => {
        subscription?.unsubscribe();

        await this.currentEvent.reload();

        if (res?.packageId) {
          this.currentEvent.setCurrentPackageById(res.packageId);
          const currentPackage = this.currentEvent.getCurrentPackage();
          await this.packageBuilder.setPackage(currentPackage);
          await this.currentEvent.setCurrentPackageIdToUrl();
        }
      });

      this.currentEvent.cloneCurrentPackage();
    },

    getPossiblePermissions() {
      const list = [
        this.getEditManagerPermissionName(),
        this.getEditManagerAtBookingPermissionName(),
        this.getEditOrganiserPermissionName(),
        this.getMoveMoneyPermissionName(),
        this.getCustomerRefundPermissionName(),
        this.getAbortTransactionPermissionName(),
        this.getEditPaymentDatesPermissionName(),
        this.getAddBookingFormPermissionName(),
        this.getViewDataPermissionName(),
        this.getCancelBookingPermissionName(),
        this.getSwapLocationPermissionName(),
        this.getAddBankPaymentPermissionName(),
        this.getEditCommissionPermissionName(),
        this.getAutomaticTransactionsPermissionName(),
        this.getEditDiscountMarginPermissionName(),
        this.getUpdateCalculationsPermissionName(),
        this.getEditDisplayPricesPermissionName(),
        this.getEditCustomerFixedPriceName(),
        this.getAddCustomerNoteName(),
        this.getAddStaffNoteName(),
        this.getAddCreditNotePermissionName(),
        this.getSwapEventTypePermissionName(),
      ];

      return this.csLodash.compact(list);
    },

    getEditManagerPermissionName() {
      return 'editManager';
    },

    getEditManagerAtBookingPermissionName() {
      return 'editManagerAtBooking';
    },

    getEditOrganiserPermissionName() {
      return 'editOrganiser';
    },

    getMoveMoneyPermissionName() {
      return 'moveMoney';
    },

    getCustomerRefundPermissionName() {
      return 'customerRefund';
    },

    getAbortTransactionPermissionName() {
      return 'abortTransaction';
    },

    getEditPaymentDatesPermissionName() {
      return 'editPaymentDates';
    },

    getAddBookingFormPermissionName() {
      if (!this.currentEvent.getEvent()) {
        return null;
      }

      return 'addBookingForm';
    },

    getViewDataPermissionName() {
      return 'viewData';
    },

    getEditDiscountMarginPermissionName() {
      return 'discountMargin';
    },

    getUpdateCalculationsPermissionName() {
      return 'updateCalculations';
    },

    _getCancelProductPermissions() {
      if (!this.currentEvent.has() || !this.currentEvent.getCurrentPackage() ||
        !this.currentEvent.getCurrentPackage().productList || !this.currentEvent.getCurrentPackage().productList.length) {
        return [];
      }

      const result = [];

      this.currentEvent.getCurrentPackage().productList.forEach((packageProduct) => {
        const cancelledProductStages = ['Pending Cancellation', 'Cancelled'];

        result.push(cancelledProductStages.indexOf(packageProduct.stage) === -1);
      });

      return result;
    },

    getCancelBookingPermissionName() {
      const results = this._getCancelProductPermissions();
      return this.csLodash.some(results, (result) => result === true) ? 'cancelBooking' : null;
    },

    getEditCustomerFixedPriceName() {
      if (!this.currentEvent.isBooked()) {
        return null;
      }

      return 'fixedCustomerPrice';
    },

    getAddCustomerNoteName() {
      return 'addCustomerNote';
    },

    getAddStaffNoteName() {
      return 'addStaffNote';
    },

    getSwapLocationPermissionName() {
      return 'swapLocation';
    },

    getAddBankPaymentPermissionName() {
      if (!this.currentEvent.getEvent()) {
        return null;
      }

      return 'addBankPayment';
    },

    getEditCommissionPermissionName() {
      if (!this.currentEvent.getEvent() || !this.currentEvent.getEvent().getCommission()) {
        return null;
      }

      return 'editCommission';
    },

    getAutomaticTransactionsPermissionName() {
      if (!this.currentEvent.getEvent()) {
        return null;
      }

      return 'automaticTransactions';
    },

    getEditDisplayPricesPermissionName() {
      if (!this.currentEvent.getEvent()) {
        return null;
      }

      return 'displayPrices';
    },

    getAddCreditNotePermissionName() {
      return 'addCreditNote';
    },

    getSwapEventTypePermissionName() {
      return 'swapEventType';
    },

    getButtonClick(permissionName) {
      switch (permissionName) {
        case 'editManager':
          return () => this.showEditManagerDialog();
        case 'editManagerAtBooking':
          return () => this.showEditManagerAtBookingDialog();
        case 'editOrganiser':
          return () => this.showEditOrganiserDialog();
        case 'moveMoney':
          return () => this.showMoveMoneyDialog();
        case 'customerRefund':
          return () => this.showCustomerRefundDialog();
        case 'abortTransaction':
          return () => this.showAbortTransactionDialog();
        case 'editPaymentDates':
          return () => this.showEditPaymentDatesDialog();
        case 'addBookingForm':
          return () => this.showBookPackageDialog();
        case 'viewData':
          return () => this.openViewEditDataPage();
        case 'cancelBooking':
          return () => this.showCancelBookingDialog();
        case 'swapLocation':
          return () => this.showSwapLocationDialog();
        case 'addBankPayment':
          return () => this.showAddBankPaymentDialog();
        case 'editCommission':
          return () => this.showEditCommissionDialog();
        case 'automaticTransactions':
          return () => this.showEditAutomaticTransactionsAllowedDialog();
        case 'discountMargin':
          return () => this.showEditDiscountMarginDialog();
        case 'updateCalculations':
          return () => this.updateCalculations();
        case 'displayPrices':
          return () => this.showEditDisplayPricesDialog();
        case 'fixedCustomerPrice':
          return () => this.showEditFixedCustomerPriceDialog();
        case 'addCustomerNote':
          return () => this.showEditCustomerNoteDialog();
        case 'addStaffNote':
          return () => this.showEditStaffNoteDialog();
        case 'addCreditNote':
          return () => this.showAddCreditNoteDialog();
        case 'swapEventType':
          return () => this.showSwapEventTypeDialog();
        default:
          return null;
      }
    },

    initEventFunctions() {
      const possiblePermissions = this.getPossiblePermissions();

      const functionsParameters = {
        possiblePermissions: possiblePermissions,
        permissionsGroup: 'packageToolFunctions',
        functionGetButtonClick: this.getButtonClick.bind(this)
      };

      this.possibleEventFunctions =
        this.permissionFunctionsService.createFunctionsOrderedArray(functionsParameters);

      const currentPackageId = this.currentEvent.getCurrentPackageId();
      const hasDeletePackagePermission = this.eventPermissionsService.hasPermission('eventHomeFunctions.deletePackage', {});
      const hasCopyPackagePermission = this.eventPermissionsService.hasPermission('eventHomeFunctions.copyPackage', {});

      if (hasDeletePackagePermission && currentPackageId) {
        this.possibleEventFunctions.push({
          name: 'deletePackage',
          buttons: [{
            onClick: this.deletePackage.bind(this),
            shortLabel: 'Delete Package',
            longLabel: 'Delete Package',
          }],
        });
      }

      if (hasCopyPackagePermission && currentPackageId) {
        this.possibleEventFunctions.push({
          name: 'copyPackage',
          buttons: [{
            onClick: this.copyPackage.bind(this),
            shortLabel: 'Copy Package',
            longLabel: 'Copy Package',
          }],
        });
      }
    },

    async showTools() {
      await this.toolsDialogShowService.show({
        data: {
          title: 'Package tools',
          tools: this.possibleEventFunctions,
        },
      });
    },

    _processResultSaves(message: string) {
      this.currentEvent.reload();
      const sub = this.currentEvent
        .afterCurrentEventLoaded(async () => {
          await this.packageBuilder.loadCurrent();

          this.packageSaver.notifyAfterCurrentPackageSaved();
          this.messageService.showMessage(message);

          sub.unsubscribe();
        });
    },
    _getCancelBookingDialogConfigItem(packageProduct: PackageProduct): any {
      const supplier = packageProduct.getSupplier();

      let exchangeRate = packageProduct.product.getPriceCalculator()
          .getExchangeRate(supplier.currencyName);

      if (packageProduct.money) {
        exchangeRate = packageProduct.money.exchangeRate;
      }

      return {
        itineraryId: packageProduct.itineraryId,
        productName: packageProduct.product.getOriginalName(),
        date: packageProduct.date,
        startTime: packageProduct.startTime,
        supplierName: supplier.name,
        costCurrency: packageProduct.money ? packageProduct.money.costCurrency : null,
        currencySymbol: supplier.currencySymbol,
        exchangeRate: exchangeRate,
        priceGBP: packageProduct.money ? packageProduct.money.priceGBP : null
      };
    }
  }
}
</script>

<style>

</style>
