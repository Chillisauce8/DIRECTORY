<template>
  <transition name="swap">
    <div class="product-card-details" :class="[props.open ? 'open' : 'closed']">
      <div v-show="!props.open" class="product-info">
        <div v-if="vm.productVenueName">
          <LazySvgIcon svg="map-pin" class="inline" />
          <span v-html="vm.productVenueName"></span>
        </div>

        <div v-if="vm.packageProductDescription.invoicedPercent">
          Invoiced
          <span
            :class="{
              'text-color_green':
                vm.packageProductDescription.invoicedPercent >= 100,
              'text-color_red':
                vm.packageProductDescription.invoicedPercent < 100,
            }"
          >
            {{ vm.packageProductDescription.invoicedPercent }}%</span
          >
        </div>

        <div v-if="getOptionsString()">
          <LazySvgIcon svg="star" class="inline" /> {{ getOptionsString() }}
        </div>

        <div v-if="getAddOnsString()">
          <LazySvgIcon svg="add" class="inline" /> {{ getAddOnsString() }}
        </div>

        <div
          class="text-color_red"
          v-if="currentUser.isStaffOrHiddenStaff() && isBlackOutDate()"
        >
          Product or venue is not available - blackout date
        </div>

        <div :class="{'text-color_red': vm.packageProductDescription.hasUnitsOverflow}"
             v-if="vm.packageProductDescription.packageProduct.needPeople !== undefined"
             v-tooltip="getUnitsTooltipText()">
          <LazySvgIcon svg="person" class="inline" />
          {{ getPeopleCountString() }} People
          <span v-if="isMaxCapacity()" class="text-color_red"
            >(max reached)</span
          >
          <template v-if="shouldShowUnitsCount()">{{
            getUnitsString()
          }}</template>
          <template v-if="shouldShowSessionsCount()">{{
            getSessionsString()
          }}</template>
        </div>

        <template
          v-if="
            hasProductTimeDefined() &&
            !vm.packageProductDescription.packageProduct.impossibleForThisDay()
          "
        >
          <div
            v-if="
              vm.packageProductDescription.packageProduct.product.getTimes()
                .timeType === 'Regular Start Times' ||
              vm.packageProductDescription.packageProduct.product.getTimes()
                .timeType === 'Start Times'
            "
            :class="getTimeDataClasses()"
          >
            <LazySvgIcon svg="clock" class="inline" />
            <template
              v-if="
                !vm.packageProductDescription.packageProduct.getArriveTime()
              "
            >
              Start Time:
              {{
                prepareTimeFormat(
                  vm.packageProductDescription.packageProduct.getStartTime()
                )
              }}
            </template>
            <template
              v-if="vm.packageProductDescription.packageProduct.getArriveTime()"
            >
              Arrive By:
              {{
                prepareTimeFormat(
                  vm.packageProductDescription.packageProduct.getArriveTime()
                )
              }}
              For
              {{
                prepareTimeFormat(
                  vm.packageProductDescription.packageProduct.getStartTime()
                )
              }}
              Start
            </template>
            {{ getTimeWarningMessage() }}
          </div>

          <div
            v-if="
              vm.packageProductDescription.packageProduct.product.getTimes()
                .timeType === 'Entry Times'
            "
            :class="getTimeDataClasses()"
          >
            <LazySvgIcon svg="clock" class="inline" />
            Entry Time: {{ prepareTimeFormat(vm.startOfEntryTime) }}
            <template v-if="vm.endOfEntryTime"
              >to {{ prepareTimeFormat(vm.endOfEntryTime) }}</template
            >
            {{ getTimeWarningMessage() }}
          </div>
        </template>

        <div
          v-if="
            vm.packageProductDescription.packageProduct.impossibleForThisDay() &&
            canShowWarnings()
          "
          v-tooltip="'The product has no possible times for this day'"
          :class="getTimeDataClasses()"
        >
          <LazySvgIcon svg="clock" class="inline" /> {{ getTimeWarningMessage() }}
        </div>

        <div v-if="vm.packageProductDescription.packageProduct.hideProduct">
          <LazySvgIcon svg="eye-close" class="inline" /> Hidden From Guests
        </div>

        <div v-if="vm.packageProductDescription.packageProduct.flightDetails">
          <LazySvgIcon svg="plane" class="inline" />
          Flight:
          {{
            vm.packageProductDescription.packageProduct.flightDetails.flightCode
          }}
          Departs:
          {{
            vm.packageProductDescription.packageProduct.flightDetails
              .departureTime
          }}
          Arrives:
          {{
            vm.packageProductDescription.packageProduct.flightDetails
              .arrivalTime
          }}
        </div>

        <p v-if="vm.allocation">
          <LazySvgIcon svg="hotel" class="inline" />
          Allocation - {{ vm.allocation?.available }}
        </p>

        <PackageProductDetails
          :packageProductDescription="vm.packageProductDescription"
        >
        </PackageProductDetails>

        <DisplayProductNote
          :productNote="vm.packageProductDescription.packageProduct.productNote"
        >
        </DisplayProductNote>

        <div
          v-if="!vm.packageProductDescription.isCurrentUserAttended"
          class="text-color_red"
        >
          <LazySvgIcon svg="bell" class="inline" /> Not Attending
        </div>

        <div
          v-if="
            vm.packageProductDescription.packageProduct.isProductRemovedFromDB()
          "
          :class="getProductDataClasses()"
        >
          <LazySvgIcon svg="bell" class="inline" /> {{ getProductWarningMessage() }}
        </div>

        <template v-if="vm.packageProductDescription.importantInfo" class="">
          <div v-for="item in vm.packageProductDescription.importantInfo">
            <LazySvgIcon svg="alert" class="inline" /> {{ item }}
          </div>
        </template>

        <div class="staff-price-info" v-if="vm.isStaffPriceInfoVisible">
          <div v-if="vm.markUpString">Margin: {{ vm.markUpString }}</div>
          <div v-for="item in getPriceInfo()">
            {{ item }}
          </div>
        </div>
      </div>
<div class="content-switch">
      <div v-show="open" class="close-block Center">
        Tap Here to Close
        <LazySvgIcon svg="point" />
      </div>
    </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { usePackageTimesHelperService } from "~/services/helpers/package-builder/package-times-helper.service.factory";
import { useProductTimesHelperService } from "~/services/helpers/product/product-times-helper-service.factory";
import { useUnitsCountHelper } from "~/services/helpers/package-builder/units-count-helper.servise.factory";
import { useEventPermissionsService } from "~/services/helpers/event/event-permissions.service.factory";
import { useDataTemplateFabricService } from "~/services/helpers/data-templates/data-template-fabric.factory";
import { useGlobalElementsTemplateService } from "~/services/helpers/data-templates/global-elements-template.factory";
import { useDateHelper } from "~/services/helpers/date-helper.factory";
import { useVenueService } from "~/services/helpers/product/venue.service.factory";
import { useCurrentUser } from "~~/services/helpers/user-common/current-user.factory";
import { useCurrentSiteArea } from "~/services/helpers/current-site-area.factory";
import { useIsStaffToggledStore } from "~/store/isStaffToggled";
import type { IPackageProductViewModel } from "~/services/helpers/package-builder/package-view-day.interface";
import { useProductPageHelperService } from '~/services/helpers/product/product-page-helper.service.factory';
import {useProductPriceViewService} from '~/services/helpers/pricing/product-price-view-service.factory';

interface ProductCardDetailsProps {
  open?: boolean;
  packageProductDescription: IPackageProductViewModel;
  dayIndex: number;
  dayDate?: Date;
  location: any;
  allocationData: any;
  isEstimatePreviousYearPriceUsed?: boolean;
  isEstimatePriceUsed?: boolean;
  needToHidePrices?: boolean;
}


const props = defineProps<ProductCardDetailsProps>();

const packageTimesHelper = usePackageTimesHelperService();
const productTimesHelper = useProductTimesHelperService();
const unitsCountHelper = useUnitsCountHelper();
const eventPermissionsService = useEventPermissionsService();
const dataTemplateFabric = useDataTemplateFabricService();
const globalElementsTemplateService = useGlobalElementsTemplateService();
const dateHelper = useDateHelper();
const venueService = useVenueService();
const currentUser = useCurrentUser();
const currentSiteArea = useCurrentSiteArea();
const isStaffToggledStore = useIsStaffToggledStore();
const productPageHelper = useProductPageHelperService();
const currentInstance = getCurrentInstance();
const productPriceViewService = useProductPriceViewService();

const vm = reactive({
  productVenueName: null,
  startOfEntryTime: null,
  endOfEntryTime: null,
  canSavePackage: false,
  packageProductDetails: null,
  venueToBeConfirmed: null,
  packageProductDescription: null,
  dayDate: null,
  dayIndex: null,
  location: props.location,
  isEstimatePreviousYearPriceUsed: false,
  isEstimatePriceUsed: false,
  needToHidePrices: false,
  markUpString: null,
  allocation: null,
  isStaffPriceInfoVisible: false,
});

let isStaffToggledSubscription;

function init(): void {
  _getPermissions();
  _fetchEventTemplateRelatedDetails();
}

async function onDescriptionUpdated(): Promise<void> {
  packageTimesHelper.setPackage(
    vm.packageProductDescription.packageProduct.getPackage()
  );

  vm.startOfEntryTime = packageTimesHelper.getViewStartOfEntryTime(
    vm.packageProductDescription.packageProduct,
    vm.dayIndex,
    vm.packageProductDescription.packageProduct.getStartTime()
  );

  vm.endOfEntryTime = packageTimesHelper.getEndOfEntryTime(
    vm.packageProductDescription.packageProduct,
    vm.dayIndex
  );

  vm.productVenueName = await _getProductVenueName();
}

function prepareTimeFormat(date: Date): string {
  return dateHelper.viewTimeFormat(date);
}

function canShowWarnings(): boolean {
  return vm.canSavePackage;
}

function getTimeWarningMessage(): string {
  if (!canShowWarnings()) {
    return "";
  }

  if (vm.packageProductDescription.isImpossibleForThisDay) {
    return _getWarningMessage("packageBuilderProductWithNotPossibleTime");
  }

  if (
    productTimesHelper.needToIgnoreProduct(
      vm.packageProductDescription.packageProduct.product,
      vm.packageProductDescription.packageProduct.stage
    )
  ) {
    return "";
  }

  if (vm.packageProductDescription.isTimeObsolete) {
    return _getWarningMessage("packageBuilderObsoleteTime");
  }

  if (vm.packageProductDescription.hasTimeOverlapping) {
    return _getWarningMessage("packageBuilderOverlappingTime");
  }

  if (
    vm.packageProductDescription.packageProduct
      .isPossibleTimeAppearedAndNeedSave
  ) {
    return _getWarningMessage(
      "packageBuilderGasPossibleTimeAppearedAndNeedSave"
    );
  }

  if (isProductTimeHasNoProblems()) {
    return "";
  }
}

function getTimeDataClasses(): string[] {
  if (!canShowWarnings()) {
    return [];
  }

  if (vm.packageProductDescription.isImpossibleForThisDay) {
    return ["text-color_red"];
  }

  if (
    productTimesHelper.needToIgnoreProduct(
      vm.packageProductDescription.packageProduct.product,
      vm.packageProductDescription.packageProduct.stage
    )
  ) {
    return [];
  }

  if (vm.packageProductDescription.isTimeObsolete) {
    return ["text-color_red"];
  }

  if (vm.packageProductDescription.hasTimeOverlapping) {
    return ["text-color_red"];
  }

  if (
    vm.packageProductDescription.packageProduct
      .isPossibleTimeAppearedAndNeedSave
  ) {
    return ["text-color_red"];
  }

  if (isProductTimeHasNoProblems()) {
    return [];
  }
}

function getProductWarningMessage(): string {
  if (!canShowWarnings()) {
    return "";
  }

  if (vm.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
    return _getWarningMessage("packageBuilderAbsentProduct");
  }

  return "";
}

function getProductDataClasses(): string[] {
  if (!canShowWarnings()) {
    return [];
  }

  if (vm.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
    return ["text-color_red"];
  }

  return [];
}

function getTimeTooltipText(): string {
  if (!canShowWarnings()) {
    return null;
  }

  if (vm.packageProductDescription.isTimeObsolete) {
    return "The product has obsolete time. It is not possible for product now!";
  }

  if (vm.packageProductDescription.hasTimeOverlapping) {
    return "The product has time overlapping with another product that day!";
  }

  if (
    vm.packageProductDescription.packageProduct
      .isPossibleTimeAppearedAndNeedSave
  ) {
    return "The product had now possible time previously but they have it now. Value is not saved!";
  }

  return "";
}

function getUnitsTooltipText(): string {
  if (!canShowWarnings()) {
    return null;
  }

  if (vm.packageProductDescription.hasUnitsOverflow) {
    const maxUnitsForProducts = unitsCountHelper.getMaxUnitsFromConfig(
      vm.packageProductDescription.packageProduct
    );

    const sessionsCount = unitsCountHelper.calculateSessionsCount(
      vm.packageProductDescription.packageProduct
    );

    return `The product needs more units then maximum possible value (${maxUnitsForProducts})!
        It may be done by ${sessionsCount} sessions.`;
  }

  return "";
}

function shouldShowSessionsCount(): boolean {
  return canShowWarnings() && vm.packageProductDescription.hasUnitsOverflow;
}

function getSessionsString(): string {
  const sessionsCount = unitsCountHelper.calculateSessionsCount(
    vm.packageProductDescription.packageProduct
  );

  return _getWarningMessage("packageBuilderUnitsOverflow", { sessionsCount });
}

function isProductTimeHasNoProblems(): boolean {
  return (
    !vm.packageProductDescription.isTimeObsolete &&
    !vm.packageProductDescription.hasTimeOverlapping &&
    !vm.packageProductDescription.packageProduct
      .isPossibleTimeAppearedAndNeedSave
  );
}

function hasProductTimeDefined() {
  const packageProduct = vm.packageProductDescription.packageProduct;
  const product = packageProduct.product;

  return (
    product &&
    !product.isTransfer() &&
    product.getTimes() &&
    product.getTimes().timeType &&
    packageProduct.getStartTime()
  );
}

function shouldShowUnitsCount(): boolean {
  return (
    vm.packageProductDescription.packageProduct.product &&
    vm.packageProductDescription.packageProduct.product.getConfig()
      .maxPeoplePerUnit &&
    vm.packageProductDescription.packageProduct.product.getConfig()
      .maxPeoplePerUnit > 1
  );
}

function getUnitsString(): string {
  if (!vm.packageProductDescription.packageProduct.product) {
    return "";
  }

  let unitsCount = vm.packageProductDescription.packageProduct.needUnits;

  if (unitsCount === undefined) {
    unitsCount =
      vm.packageProductDescription.packageProduct.needPeople /
      vm.packageProductDescription.packageProduct.product.getConfig()
        .maxPeoplePerUnit;
  }

  return (
    Math.ceil(unitsCount) +
    " " +
    vm.packageProductDescription.packageProduct.product.getConfig().unitType +
    (Math.ceil(unitsCount) > 1 ? "s" : "")
  );
}

function getPeopleCountString() {
  const peopleCount = vm.packageProductDescription.packageProduct.needPeople;

  return (
    `${peopleCount}`
  );
}

function getAddOnsString(): string {
  if (!vm.packageProductDescription.packageProduct.product) {
    return "";
  }

  const names = vm.packageProductDescription.packageProduct.product
    .getAddons()
    .filter((item: any) => item.selected)
    .map((item: any) => item.product.getName());

  return names.join(", ");
}

function getOptionsString(): string {
  if (!vm.packageProductDescription.packageProduct.product) {
    return null;
  }

  const names = vm.packageProductDescription.packageProduct.product
    .getOptions()
    .filter((item: any) => item.selected)
    .map((item: any) => item.product.getName());

  return names.join(", ");
}

function isMaxCapacity(): boolean {
  return unitsCountHelper.isMaxCapacity(
    vm.packageProductDescription.packageProduct
  );
}

async function _getProductVenueName(): Promise<string> {
  return productPageHelper.getProductVenueName(vm.packageProductDescription.packageProduct,
      vm.location, vm.venueToBeConfirmed);
}

function _getPermissions() {
  vm.canSavePackage = eventPermissionsService.hasPermission(
    "packagePageFunctions.savePackage",
    {}
  );

  vm.isStaffPriceInfoVisible = currentSiteArea.isCustomerArea() ? currentUser.isStaffOrHiddenStaff() :
    currentUser.isStaff() && !isStaffToggledStore.isToggled;
}

function _fetchEventTemplateRelatedDetails() {
  const dataTemplate = dataTemplateFabric.get({
    name: "event",
    notUpdateDefaultHeaderTemplate: true,
  });

  vm.venueToBeConfirmed = dataTemplate.getValue("event.venueToBeConfirmed");
}

function _getWarningMessage(name: string, context?: any) {
  return globalElementsTemplateService.getMessageFromDictionaryVariables(
    name,
    context
  );
}

function preparePriceMarkUpString() {
  if (!currentUser.isStaffOrHiddenStaff()) {
    return "";
  }

  if (vm.needToHidePrices) {
    return '';
  }

  const markUp = vm.packageProductDescription.markUp;
  const markUpTotal = vm.packageProductDescription.markUpTotal;

  if (!markUp) {
    return '';
  }

  const parts = [
    markUp?.amount ? `£${markUp?.amount}pp` : '',
    markUpTotal?.amount ? `£${Math.round(markUpTotal?.amount)} total` : '',
    markUp.percent !== null ? markUp.percent + '%' : '',
  ];

  return parts.filter(p => !!p).join(' / ');
}

function getPriceWarnings(): string[] {
  const warnings = [];

  if (vm.isEstimatePreviousYearPriceUsed) {
    warnings.push('Estimated price from last years cost');
  }

  if (vm.isEstimatePriceUsed) {
    warnings.push('Estimated price');
  }

  if (vm.packageProductDescription.packageProduct.money.pricingOverride === 'Yes') {
    warnings.push('Please note, that the pricingOverride=Yes for the product. To change the price. please, set pricingOverride to No.')
  }

  return warnings;
}

function getPriceInfo(): string[] {
  if (!currentUser.isStaffOrHiddenStaff()) {
    return [];
  }

  const calculatedPricePerPerson =
    vm.packageProductDescription.packageProduct.getPrice({
      priceTarget: "package",
      skipVatExcluding: true,
      ignorePriceOverridden: true,
      getTotalPrice: false,
    });

  const calculatedTotalPrice = vm.packageProductDescription.packageProduct.getPrice({
    priceTarget: "package",
    skipVatExcluding: true,
    ignorePriceOverridden: true,
    getMeanPrice: false,
    getTotalPrice: true,
  });

  const peopleCount = vm.packageProductDescription.packageProduct.needPeople;

  const bookedPricePerPersonGBP =
    vm.packageProductDescription.packageProduct.money.bookedPricePerPersonGBP;
  const totalBookedPrice = peopleCount * bookedPricePerPersonGBP;
  const minPricePerPersonGBP =
    vm.packageProductDescription.packageProduct.money.minPricePerPersonGBP;
  const totalMinPricePerPersonGBP = peopleCount * minPricePerPersonGBP;

  const infoStringList = [];

  if (calculatedPricePerPerson !== undefined) {
    infoStringList.push(
      `Calculated Price Per Person £${calculatedPricePerPerson} / £${calculatedTotalPrice} total`
    );
  }

  if (bookedPricePerPersonGBP !== undefined) {
    infoStringList.push(`Booked Price Per Person £${bookedPricePerPersonGBP} / £${totalBookedPrice} total`);
  }

  if (minPricePerPersonGBP !== undefined) {
    infoStringList.push(`Minimum Price Per Person £${minPricePerPersonGBP} / £${totalMinPricePerPersonGBP} total`);
  }

  if (vm.isEstimatePreviousYearPriceUsed) {
    infoStringList.push('Estimated price from last years cost');
  }

  if (vm.isEstimatePriceUsed) {
    infoStringList.push('Estimated price');
  }

  if (vm.packageProductDescription.packageProduct.money.pricingOverride === 'Yes') {
    infoStringList.push('Price Overridden - Cannot be edited')
  }

  if (vm.packageProductDescription.packageProduct.productHasCustomPriceSettings()) {
    infoStringList.push('Custom Content - Edit Cost Set');
  } else if (vm.packageProductDescription.packageProduct.money.priceOverride === 'Yes') {
    infoStringList.push('Edit Price - Override Set');
  }

  if (vm.packageProductDescription.packageProduct.money.costOverride === 'Yes') {
    infoStringList.push('Edit Cost - Override Set');
  }

  return infoStringList;
}

function isBlackOutDate(): boolean {
  const date = vm.packageProductDescription.packageProduct.date;

  if (!date) {
    return false;
  }

  const dateSaveFormat = dateHelper.saveDateFormat(date);
  return vm.packageProductDescription.packageProduct.product.isBlackoutDate(
    dateSaveFormat
  );
}

function getAllocationForPackageProduct(allocationData) {
  if (!allocationData) {
    return null;
  }

  const packageProduct = vm.packageProductDescription?.packageProduct;

  const productId = packageProduct?.productId;

  const productAllocation = allocationData?.[productId];

  if (!productAllocation) {
    return null;
  }

  const productDate = packageProduct.date;

  if (!productDate) {
    return null;
  }
  const dateSaveFormat = dateHelper.saveDateFormat(productDate);

  return productAllocation?.[dateSaveFormat] ?? null;
}

function subscribeOnIsStaffToggledStore() {
  return isStaffToggledStore.$onAction(({name, after}) => {
    if (name === 'set') {
      return;
    }

    after(() => _getPermissions());
  });
}

watch(
  () => props.packageProductDescription,
  () => {
    vm.packageProductDescription = props.packageProductDescription;
    onDescriptionUpdated();
  }
);

watch(() => props.allocationData, v => {
  vm.allocation = getAllocationForPackageProduct(v);
});

onBeforeMount(async () => {
  vm.packageProductDescription = props.packageProductDescription;
  vm.isEstimatePreviousYearPriceUsed = props.isEstimatePreviousYearPriceUsed;
  vm.isEstimatePriceUsed = props.isEstimatePriceUsed;
  vm.needToHidePrices = props.needToHidePrices;
  vm.markUpString = preparePriceMarkUpString();

  await onDescriptionUpdated();
  init();
});

onMounted(() => {
  if (!currentSiteArea.isCustomerArea()) {
    isStaffToggledSubscription = subscribeOnIsStaffToggledStore();
  }
});

onUnmounted(() => {
  if (isStaffToggledSubscription) {
    isStaffToggledSubscription();
  }
});
</script>

<style lang="scss">
.product-card-details {
  .staff-price-info {
    font-style: italic;
  }
  .content-switch {
    height: 100%;
    & .close-block {
      height: 80%;
      font-family: $ff2;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 3px;
      & .icon {
        animation: up-down 2s linear 1s 1;
        width: 32px;
        height: 32px;
        color: $C2;
      }
    }
  }
}
</style>
