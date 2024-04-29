<script setup lang="ts">
import {useEventPermissionsService} from '~/service/helpers/event/event-permissions.service.factory';
import {PackageProduct} from '~/service/models/packageProduct';
import {useCurrentEvent} from '~/service/helpers/event/current-event.service.factory';
import {useCurrentEventStore} from '~/store/currentEvent';
import {usePackageSaver} from '~/service/helpers/package-builder/package-saver.service.factory';
import {
  usePackageConfirmationHelperService
} from '~/service/helpers/package-builder/package-confirmation-helper.service.factory';
import {useDataTemplateFabricService} from '~/service/helpers/data-templates/data-template-fabric.factory';
import {useEventPackageBuilder} from '~/service/helpers/package-builder/package-builder.service.factory';
import {
  useProductsToSelectDialogShowService
} from '~/service/dialog/package-tools/products-to-select-dialog-show.service';
import {useCurrentSupplier} from '~/service/helpers/supplier-common/current-supplier.factory';
import {useConfirmDialogShowService} from '~/service/dialog/confirm-dialog-show.service';
import {
  useAcceptDeclineProductDialogShowService
} from '~/service/dialog/product-tools/accept-decline-product-dialog-show.service';
import { useEventBookedHistoryService } from '~/service/helpers/event/event-booked-history.service.factory';
import {useGlobalElementsTemplateService} from '~/service/helpers/data-templates/global-elements-template.factory';


const currentEvent = useCurrentEvent();
const eventPermissionsService = useEventPermissionsService();
const currentEventStore = useCurrentEventStore();
const packageSaver = usePackageSaver();
const packageConfirmationHelper = usePackageConfirmationHelperService();
const dataTemplateFabric = useDataTemplateFabricService();
const packageBuilder = useEventPackageBuilder();
const productsToSelectDialogShowService = useProductsToSelectDialogShowService();
const currentSupplier = useCurrentSupplier();
const confirmDialogShowService = useConfirmDialogShowService();
const acceptDeclineProductDialogShowService = useAcceptDeclineProductDialogShowService();
const eventBookedHistoryService = useEventBookedHistoryService();
const globalElementsTemplateService = useGlobalElementsTemplateService();



const currentEventLoadedSubscription = currentEvent.afterCurrentEventLoadedAsObservable()
    .subscribe(() => fetchPermissions());


const beforeEventSaveSubscription = packageSaver.beforeCurrentPackageSaved(() => {
  vm.savePackageInProgress = true;
});


const afterEventSaveSubscription = packageSaver.afterCurrentPackageSaved(() => {
  vm.savePackageInProgress = false;
  fetchPermissions();
});


const currentPackageDataChangedSubscription = subscribeCurrentPackageDataChanged();
const currentEventBookedModeChangedSubscription = subscribeCurrentEventBookedModeChanged();


const unsubscribeList = [
  () => beforeEventSaveSubscription.unsubscribe(),
  () => afterEventSaveSubscription.unsubscribe(),
  () => currentEventLoadedSubscription.unsubscribe(),
  () => currentPackageDataChangedSubscription.unsubscribe(),
  () => currentEventBookedModeChangedSubscription(),
];


onMounted(() => {
  fetchPermissions();
  _getDataFromTemplate();
});


onUnmounted(() => unsubscribeList.forEach(s => s()))


const vm = reactive({
  canConfirmAnyProduct: false,
  savePackageInProgress: false,
  confirmProductLabel: '',
  isPackageChanged: packageSaver.isPackageChanged(),
  isHistoryBookedMode: eventBookedHistoryService.isHistoryBookedMode(),
});

const isButtonAvailable = computed(() => {
  if (vm.savePackageInProgress || vm.isPackageChanged) {
    return false;
  }

  if (vm.isHistoryBookedMode) {
    return false;
  }

  return vm.canConfirmAnyProduct;
});


function fetchPermissions(): void {
  vm.canConfirmAnyProduct = false;

  getProductsToConfirmForSupplier().forEach((packageProduct: PackageProduct) => {
    // console.log(packageProduct);
    const product = packageProduct.product;

    const additionalContext = {
      productType: product ? product.getType() : null,
      productStage: packageProduct.stage
    };

    const result = eventPermissionsService.hasPermission('packageProductFunctions.bookProduct', additionalContext);

    // console.log(result, currentEvent.has());

    vm.canConfirmAnyProduct = vm.canConfirmAnyProduct || (result && currentEvent.has());
  });
}


function getProductsToConfirmForSupplier(): Array<PackageProduct> {
  const currentPackage = currentEvent.getCurrentPackage();

  if (!currentPackage) {
    return [];
  }

  const supplierId = currentSupplier.getId();

  let products;

  if (supplierId) {
    products = currentPackage.getProductsForSupplier(supplierId);
  } else {
    products = currentPackage.productList
  }

  return products.filter((item: PackageProduct) => {
    return item.needConfirmation();
  });
}


function areCurrentChangesSaved(): boolean {
  return !vm.savePackageInProgress && !vm.isPackageChanged;
}


function getConfirmButtonLabel(): string {
  if (!packageConfirmationHelper.possibleToDeclineForPackage(packageBuilder.getPackage())) {
    return 'Update';
  }

  return vm.confirmProductLabel;
}


function _getDataFromTemplate() {
  const dataTemplate = dataTemplateFabric.get({name: 'event', notUpdateDefaultHeaderTemplate: true});

  vm.confirmProductLabel = dataTemplate.getValue('packagePageFunctions.bookProduct.label');
}


async function startConfirmProducts() {
  const productsToConfirm = getProductsToConfirmForSupplier();

  if (productsToConfirm.length === 1) {
    await openConfirmationDialog(productsToConfirm[0]);
  } else if (productsToConfirm.length > 1) {
    const result = await productsToSelectDialogShowService.show({data: {packageProducts: productsToConfirm}});

    if (!result) {
      return;
    }

    if (result.cancelled) {
      return;
    }

    return openConfirmationDialog(result.data);
  }
}


async function openConfirmationDialog(packageProduct: PackageProduct) {
  const onSaveSuccess = async () => {
    await currentEvent.reload();

    await packageBuilder.loadCurrent();

  };

  const onSaveError = async (error: any) => {
    const title = globalElementsTemplateService
        .getMessageFromDictionaryVariables('packageProductConfirmationErrorTitle');
    const message = globalElementsTemplateService
        .getMessageFromDictionaryVariables('packageProductConfirmationErrorMessage');

    const result = await confirmDialogShowService.show({title, data: {text: message}});

    if (result.cancelled) {
      return;
    }

    await currentEvent.reload();

    await packageBuilder.loadCurrent();
  };

  const data = {
    packageProduct: packageProduct
  };

  const result = await acceptDeclineProductDialogShowService.show({data});

  if (!result) {
    return;
  }

  if (result.cancelled) {
    return;
  }

  packageBuilder.processProductConfirmationResult(packageProduct, result.data);

  await packageSaver.savePackage(onSaveSuccess, onSaveError);
}


function subscribeCurrentPackageDataChanged() {
  return packageSaver.currentPackageChangedUpdated((value) => {
    vm.isPackageChanged = value;
  });
}


function subscribeCurrentEventBookedModeChanged() {
  return currentEventStore.$onAction(({name, after}) => {
    if (name !== 'setCurrentEventBookedMode' && name !== 'resetCurrentEventBookedMode') {
      return;
    }

    after(() => {
      vm.isHistoryBookedMode = eventBookedHistoryService.isHistoryBookedMode();
      vm.isPackageChanged = packageSaver.isPackageChanged();
    });
  });
}

</script>

<template>
  <ButtonMain class="package-confirmation-button"
          v-if="isButtonAvailable"
          v-show="!vm.savePackageInProgress"
          @click="startConfirmProducts()">
    {{ getConfirmButtonLabel() }}
  </ButtonMain>
</template>

<style lang="scss">

</style>
