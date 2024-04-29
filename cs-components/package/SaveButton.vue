<template>
  <button-main class="save-button"
               v-if="vm.canSavePackage"
               :disabled="vm.savePackageInProgress"
               :processing="vm.savePackageInProgress"
               :processing-text="'Saving...'"
               v-show="vm.isSaveButtonVisible"
               @click.native="saveClicked()">
    {{ getSavePackageLabel() }}
  </button-main>
</template>

<script setup lang="ts">
import {useEventPermissionsService} from "~/service/helpers/event/event-permissions.service.factory";
import {usePackageSaver} from "~/service/helpers/package-builder/package-saver.service.factory";
import {useCurrentEvent} from "~/service/helpers/event/current-event.service.factory";
import {useCustomerEvents} from "~/service/helpers/event/customer-events.service.factory";
import {useEventPackageBuilder} from "~/service/helpers/package-builder/package-builder.service.factory";
import {useConfirmDialogShowService} from "~/service/dialog/confirm-dialog-show.service";
import {useGlobalElementsTemplateService} from "~/service/helpers/data-templates/global-elements-template.factory";
import {useDataTemplateFabricService} from "~/service/helpers/data-templates/data-template-fabric.factory";
import {usePackageUpdateCommands} from "~/service/helpers/package-builder/package-update-commands.service.factory";
import {useHidingPriceService} from "~/service/helpers/pricing/hiding-price-service.factory";
import {useUserService} from "~/service/helpers/user-common/user-service.factory";
import {useCurrentEventStore} from "~/store/currentEvent";
import {useCurrentSavePackageStrategyStore} from "~/store/currentSavePackageStrategy";
import {PACKAGE_STRATEGY_TYPE_ACTIONS} from "~/service/helpers/package/package-strategy-type-actions";
import {useUiLockerService} from "~/service/helpers/ui-locker.service.factory";
import {
  eventEmitterFilter,
  eventEmitterObsFirstValueFrom
} from '~/service/models/event-emitter-observable-helpers';
import { CurrentEventInitStates } from '~/service/helpers/event/current-event.service';

const emits = defineEmits(['update:savePackageInProgress', 'update:saveButtonVisibility']);

const eventPermissionsService = useEventPermissionsService();
const packageSaver = usePackageSaver();
const currentEvent = useCurrentEvent();
const customerEvents = useCustomerEvents();
const packageBuilder = useEventPackageBuilder();
const confirmDialogShowService = useConfirmDialogShowService();
const globalElementsTemplateService = useGlobalElementsTemplateService();
const dataTemplateFabric = useDataTemplateFabricService();
const packageUpdateCommands = usePackageUpdateCommands();
const hidingPriceService = useHidingPriceService();
const userService = useUserService();
const router = useRouter();
const currentEventStore = useCurrentEventStore();
const currentSavePackageStrategy = useCurrentSavePackageStrategyStore();
const uiLockerService = useUiLockerService();


const vm = reactive({
  canSavePackage: false,
  isSaveButtonVisible: false,
  savePackageInProgress: false,

  savePackageLabelPackageNotSaved: undefined,
  savePackageLabelPackageSaved: undefined,

  packageSavingListener: undefined,
  eventChangesListener: undefined,
  packageUpdateCommandChangesListener: undefined,

  beforeCurrentPackageSavedListener: undefined,
  afterCurrentPackageSavedListener: undefined,

  needToHidePrices: true,
});


async function onInit() {
  currentEventStore.$onAction(({ name, after }) => {
    if (name !== 'setCurrentEventBookedMode' && name !== 'resetCurrentEventBookedMode') {
      return;
    }

    after(() => fetchPermissions());
  });

  fetchPermissions();

  vm.needToHidePrices = await hidingPriceService.needToHidePrices({isPackagePrice: true});

  initPackageSavingListener();
  initEventChangesListener();
  initPackageUpdateCommandChangesListener();
  initCurrentPackageSavedListeners();
  getDataFromTemplate();
  onSaveButtonVisibilityChange();
}

function onDestroy() {
  if (vm.packageSavingListener) {
    vm.packageSavingListener.unsubscribe();
    vm.packageSavingListener = undefined;
  }

  if (vm.eventChangesListener) {
    vm.eventChangesListener.unsubscribe();
    vm.eventChangesListener = undefined;
  }

  if (vm.packageUpdateCommandChangesListener) {
    vm.packageUpdateCommandChangesListener.unsubscribe();
    vm.packageUpdateCommandChangesListener = undefined;
  }

  if (vm.beforeCurrentPackageSavedListener) {
    vm.beforeCurrentPackageSavedListener.unsubscribe();
    vm.beforeCurrentPackageSavedListener = undefined;
  }

  if (vm.afterCurrentPackageSavedListener) {
    vm.afterCurrentPackageSavedListener.unsubscribe();
    vm.afterCurrentPackageSavedListener = undefined;
  }
}

function saveClicked() {
  const onSaveSuccess = async (eventId) => {
    uiLockerService.unlock();
    if (currentSavePackageStrategy.type !== PACKAGE_STRATEGY_TYPE_ACTIONS.updatePackage) {
      currentEvent.reload();

      await eventEmitterObsFirstValueFrom(currentEvent.currentEventInitDone()
          .pipe(eventEmitterFilter(value => value !== CurrentEventInitStates.no &&
              value !== CurrentEventInitStates.started)))
          .then(() => {
            if (currentEvent.has()) {
              packageBuilder.loadCurrent();
            }
          });
    }
  }

  const onSaveError = (error) => {
    uiLockerService.unlock();

    if (error) {
      console.error(error);
    }

    const title = 'Package saving error';
    const message = 'Sorry, something has been changed on the booking. Please refresh.';

    confirmDialogShowService.show({title, data: {text: message}})
      .then(() => {
        packageSaver.currentPackageChanged = false;
      });
  };

  uiLockerService.lock();
  packageSaver.savePackage(onSaveSuccess, onSaveError, { saveButton: true });
}

function isPackageChanged() {
  return packageSaver.isPackageChanged();
}

function isPackageSaved() {
  return currentEvent.has() && !!packageBuilder.getPackage() && !!packageBuilder.getPackage().getId();
}

function getSavePackageLabel() {
  if (vm.savePackageInProgress) {
    return 'Saving...';
  }

  if (vm.needToHidePrices && !isPackageSaved()) {
    return hidingPriceService.getPackageSaveButton();
  }

  return isPackageSaved() ? vm.savePackageLabelPackageSaved : vm.savePackageLabelPackageNotSaved;
}

function checkSaveButtonVisible() {
  if (!packageBuilder.has()) {
    return false;
  }

  return vm.canSavePackage && (isPackageChanged() || vm.savePackageInProgress);
}

function fetchPermissions() {
  vm.canSavePackage = eventPermissionsService.hasPermission('packagePageFunctions.savePackage', {});
  onSaveButtonVisibilityChange();
}

function initPackageSavingListener() {
  if (vm.packageSavingListener) {
    return;
  }

  vm.packageSavingListener = currentEvent.needToSaveCurrentPackage(() => {
    if (vm.canSavePackage && !vm.savePackageInProgress && isPackageChanged()) {
      saveClicked();
    }

    onSaveButtonVisibilityChange();
  });
}

function initEventChangesListener() {
  if (vm.eventChangesListener) {
    return;
  }

  vm.eventChangesListener = packageBuilder.onChanged((value) => {
    onSaveButtonVisibilityChange();
  });
}

function initPackageUpdateCommandChangesListener() {
  if (vm.packageUpdateCommandChangesListener) {
    return;
  }

  vm.packageUpdateCommandChangesListener = packageUpdateCommands.onChanged(() => {
    onSaveButtonVisibilityChange();
  });
}

function initCurrentPackageSavedListeners() {
  if (!vm.beforeCurrentPackageSavedListener) {
    vm.beforeCurrentPackageSavedListener =
      packageSaver.beforeCurrentPackageSaved(() => {
        vm.savePackageInProgress = true;
        emits('update:savePackageInProgress', vm.savePackageInProgress);
        onSaveButtonVisibilityChange();
      });
  }

  if (!vm.afterCurrentPackageSavedListener) {
    vm.afterCurrentPackageSavedListener =
      packageSaver.afterCurrentPackageSaved(() => {
        vm.savePackageInProgress = false;
        emits('update:savePackageInProgress', vm.savePackageInProgress);
        onSaveButtonVisibilityChange();
      });
  }
}

function getDataFromTemplate() {
  const dataTemplate = dataTemplateFabric.get({
    name: 'event',
    notUpdateDefaultHeaderTemplate: true,
  });

  vm.savePackageLabelPackageNotSaved = dataTemplate.getValue('packagePageFunctions.savePackage.labelPackageNotSaved');
  vm.savePackageLabelPackageSaved = dataTemplate.getValue('packagePageFunctions.savePackage.labelPackageSaved');
}

function onSaveButtonVisibilityChange() {
  vm.isSaveButtonVisible = checkSaveButtonVisible();
  emits('update:saveButtonVisibility', vm.isSaveButtonVisible);
}


await onInit();

onUnmounted(() => {
  onDestroy();
});
</script>

<style scoped>

</style>
