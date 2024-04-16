<template>
  <aside class="the-basket" :class="[basketClass, hide ? 'hide' : '']">
    <div
      class="glass"
      @click="basketStore.toggle()"
      :class="[basketClass]">

      <div class="web-package-controls" v-if="canShowWebPackageOptions()">
        <div class="controls-title">Web Package Options</div>
        <ButtonSelect :disabled="false" :options='["", "Gold", "Silver", "Bronze"]'
                      :value="currentWebPackageMedal"
                      @update:value="onWebPackageMedalUpdated"/>
        <ButtonMain text="Delete" class="transparent" v-if="currentWebPackageId" @click="deleteWebPackage"/>
        <ButtonMain text="Update" class="black" @click="updateWebPackage" v-if="currentWebPackageId"/>
        <ButtonMain text="Save As New" class="beautiful-green" @click="saveAsWebPackage"/>
      </div>
    </div>

    <div class="basket Row" :class="basketClass">
      <LazySvgIcon svg="chevron-left"
               class="basket-toggle"
               @click.native="basketStore.toggle()"
               :class="basketClass"
               />

      <div class="package">
        <EditBasketItemsMessage/>

        <LazyAPackage class="basket-package" :useCurrent="true" title="Package" display="basket-package"
                      :showEmptyBasket="true" v-if="vm.mayRenderPackage">
          <template v-slot:margins>
            <div class="margins">
              <span class="package-price" v-if="getPackagePrice()">{{ getPackagePrice() }}</span>
              <span class="margin" v-if="getPackageMarkUpAmount()">{{ getPackageMarkUpAmount() }}</span>
              <span class="percent" v-if="getPackageMarkUpPercent()">{{ getPackageMarkUpPercent() }}</span>
            </div>
          </template>

          <template v-slot:main-buttons>
        
            <button-main class="black add-more button-compact" @click.native="addMoreClicked()"
                         text="Add More" icon="arrow-left"
                         :disabled="vm.savePackageInProgress"
                         v-if="vm.canAddProduct && !isProductsCountLimitReached()">
            </button-main>

            <button-main class="save button-compact" @click.native="saveClicked()"
                         :processing="vm.savePackageInProgress"
                         :disabled="vm.savePackageInProgress || !packageSaver.isPackageChanged()">
              <div>Save / Get Prices</div>
            </button-main>

          </template>
        </LazyAPackage>
        
        <SaveBasketMessage/>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import {PackageQueryParams} from "~/services/helpers/package-builder/package-url-query-params";
import {useEventPackageBuilder} from "~/services/helpers/package-builder/package-builder.service.factory";
import {useLocationService} from "~/services/helpers/location.service.factory";
import {usePackageSaver} from "~/services/helpers/package-builder/package-saver.service.factory";
import {useCustomerEvents} from "~/services/helpers/event/customer-events.service.factory";
import {useCurrentEvent} from "~/services/helpers/event/current-event.service.factory";
import {useGlobalElementsTemplateService} from "~/services/helpers/data-templates/global-elements-template.factory";
import {useBasketStore} from '~/store/basket';
import { useCurrentCustomerIdStore } from "~/store/currentCustomerId";
import { useEventPermissionsService } from "~/services/helpers/event/event-permissions.service.factory";
import { useSettingsTemplateService } from "~/services/helpers/data-templates/settings-template.factory";
import { useMessageService } from "~/services/helpers/message.factory";
import {useDataTemplatesStore} from "~/store/dataTemplates";
import {useUiLockerService} from "~/services/helpers/ui-locker.service.factory";
import {useConfirmDialogShowService} from "~/services/dialog/confirm-dialog-show.service";
import {PACKAGE_STRATEGY_TYPE_ACTIONS} from "~/services/helpers/package/package-strategy-type-actions";
import {useCurrentSavePackageStrategyStore} from "~/store/currentSavePackageStrategy";
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useWebPackagesService} from "~/services/helpers/package/web-packages.service.factory";
import {useCurrentSection} from "~/services/helpers/current-section.factory";
import {useInputNameDialogShowService} from "~/services/dialog/input-name-dialog-show.service";
import {useCurrentWebPackageStore} from "~/store/currentWebPackage";
import {useYesNoDialogShowService} from "~/services/dialog/yes-no-dialog-show.service";


const packageBuilder = useEventPackageBuilder();
const locationService = useLocationService();
const packageSaver = usePackageSaver();
const customerEvents = useCustomerEvents();
const currentEvent = useCurrentEvent();
const globalElementsTemplateService = useGlobalElementsTemplateService();
const basketStore = useBasketStore();
const currentCustomerIdStore = useCurrentCustomerIdStore();
const eventPermissionsService = useEventPermissionsService();
const settingsTemplateService = useSettingsTemplateService();
const messageService = useMessageService();
const uiLockerService = useUiLockerService();
const confirmDialogShowService = useConfirmDialogShowService();
const currentSavePackageStrategyStore = useCurrentSavePackageStrategyStore();
const router = useRouter();
const dataTemplatesStore = useDataTemplatesStore();
const currentUser = useCurrentUser();
const webPackageService = useWebPackagesService();
const currentSection = useCurrentSection();
const inputNameDialogShowService = useInputNameDialogShowService();
const currentWebPackageStore = useCurrentWebPackageStore();
const yesNoDialogShowService = useYesNoDialogShowService();


const vm = reactive({
  open: false,
  canAddProduct: false,
  hasEditWebPackagesPermission: false,
  savePackageInProgress: false,
  totalProductsCount: packageBuilder.getPackage()?.getNotCancelledProducts().length || 0,
  maxProductsCount: undefined,
  packageChangedSubscription: undefined,
  mayRenderPackage: false,
});


let {
  id: currentWebPackageId,
  medal: currentWebPackageMedal,
} = storeToRefs(currentWebPackageStore)


if (!packageBuilder.isEmpty()) {
  await dataTemplatesStore.fetch({templateName: 'event'});
  vm.mayRenderPackage = true;
} else {
  basketStore.$onAction(async ({name, after}) => {
    if (!vm.mayRenderPackage) {
      await dataTemplatesStore.fetch({templateName: 'event'});
      vm.mayRenderPackage = true;
    }
  });
}


const opened = computed(() => {
  return basketStore.opened;
});

const hide = computed(() => {
  return basketStore.hidden;
});

const basketClass = computed(() => {
  if (basketStore.opened === undefined) {
    return undefined;
  }

  return basketStore.opened ? 'open' : 'closed';
});

function addMoreClicked() {
  if (vm.totalProductsCount === (vm.maxProductsCount - 1)) {
    const message = globalElementsTemplateService
        .getMessageFromDictionaryVariables('productCountLimitReached', {
          totalProductsCount: vm.totalProductsCount,
          maxProductsCount: vm.maxProductsCount
        });

    messageService.showErrorMessage(message);
  }

  const section = packageBuilder.getPackage().getSection();
  const locationName = packageBuilder.getPackage().getLocation().name;

  const prepareLocationName = locationService.prepareLocationNameForUrl(locationName);

  basketStore.close();

  const path = unref(router.currentRoute).path;

  if (path.startsWith('/my-events/package/add-product')) {
    router.push({path: `/my-events/package/add-product/${section}/in-${prepareLocationName}`,
      query: {...unref(router.currentRoute).query,
        [PackageQueryParams.packageCreating]: 'true'}});
  } else if (path.startsWith('/my-events/add-package')) {
    router.push({path: `/my-events/add-package/${section}/in-${prepareLocationName}`,
      query: {...unref(router.currentRoute).query,
        [PackageQueryParams.packageCreating]: 'true'}});
  } else {
    router.push({
      path: `/${section}/in-${prepareLocationName}`,
      query: {
        ...unref(router.currentRoute).query,
        [PackageQueryParams.packageCreating]: 'true'
      }
    });
  }
}

async function saveClicked() {
  const onSaveSuccess = async (eventId, packageId) => {
    vm.savePackageInProgress = false;

    await customerEvents.reload();

    await currentEvent.goToCurrentEvent(false);
    uiLockerService.unlock();
  }

  const onSaveError = (error, needRefresh=true) => {
    uiLockerService.unlock();
    vm.savePackageInProgress = false;

    if (error) {
      console.error(error);
    }

    if (needRefresh) {
      const title = 'Package saving error';
      const message = 'Sorry, something has been changed on the booking. Please refresh.';

      confirmDialogShowService.show({title, data: {text: message}})
          .then(() => {
            packageSaver.currentPackageChanged = false;
          });
    }
  };

  vm.savePackageInProgress = true;

  const query = unref(router.currentRoute).query;

  if (query['add-package']) {
    await currentSavePackageStrategyStore.set({type: PACKAGE_STRATEGY_TYPE_ACTIONS.createPackage});
  }

  if (!query['eventId']) {
    await currentSavePackageStrategyStore.set({type: PACKAGE_STRATEGY_TYPE_ACTIONS.createEvent});
  }

  uiLockerService.lock();

  try {
    await packageSaver.savePackage(onSaveSuccess, onSaveError, {saveButton: true});
  } finally {
    uiLockerService.unlock();
    vm.savePackageInProgress = false;
  }
}

function getPermissions() {
  vm.canAddProduct = eventPermissionsService.hasPermission('packagePageFunctions.addProduct', {});
  vm.hasEditWebPackagesPermission = eventPermissionsService.hasPermission('websiteArea.editWebPackages', {});
}

function getTemplateData() {
  vm.maxProductsCount = settingsTemplateService.getMaxProducts();
}

function subscribePackageChanged() {
  vm.packageChangedSubscription = packageBuilder.onChanged((value) => {
    if (value) {
      getPermissions();

      vm.totalProductsCount =
          packageBuilder.getPackage()?.getNotCancelledProducts().length || 0;
    }
  });
}

function unsubscribeAll() {
  if (vm.packageChangedSubscription) {
    vm.packageChangedSubscription.unsubscribe();
  }
}


function isProductsCountLimitReached() {
  return vm.totalProductsCount >= vm.maxProductsCount;
}

function getPackageMarkUpAmount() {
  if (!currentUser.isStaffOrHiddenStaff()) {
    return '';
  }

  const packageData = packageBuilder.getViewData();

  if (!packageData?.markUp) {
    return '';
  }

  return packageData.markUp.amount;
}


function getPackageMarkUpPercent() {
  if (!currentUser.isStaffOrHiddenStaff()) {
    return '';
  }

  const packageData = packageBuilder.getViewData();

  if (!packageData?.markUp) {
    return '';
  }

  return packageData.markUp.percent;
}


function getPackagePrice() {
  if (!currentUser.isStaffOrHiddenStaff()) {
    return '';
  }

  const packageData = packageBuilder.getViewData();

  if (!packageData) {
    return null;
  }

  if (packageData.price === null) {
    return null;
  }

  return Math.round(packageData.price - packageData.discount);
}


function onWebPackageMedalUpdated(value) {
  currentWebPackageMedal.value = value;
}

async function saveAsWebPackage() {
  const yesNoDialogConfig = {
    title: 'Create new web package',
    text: 'Do you want to create new web package?',
  };

  const dialogResult = await yesNoDialogShowService.show({
    closeOnNavigation: true,
    data: yesNoDialogConfig,
  });

  if (!dialogResult?.data || dialogResult.cancelled) {
    return;
  }

  const eventPackage = packageBuilder.getPackage();
  try {
    const result = await webPackageService.createWebPackage(eventPackage, currentSection.get(),
        currentWebPackageMedal.value);
    currentWebPackageStore.set(result._doc, currentWebPackageMedal.value);
    messageService.showMessage('Web Package saved');
  } catch(ex) {
    console.log(ex);
    messageService.showErrorMessage('Web Package saving error');
  }
}


async function updateWebPackage() {
  const yesNoDialogConfig = {
    title: 'Update new web package',
    text: 'Do you want to update new web package?',
  };

  const dialogResult = await yesNoDialogShowService.show({
    closeOnNavigation: true,
    data: yesNoDialogConfig,
  });

  if (!dialogResult?.data || dialogResult.cancelled) {
    return;
  }

  const eventPackage = packageBuilder.getPackage();
  try {
    const result = await webPackageService.updateWebPackage(currentWebPackageId.value, eventPackage,
        currentSection.get(), currentWebPackageMedal.value);
    currentWebPackageStore.set(result._doc, currentWebPackageMedal.value);
    messageService.showMessage('Web Package updated');
  } catch(ex) {
    console.log(ex);
    messageService.showErrorMessage('Web Package updating error');
  }
}


async function deleteWebPackage() {
  const yesNoDialogConfig = {
    title: 'Delete Web Package',
    text: 'Do you want to delete a web package?',
  };

  const dialogResult = await yesNoDialogShowService.show({
    closeOnNavigation: true,
    data: yesNoDialogConfig,
  });

  if (!dialogResult?.data || dialogResult.cancelled) {
    return;
  }

  try {
    await webPackageService.deleteWebPackage(currentWebPackageId.value);
    packageBuilder.clear();
    messageService.showMessage('Web Package deleted');
  } catch(ex) {
    console.log(ex);
    messageService.showErrorMessage('Web Package deleting error');
  }
}

function canShowWebPackageOptions() {
  return vm.hasEditWebPackagesPermission && !!packageBuilder.getPackage();
}


onBeforeMount(() => {
  getTemplateData();
  getPermissions();
  subscribePackageChanged();
});


onUnmounted(() => {
  unsubscribeAll();
});

</script>

<style lang="scss">
$basket-bg: radial-gradient(circle, rgba(1,127,150,1) 0%, rgba(1,101,120,1) 35%, rgba(1,47,56,1) 100%);
$basket-bg: radial-gradient(circle, rgb(0, 72, 87) 0%, rgb(0, 47, 56) 35%, rgb(0, 20, 24) 100%);

.the-basket {
  &.hide {
    opacity: 0;
  }
  & .glass {
    @include frosted-glass-light();
    //   background-color: pink;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 99;
    transform: translateX(-100%);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    &.open {
      animation: open-glass 1s ease 1s both;
    }
    &.closed {
      animation: close-glass 1s ease 1s both;
    }
    .web-package-controls{
      background: white;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      .controls-title{
        font-size: 20px;
        font-weight:700;
      }
      button{
        margin: 20px;
      }

    }
  }

  & .basket {
    position: fixed;
    z-index: 100;
    top: 0;
    right: 0;
    bottom: 0;
    justify-content: flex-end;
    transform: translateX(calc(100%));
    &.open {
      animation: open-basket 1s ease both;
    }
    &.closed {
      animation: close-basket 1s ease-in both, bounce-basket 1s 1s ease-in;
    }
    & .package {
      background: $basket-bg;
      position: relative;
      z-index: 100;
     //width: 500px;
      @include scale(width, 300px, 500px, 1.6);
      overflow-y: scroll;
      padding: 10px;
      & .package-controls{
        width: calc(100% - 20px);
      }
      & .margins{
        color: $CB-2;
        font-size: 20px;
        font-weight: 400;
        display: flex;
        justify-content: center;
        font-family: $ff2;
        & > *{
          margin: 10px;
        }
        & .package-price::before, .margin::before{
          content: "£";
        }
        & .percent:after{
          content: "%";
        }
      }
      & .section-title, & .package-date{
        color:rgba(255,255,255,0.8)
      }

    }
    & .toggle-wrapper {
      //   max-width: 0;
      overflow: visible;
    }
    & .basket-toggle {
      position: absolute;
      left: -40px;
      top: 40vh;
      width: 40px;
      min-width: 40px;
      height: 60px;
      border-left: 1px white solid;
      border-top: 1px white solid;
      border-bottom: 1px white solid;
      //  background-color: $C1;
      background: rgba(1,47,56,1);
      color: white;
      cursor: pointer;
      &.open {
        animation: open-toggle 1s ease forwards;
      }
      &.closed {
        animation: close-toggle 1s ease forwards;
      }
    }
  }
}
@keyframes open-basket {
  100% {
    transform: translateX(0);
  }
}
@keyframes close-basket {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(calc(100%));
  }
}

@keyframes bounce-basket {
  0% {
    //  transform: translateX(320px);
    transform: translateX(calc(100%));
  }
  25% {
    //  transform: translateX(320px);
    transform: translateX(calc(100% - 80px));
  }
  50% {
    //  transform: translateX(320px);
    transform: translateX(100%);
  }
  75% {
    //  transform: translateX(320px);
    transform: translateX(calc(100% - 60px));
  }
  100% {
    //  transform: translateX(320px);
    transform: translateX(100%);
  }
}

@keyframes open-toggle {
  0% {
    transform: rotateY(0) rotateX(0);
  }
  49% {
    transform: rotateY(0deg) rotateX(89deg);
  }
  50% {
    transform: rotateY(180deg) rotateX(90deg);
    border-right: 1px white solid;
    border-left: 0px white solid;

  }
  100% {
    border-right: 1px white solid;
    border-left: 0px white solid;
    transform: rotateY(180deg) rotateX(180deg);
  //  background: $basket-bg;
 //   @include shadow-right();
  }
}
@keyframes close-toggle {
  0% {
    transform: rotateY(180deg) rotateX(180deg);
 //   background:$basket-bg;
    border-left: 0px white solid;
  }
  49% {
    transform: rotateY(180deg) rotateX(89deg);
    border-left: 0px white solid;
  }
  50% {
    transform: rotateY(0deg) rotateX(90deg);
    border-right: 0px white solid;
    border-left: 1px white solid;
  }
  100% {
    border-right: 0px white solid;
    border-left: 1px white solid;
    transform: rotateY(0) rotateX(0);
  }
}

@keyframes open-glass {
  100% {
    transform: translateX(0);
  }
}
@keyframes close-glass {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
