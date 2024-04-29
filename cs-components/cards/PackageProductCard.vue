<template>
  <card-wrapper
    v-if="vm.packageProduct?.product"
    class="package-product-card"
    :class="[vm.open ? 'open' : 'closed', props?.packageProductDescription?.hiddenForCurrentUser ? 'hidden' : null]"
    @click="onCardClick"
    @contextmenu="openContextMenu">
    <div class="visible-area">
      <template v-if="!vm.packageProductDescription.hiddenForCurrentUser">
        <template v-if="vm.packageProduct.product.isMultiActivity()">
          <ProductImages :images="getMultiActivityImages(vm.packageProduct)" display="image-grid"/>
        </template>
        <template v-else>
          <ProductImages :src="getMainImage(vm.packageProduct)" :alt="getImageDefaultAlt(vm.packageProduct)"/>
        </template>
      </template>

      <card-text-wrapper>
        <h1 v-if="vm.display === 'package-card' || vm.display === 'web-package-card'">
          <span>{{ getName(vm.packageProduct) }}</span>
          <span v-if="vm.topInfo" class="Column Right">{{vm.topInfo}}</span>
        </h1>

        <h1 v-if="vm.display === 'full-package' || vm.display === 'basket-package'" class="Row">
          <template v-if="!vm.packageProductDescription.hiddenForCurrentUser">
            <div class="name">{{ getName(vm.packageProduct) }}</div>
            <div class="price"
                :class="{'text-color_red': vm.bookedPriceChanged || vm.isEstimatePreviousYearPriceUsed || vm.isEstimatePriceUsed}">
              {{ getPrice() }}
            </div>

          </template>
          <template v-else>Product Hidden By Organiser</template>
        </h1>

        <ProductCardIncludes
          v-if="vm.display === 'basket-package'"
          :title="getName(vm.packageProduct)"
          :includes="getIncluded(vm.packageProduct)"
        />

        <ProductCardDetails
          v-if="vm.display === 'full-package' && !vm.packageProductDescription.hiddenForCurrentUser && !vm.isReviewEditingAllowed"
          :packageProductDescription="vm.packageProductDescription"
          :dayIndex="vm.dayIndex"
          :dayDate="dayDate"
          :allocationData="vm.allocationData"
          :location="vm.location"
          :open="vm.open"
          :isEstimatePreviousYearPriceUsed="vm.isEstimatePreviousYearPriceUsed"
          :isEstimatePriceUsed="vm.isEstimatePriceUsed"
          :needToHidePrices="vm.needToHidePrices"
        />

        <PackageReviewStars
          v-if="vm.display === 'full-package' && !vm.packageProductDescription.hiddenForCurrentUser && vm.isReviewEditingAllowed"
          :disabled="vm.isSaveReviewInProgress"
          :productId="vm.packageProductDescription.packageProduct.productId"
          :score="vm.reviewScore"
          @starClick="onStarClick"
        />

        <ProductCardBasketDetails
          v-if="vm.display === 'basket-package' && !vm.packageProductDescription.hiddenForCurrentUser"
          :packageProductDescription="vm.packageProductDescription"
          :dayIndex="vm.dayIndex"
          :dayDate="dayDate"
          :location="vm.location"
          :open="vm.open"
        />

      </card-text-wrapper>
    </div>

    <PackageReviewInput
      v-if="vm.display === 'full-package' && !vm.packageProductDescription.hiddenForCurrentUser && vm.isReviewEditingAllowed"
      :disabled="vm.isSaveReviewInProgress"
      :open="vm.open"
      :comment="vm.reviewComment"
      @click="onSaveReviewClick"
    />

    <ProductCardTools
      v-if="vm.needTools && !vm.isReviewEditingAllowed"
      :open="vm.open"
      :display="vm.display"
      :for-basket="vm.forBasket"
      :dayIndex="vm.dayIndex"
      :packageProductDescription="vm.packageProductDescription"
    />

    <client-only>
      <PackageProductContextMenu v-if="vm.isContextMenuEnabled"
                                 :package-product-description="vm.packageProductDescription"
                                 :params="vm.contextMenuParams">
      </PackageProductContextMenu>
    </client-only>
  </card-wrapper>
</template>

<script lang="ts" setup>
import {useCsLodash} from "~/service/cs-lodash.factory";
import {useProductIncludedDataPreparer} from "~/service/helpers/product/product-included-data-preparer.factory";
import {useCurrentUser} from "~/service/helpers/user-common/current-user.factory";
import {useHidingPriceService} from "~/service/helpers/pricing/hiding-price-service.factory";
import type { IPackageProductViewModel } from '~/service/helpers/package-builder/package-view-day.interface';
import { useCurrentSection } from '~/service/helpers/current-section.factory';
import { useCurrentLocationService } from '~/service/helpers/current-location.service.factory';
import { useCurrentEvent } from '~/service/helpers/event/current-event.service.factory';
import {
  usePackageProductContextMenuService
} from '~/service/helpers/package-builder/package-product-context-menu.service.factory';
import { useReviewService } from '~/service/helpers/review/review.factory';



interface PackageProductCardProps {
  packageProductDescription: IPackageProductViewModel;
  display: PackageProductCardDisplayMode;
  topInfo?: string;
  dayIndex: number;
  dayDate?: Date;
  location?: any;
  allocationData?: any;
  forBasket?: boolean;
  isReviewEditingAllowed?: boolean;
  review?: any;
}


interface PackageProductCardEmits {
  (e: 'click', event: any): void;
}


enum PackageProductCardDisplayMode {
  packageCard = 'package-card',
  webPackageCard = 'web-package-card',
  basketPackage = 'basket-package',
  fullPackage = 'full-package',
}


const props = defineProps<PackageProductCardProps>();
const emits = defineEmits<PackageProductCardEmits>();

const csLodash = useCsLodash();
const productIncludedDataPreparer = useProductIncludedDataPreparer();
const currentUser = useCurrentUser();
const hidingPriceService = useHidingPriceService();
const currentSection = useCurrentSection();
const currentLocation = useCurrentLocationService();
const currentEvent = useCurrentEvent();
const packageProductContextMenuService = usePackageProductContextMenuService();
const reviewService = useReviewService();

const vm = reactive({
  display: props.display,
  topInfo: props.topInfo,
  dayIndex: props.dayIndex,
  forBasket: props.display === PackageProductCardDisplayMode.basketPackage,
  needTools: [PackageProductCardDisplayMode.basketPackage,
    PackageProductCardDisplayMode.fullPackage].includes(props.display as PackageProductCardDisplayMode),
  packageProductDescription: props.packageProductDescription,
  packageProduct: props.packageProductDescription.packageProduct,
  open: false,
  list: true,
  imagesApiPath: 'https://media.chillisauce.com/image/upload/',
  needToHidePrices: true,
  bookedPriceChanged: false,
  isEstimatePreviousYearPriceUsed: false,
  isEstimatePriceUsed: false,
  location: props.location,
  isContextMenuEnabled: packageProductContextMenuService.isContextMenuEnabled(),
  contextMenuParams: null,
  allocationData: props.allocationData,
  isReviewEditingAllowed: props.isReviewEditingAllowed,
  isSaveReviewInProgress: false,
  reviewId: props.review?.reviewId,
  reviewScore: props.review?.score || NaN,
  reviewComment: props.review?.comment || '',
});


let recalculateHidingPricesSubscription = undefined;

async function init() {
  await checkHidePricesPermission();
  initBookedPriceChanged();
  initReview(props.review);

  vm.isEstimatePreviousYearPriceUsed = isEstimatePreviousYearPriceSuitable();
  vm.isEstimatePriceUsed = isEstimatePriceSuitable();
}

function onCardClick(event: MouseEvent) {
  if (props.packageProductDescription.hiddenForCurrentUser || vm.isReviewEditingAllowed) {
    return;
  }

  if (![PackageProductCardDisplayMode.packageCard, PackageProductCardDisplayMode.webPackageCard]
      .includes(props.display)) {
    vm.open = !vm.open;
  }

  emits('click', event);
}

function initReview(review: any) {
  vm.reviewId = review?.reviewId;
  vm.reviewScore = review?.score || NaN;
  vm.reviewComment = review?.comment || '';
}

function onStarClick(event: MouseEvent, score: number) {
  if (props.packageProductDescription.hiddenForCurrentUser || !vm.isReviewEditingAllowed) {
    return;
  }

  if (props.display === PackageProductCardDisplayMode.fullPackage && !vm.open) {
    vm.open = true;
  }

  if (vm.reviewScore === score) {
    return;
  }

  vm.reviewScore = score;

  saveReview();
}

function onSaveReviewClick(comment: string) {
  if (props.packageProductDescription.hiddenForCurrentUser || !vm.isReviewEditingAllowed) {
    return;
  }

  if (props.display === PackageProductCardDisplayMode.fullPackage && vm.open) {
    vm.open = false;
  }

  if (vm.reviewComment === comment) {
    return;
  }

  vm.reviewComment = comment;

  saveReview();
}

async function saveReview() {
  const eventId = currentEvent.getId();

  const data: any = {
    score: vm.reviewScore,
    comment: vm.reviewComment,
    reviewId: vm.reviewId,
    productId: vm.packageProduct.productId,
  };

  const res = await reviewService.createOrUpdateEventProductReview(eventId, data);

  currentEvent.setCustomerReviews(currentUser.getId(), res);
}

function getMainImage(packageProduct) {
  try {
    return vm.imagesApiPath + packageProduct.getMainImageId();
  } catch(ex) {

  }
}

function getMultiActivityImages(packageProduct) {
  const optionImages = packageProduct.product.optionProducts
      .filter(item => item.selected)
      .map(option => {
        return option.product.getMainImageId(packageProduct.getSection());
      }).filter(item => !!item)
      .map(item => {
        return item;
      });

  const imagesIdList = [packageProduct.getMainImageId(), ...optionImages];
  const uniqImagesIdList = csLodash.uniq(imagesIdList);

  let result = uniqImagesIdList.map(id => ({
    src: vm.imagesApiPath + id,
    alt: getImageDefaultAlt(packageProduct),
  }));

  if (result.length > 6) {
    result = result.slice(0, 6);
  }

  return result;
}

function getImageDefaultAlt(packageProduct) {
  const locationName = currentLocation.getLocationName();

  if (locationName) {
    return `${locationName} ${packageProduct.product.getName()} ${currentSection.getIdeasName()}`;
  } else {
    return `${packageProduct.product.getName()} ${currentSection.getIdeasName()}`;
  }
}

function getName(packageProduct) {
  return vm.packageProductDescription.viewName;
}

function getIncluded(packageProduct) {
  try {
    return productIncludedDataPreparer.prepare(packageProduct.product);
  }  catch(ex) {

  }
}

function getPrice() {
  if (vm.packageProductDescription.priceInCurrency != null) {
    if (vm.needToHidePrices) {
      return hidingPriceService.needToShowSymbolsWithABTest() ?
          hidingPriceService.getHiddenPrice(vm.packageProductDescription.priceInCurrency) : '';
    } else {
      return vm.packageProductDescription.currency + vm.packageProductDescription.priceInCurrency;
    }
  }

  if (vm.needToHidePrices) {
    return '';
  }

  return 'POA';
}

async function checkHidePricesPermission(): Promise<void> {
  const product = vm.packageProductDescription.packageProduct.product;

  const additionalContext = {
    itineraryId: vm.packageProductDescription.packageProduct.itineraryId,
    productType: product ? product.getType() : null,
    productStage: vm.packageProductDescription.packageProduct.stage,
  };

  const params = {
    isProductPrice: true,
    forBasket: vm.forBasket || props.display === PackageProductCardDisplayMode.webPackageCard,
    additionalContext: additionalContext,
  };

  vm.needToHidePrices = await hidingPriceService.needToHidePrices(params);
}

function initBookedPriceChanged() {
  vm.bookedPriceChanged = false;

  if (!currentUser.isStaffOrHiddenStaff()) {
    return;
  }

  const pricePerPersonGBP = vm.packageProduct.money.pricePerPersonGBP;
  const bookedPricePerPersonGBP = vm.packageProduct.money.bookedPricePerPersonGBP;

  if (pricePerPersonGBP !== undefined && bookedPricePerPersonGBP !== undefined &&
      pricePerPersonGBP !== bookedPricePerPersonGBP) {
    vm.bookedPriceChanged = true;
  }
}

function isEstimatePreviousYearPriceSuitable() {
  if (!currentUser.isStaffOrHiddenStaff() || !vm.packageProduct?.product ||
      vm.packageProduct.getPackage().getIsWebPackage()) {
    return false;
  }

  const priceConfig: any = {
    pricingConditions: vm.packageProduct.getCurrentPriceConditions(true),
  }

  return vm.packageProduct.product.isEstimatePreviousYearPriceSuitable(priceConfig);
}

function isEstimatePriceSuitable() {
  if (!currentUser.isStaffOrHiddenStaff() || !vm.packageProduct?.product ||
      vm.packageProduct.getPackage().getIsWebPackage()) {
    return false;
  }

  const priceConfig: any = {
    pricingConditions: vm.packageProduct.getCurrentPriceConditions(true),
  }

  return vm.packageProduct.product.isEstimatePriceSuitable(priceConfig)
}

function subscribeOnRecalculateHidingPrices() {
  recalculateHidingPricesSubscription =
      hidingPriceService.onRecalculateHidingPrices(checkHidePricesPermission);
}

function unsubscribeAll() {
  recalculateHidingPricesSubscription.unsubscribe();
}

function openContextMenu(event: MouseEvent) {
  event.preventDefault();

  if (!vm.isContextMenuEnabled) {
    return;
  }

  const x = event.x;
  const y = event.y;

  vm.contextMenuParams = {x, y};
}


watch(() => props?.packageProductDescription, v => vm.packageProductDescription = v);
watch(() => props?.allocationData, v => vm.allocationData = v);
watch(() => props?.isReviewEditingAllowed, v => vm.isReviewEditingAllowed = v);
watch(() => props?.review, v => initReview(v));

await init();

onBeforeMount(() => {
  subscribeOnRecalculateHidingPrices();
});

onUnmounted(() => {
  unsubscribeAll();
});

</script>

<style lang="scss">
$label-border-color: $C1;

.package-product-card {
  &.hidden {
    cursor: unset;
  };
  &.package-card{
    background-color: $CB-05;
  }
  &.list,
  &.basket-package,
  &.full-package{
    & .visible-area{
      display: flex; // Make Card Contents into a row.
    }
    & .images {
      width: 25%;
      @include aspect-ratio(1, 1);
    }
    & header {
      position: relative;
      width: 75%;
      & li {
        @include ellipsis();
        @include scale(font-size, 8px, 14px, 1.8);
      }
    }

    & h1 {
      @include scale(font-size, 10px, 16px, 1.8);
      font-weight: 500;
      text-transform: uppercase;
      margin-bottom: 5px;
      @include ellipsis();
      & .name{
        width: 95%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      & .price{
        text-align: right;
      }
    }
  }
  &.card {
    & .images {
      @include aspect-ratio(3, 2);
    }
    & header {
      @include aspect-ratio(4, 3);
      //     min-height: 250px;
    }
    & .label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      position: absolute;
      top: 0px;
      right: 0px;
      border: white 1px solid;
      border-color: $label-border-color;
      background: rgba(0, 0, 0, 0.75);
      padding: 0 5px;
      margin: 5px;
    }
  }
}
</style>
