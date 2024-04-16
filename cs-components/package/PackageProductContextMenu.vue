<script setup lang="ts">
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useCurrentEvent} from '~/services/helpers/event/current-event.service.factory';
import {getDocumentSafe, getWindowSafe} from '~/services/helpers/browser/browser.helpers';
import {useEventPackageBuilder} from '~/services/helpers/package-builder/package-builder.service.factory';
import {usePackageSaver} from '~/services/helpers/package-builder/package-saver.service.factory';
import {
  useAcceptDeclineProductDialogShowService
} from '~/services/dialog/product-tools/accept-decline-product-dialog-show.service';
import {
  useAcceptProductCancellationDialogShowService
} from '~/services/dialog/product-tools/accept-product-cancellation-dialog-show.service';
import chilliLocalStorageService from '~/services/helpers/storage/chilli-local-storage.service';
import type {IPackageProductViewModel} from '~/services/helpers/package-builder/package-view-day.interface';
import type {IOpenContextMenuParams} from '~/services/helpers/context-menu-helper.service';
import type {
  IPackageProductContextMenuConfig
} from '~/services/helpers/package-builder/package-product-context-menu.service';
import {
  usePackageProductContextMenuService
} from '~/services/helpers/package-builder/package-product-context-menu.service.factory';
import {useContextMenuHelper} from '~/services/helpers/context-menu-helper.service.factory';
import {useLocationService} from '~/services/helpers/location.service.factory';
import {useCurrentSection} from '~/services/helpers/current-section.factory';
import {useCurrentSupplier} from '~/services/helpers/supplier-common/current-supplier.factory';
import {useCurrentUserStore} from '~/store/currentUser';
import {useRoutingHelper} from '~/services/helpers/routing-helper.fabric';
import ContextMenu from '~/components/context-menu/ContextMenu.vue';
import ContextMenuGroup from '~/components/context-menu/ContextMenuGroup.vue';
import ContextMenuItem from '~/components/context-menu/ContextMenuItem.vue';
import type {MenuOptions} from '~/components/context-menu/ContextMenuDefine';




export interface PackageProductContextMenuProps {
  packageProductDescription: IPackageProductViewModel;
  params?: IOpenContextMenuParams;
}


export interface PackageProductContextMenuVM {
  opened: boolean;
  contextMenuOptions: MenuOptions;
  contextMenuConfig: IPackageProductContextMenuConfig;
}


const packageProductContextMenuService = usePackageProductContextMenuService();
const currentUser = useCurrentUser();
const currentEvent = useCurrentEvent();
const document = getDocumentSafe();
const packageBuilder = useEventPackageBuilder();
const packageSaver = usePackageSaver();
const router = useRouter();
const acceptDeclineProductDialog = useAcceptDeclineProductDialogShowService();
const acceptProductCancellationDialog = useAcceptProductCancellationDialogShowService();
const contextMenuHelper = useContextMenuHelper();
const window = getWindowSafe();
const locationService = useLocationService();
const currentSection = useCurrentSection();
const currentSupplier = useCurrentSupplier();
const currentUserStore = useCurrentUserStore();
const routingHelper = useRoutingHelper();


const props = defineProps<PackageProductContextMenuProps>();

const vm = reactive<PackageProductContextMenuVM>({
  opened: false,
  contextMenuOptions: null,
  contextMenuConfig: null,
});


function openSupplierDetailsInNewTab(supplierId: string) {
  const url = `/supplier/${supplierId}/index/details`;

  window.open(url, '_blank');
}

function goToEvent(eventId: string, supplierId: string) {
  const url = `/supplier/${supplierId}/event/${eventId}/package`;

  chilliLocalStorageService.store('returnFromPackageUrl', router.currentRoute.value.fullPath);

  window.open(url, '_blank');
}

function init() {
  _initContextMenu();
  _subscribeOnCurrentCustomerChanged();
}

async function showAcceptDeclineProductDialog() {
  const data = {
    packageProduct: props.packageProductDescription.packageProduct,
  };

  const result = await acceptDeclineProductDialog.show({data});

  if (!result) {
    return;
  }

  if (result.cancelled) {
    return;
  }

  packageBuilder.processProductConfirmationResult(props.packageProductDescription.packageProduct, result.data);

  await _savePackage(true);
}

async function showAcceptProductCancellationDialog() {
  const supplier = props.packageProductDescription.packageProduct.getSupplier();

  const data = {
    costCurrency: props.packageProductDescription.packageProduct.money ?
        props.packageProductDescription.packageProduct.money.costCurrency : null,
    currencySymbol: supplier.currencySymbol,
  };

  const result = await acceptProductCancellationDialog.show({data});

  if (!result) {
    return;
  }

  if (result.cancelled) {
    return;
  }

  packageBuilder.acceptProductCancellation(props.packageProductDescription.packageProduct);
}

function showPackageProductDialog() {
  const categoryUrl = props.packageProductDescription.packageProduct.product.getCategoryUrl();
  const productId = props.packageProductDescription.packageProduct.product.getId();
  const section = currentSection.get();

  const locationName = props.packageProductDescription.packageProduct.getPackage().getLocation().name;
  const prepareLocationName = locationService.prepareLocationNameForUrl(locationName);


  let url: string;

  const currentUrl = unref(router.currentRoute).fullPath;
  if (currentUrl.indexOf('/my-events') !== -1) {
    url = `/my-events/package/${section}/in-${prepareLocationName}/do-${categoryUrl}/go-${productId}`;
  } else if (currentUrl.indexOf('/supplier') === 0) {
    url = `/supplier/${currentSupplier.getId()}/event/${currentEvent.getId()}/package/${section}/in-${prepareLocationName}/do-${categoryUrl}/go-${productId}`;
  }

  const queryParams = {
    ...(routingHelper.getCurrentCleanedQueryParams() ?? {}),
    'view-product': true,
    'view-product-mode': 'package'
  };

  const query = queryParamsToStr(queryParams);

  const urlWithQuery = `${url}?${query}`;
  window.open(urlWithQuery, '_blank');
}

function goToSupplierDetails(to: string | 'supplier' | 'supplierGroup') {
  let supplierId;

  if (to === 'supplier') {
    supplierId = vm.contextMenuConfig.supplier.id;
  } else if (to === 'supplierGroup') {
    supplierId = vm.contextMenuConfig.supplierGroup.id;
  }

  if (supplierId) {
    openSupplierDetailsInNewTab(supplierId);
  }
}

function goToSupplierEventView(to: string | 'supplier' | 'supplierGroup') {
  let supplierId;

  if (to === 'supplier') {
    supplierId = vm.contextMenuConfig.supplier.id;
  } else if (to === 'supplierGroup') {
    supplierId = vm.contextMenuConfig.supplierGroup.id;
  }

  const eventId = currentEvent.getId();

  if (eventId && supplierId) {
    goToEvent(eventId, supplierId);
  }
}

function openPhoneLink(to: string | 'customer' | 'supplier' | 'supplierGroup') {
  let phone;

  if (to === 'customer') {
    phone = vm.contextMenuConfig.customer.phone;
  } else if (to === 'supplier') {
    phone = vm.contextMenuConfig.supplier.phone;
  } else if (to === 'supplierGroup') {
    phone = vm.contextMenuConfig.supplierGroup.phone;
  }

  if (phone) {
    contextMenuHelper.openPhone(phone);
  }
}

function openEmergencyPhoneLink(to: string | 'supplier' | 'supplierGroup') {
  let emergencyPhone;

  if (to === 'supplier') {
    emergencyPhone = vm.contextMenuConfig.supplier.emergencyPhone;
  } else if (to === 'supplierGroup') {
    emergencyPhone = vm.contextMenuConfig.supplierGroup.emergencyPhone;
  }

  if (emergencyPhone) {
    contextMenuHelper.openPhone(emergencyPhone);
  }
}

function showCommsDialog(sendTo: string | 'customer' | 'supplier' | 'supplierGroup') {
  const queryParams: any = {
    eventId: currentEvent.getId(),
    section: currentEvent.getSection(),
    packageId: currentEvent.getCurrentPackage().getId(),
    productId: props.packageProductDescription.packageProduct.product.getId(),
  }

  const manager = currentEvent.getManager();

  if (manager?.id) {
    queryParams.managerId = manager.id;
  }

  const organiser = currentEvent.getOrganiser();

  if (organiser?.id) {
    queryParams.organiserId = organiser.id;
  }

  switch (sendTo) {
    case 'customer':
      queryParams.to = 'customer';
      queryParams.supplierId = vm.contextMenuConfig.supplier.bookByGroup && vm.contextMenuConfig.supplierGroup?.id ?
          vm.contextMenuConfig.supplierGroup.id : vm.contextMenuConfig.supplier.id;
      break;
    case 'supplier':
      queryParams.to = 'supplier';
      queryParams.supplierId = vm.contextMenuConfig.supplier.id;
      break;
    case 'supplierGroup':
      queryParams.to = 'supplier';
      queryParams.supplierId = vm.contextMenuConfig.supplierGroup.id;
      break;
    default:
      break;
  }

  const queryParamsStr = queryParamsToStr(queryParams);

  const url = `/admin/index/comms-dialog?${queryParamsStr}`;

  window.open(url, '_blank');
}

function openCustomerPhoneLink() {
  contextMenuHelper.openPhone(vm.contextMenuConfig.customer.phone);
}

function queryParamsToStr(queryParams: Record<string, any>): string {
  return Object.entries(queryParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

async function _initContextMenu() {
  vm.contextMenuConfig = await packageProductContextMenuService.getConfig(props.packageProductDescription);
}

function _isContextMenuEnabled(): boolean {
  if (!vm.contextMenuConfig) {
    return false;
  }
  return packageProductContextMenuService.isContextMenuEnabled();
}

async function _savePackage(needToReloadState?: boolean) {
  await packageSaver.savePackageForBuilder(needToReloadState);
}

function _subscribeOnCurrentCustomerChanged() {
  currentUserStore.$onAction(({name, after}) => {
    if (name !== 'set') {
      return;
    }

    after(() => _initContextMenu());
  });
}


onMounted(() => init());

watch(() => props.params, v => {
  if (!v) {
    return;
  }

  if (!_isContextMenuEnabled()) {
    return;
  }

  vm.opened = true;
  vm.contextMenuOptions = {
    ...(props.params as any),
    closeWhenScroll: false,
  };
}, {deep: true});
</script>

<template>
  <ContextMenu v-if="props.params" v-model:show="vm.opened" :options="vm.contextMenuOptions">
    <ContextMenuItem v-if="vm.contextMenuConfig?.canAcceptDecline"
                     label="Accept / Decline"
                     @click="showAcceptDeclineProductDialog()">
      <template #icon>
        <LazySvgIcon svg="check-circle"></LazySvgIcon>
      </template>
    </ContextMenuItem>

    <ContextMenuItem v-if="vm.contextMenuConfig?.canAcceptCancellation"
                     label="Accept Cancellation"
                     @click="showAcceptProductCancellationDialog()">
      <template #icon>
        <LazySvgIcon svg="remove-circle"></LazySvgIcon>
      </template>
    </ContextMenuItem>

    <ContextMenuItem v-if="vm.contextMenuConfig"
                     label="Product View"
                     @click="showPackageProductDialog()">
      <template #icon>
        <LazySvgIcon svg="eye"></LazySvgIcon>
      </template>
    </ContextMenuItem>

    <ContextMenuGroup v-if="vm.contextMenuConfig?.supplier" label="Supplier">
      <ContextMenuItem label="Details"
                       :disabled="!vm.contextMenuConfig?.supplier?.id"
                       @click="goToSupplierDetails('supplier')">
        <template #icon><LazySvgIcon svg="bus"/></template>
      </ContextMenuItem>

      <ContextMenuItem label="Event View"
                       :disabled="!vm.contextMenuConfig?.supplier?.canViewEvent"
                       @click="goToSupplierEventView('supplier')">
        <template #icon><LazySvgIcon svg="eye"/></template>
      </ContextMenuItem>

      <ContextMenuItem label="Email"
                       :disabled="!vm.contextMenuConfig?.supplier?.canSendComms"
                       @click="showCommsDialog('supplier')">
        <template #icon><LazySvgIcon svg="email"/></template>
      </ContextMenuItem>

      <ContextMenuItem :label="vm.contextMenuConfig?.supplier?.phone || 'No Phone'"
                       :disabled="!vm.contextMenuConfig?.supplier?.phone"
                       @click="openPhoneLink('supplier')">
        <template #icon><LazySvgIcon svg="phone"/></template>
      </ContextMenuItem>

      <ContextMenuItem :label="vm.contextMenuConfig?.supplier?.emergencyPhone || 'No Phone'"
                       :disabled="!vm.contextMenuConfig?.supplier?.emergencyPhone"
                       @click="openEmergencyPhoneLink('supplier')">
        <template #icon><LazySvgIcon svg="phone"/></template>
      </ContextMenuItem>

      <ContextMenuItem :label="vm.contextMenuConfig?.supplier?.isLoginUser ? 'CS5 User' : 'CS5 NON User'">
        <template #icon><LazySvgIcon svg="the-mark"/></template>
      </ContextMenuItem>
    </ContextMenuGroup>

    <ContextMenuGroup v-if="vm.contextMenuConfig?.supplierGroup" label="Supplier Group">
      <ContextMenuItem label="Details"
                       :disabled="!vm.contextMenuConfig?.supplierGroup?.id"
                       @click="goToSupplierDetails('supplierGroup')">
        <template #icon><LazySvgIcon svg="bus"/></template>
      </ContextMenuItem>

      <ContextMenuItem label="Email"
                       :disabled="!vm.contextMenuConfig?.supplierGroup?.canSendComms"
                       @click="showCommsDialog('supplierGroup')">
        <template #icon><LazySvgIcon svg="email"/></template>
      </ContextMenuItem>

      <ContextMenuItem :label="vm.contextMenuConfig?.supplierGroup?.phone || 'No Phone'"
                       :disabled="!vm.contextMenuConfig?.supplierGroup?.phone"
                       @click="openPhoneLink('supplierGroup')">
        <template #icon><LazySvgIcon svg="phone"/></template>
      </ContextMenuItem>

      <ContextMenuItem :label="vm.contextMenuConfig?.supplierGroup?.emergencyPhone || 'No Phone'"
                       :disabled="!vm.contextMenuConfig?.supplierGroup?.emergencyPhone"
                       @click="openEmergencyPhoneLink('supplierGroup')">
        <template #icon><LazySvgIcon svg="phone"/></template>
      </ContextMenuItem>

      <ContextMenuItem :label="vm.contextMenuConfig?.supplierGroup?.isLoginUser ? 'CS5 User' : 'CS5 NON User'">
        <template #icon><LazySvgIcon svg="the-mark"/></template>
      </ContextMenuItem>
    </ContextMenuGroup>

    <ContextMenuGroup v-if="vm.contextMenuConfig?.customer" label="Customer">
      <ContextMenuItem label="Email"
                       :disabled="!vm.contextMenuConfig?.customer?.canSendComms"
                       @click="showCommsDialog('customer')">
        <template #icon><LazySvgIcon svg="email"/></template>
      </ContextMenuItem>

      <ContextMenuItem :label="vm.contextMenuConfig?.customer?.phone || 'No Phone'"
                       :disabled="!vm.contextMenuConfig?.customer?.phone"
                       @click="openPhoneLink('customer')">
        <template #icon><LazySvgIcon svg="phone"/></template>
      </ContextMenuItem>
    </ContextMenuGroup>

  </ContextMenu>
</template>

<style scoped lang="scss">

</style>
