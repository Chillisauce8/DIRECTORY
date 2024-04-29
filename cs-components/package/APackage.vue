<template>
  <section-wrapper
      :title="sectionTitle"
      :titleNumber="vm.titleNumber"
      :key="packageBuilder.getPackageId() ?? 'new'"
      v-if="vm.packageData"
      :id="vm.display">
    <div class="package-wrapper">

      <section class="package-itinerary">
        <template v-for="day in days" :key="day.dayIndex">
          <PackageDate
              :date="day.date"
              :dayIndex="day.dayIndex"
              :isFirstDay="isFirstDay(day.dayIndex)"
              :datepickerProps="vm.datepickerProps"
              :people="peopleCount"
              :peopleSelectProps="vm.peopleSelectProps"
              :nights="nightsCount"
              :nightsSelectProps="vm.nightsSelectProps"
              :display="vm.display"
              @update:startDate="value => onPackageStartDateUpdate(value)"
              @update:datepickerInstance="value => onDatepickerInstanceUpdate(value)"
              @update:nights="value => onPackageNightsUpdate(value)"
              @update:people="value => onPackagePeopleUpdate(value)"
          >
          </PackageDate>

          <template
              v-for="(packageProductDescription, index) in day.products"
              :key="packageProductDescription.packageProduct.itineraryId ||
                    packageProductDescription.packageProduct.addItineraryId">
            <template v-if="isReviewEditingAllowed(packageProductDescription.packageProduct)">
              <template v-if="isMultiActivity(packageProductDescription.packageProduct)">
                <template v-for="productOption in getProductOptions(packageProductDescription.packageProduct)">
                  <PackageProductCard
                    :class="[vm.display]"
                    :display="vm.display"
                    :packageProductDescription="prepareDescriptionForProductOption(packageProductDescription, productOption, day.dayIndex)"
                    :dayIndex="day.dayIndex"
                    :dayDate="day.date"
                    :forBasket="vm.display === 'basket-package'"
                    :isReviewEditingAllowed="true"
                    :review="getReviewItem(productOption.product.getId())"
                  >
                  </PackageProductCard>
                </template>
              </template>
              <template v-else>
                <PackageProductCard
                  :class="[vm.display]"
                  :display="vm.display"
                  :packageProductDescription="packageProductDescription"
                  :dayIndex="day.dayIndex"
                  :dayDate="day.date"
                  :forBasket="vm.display === 'basket-package'"
                  :isReviewEditingAllowed="true"
                  :review="getReviewItem(packageProductDescription.packageProduct.productId)"
                >
                </PackageProductCard>
              </template>
            </template>
            <template v-else>
              <PackageProductCard
                :class="[vm.displayClass || vm.display]"
                :display="vm.display"
                :packageProductDescription="packageProductDescription"
                :dayIndex="day.dayIndex"
                :dayDate="day.date"
                :location="vm.packageData.location"
                :allocationData="vm.allocationData">

              </PackageProductCard>
            </template>
          </template>
        </template>

        <template
            v-if="vm.packageData.daysOutOfRange?.length ||
                  vm.packageData.daysWithCancelled?.length">
          <section>
            <div class="h2 padding_1_0 text-align_center cancelled-wrapper">
              <p>Cancelled !</p>
            </div>
          </section>

          <template v-if="vm.packageData.daysWithCancelled?.length">
            <template
                v-for="day in vm.packageData.daysWithCancelled"
                :key="day.dayIndex">
              <PackageDate
                  :date="day.date"
                  :dayIndex="day.dayIndex">
              </PackageDate>

              <template
                  v-for="(packageProductDescription, index) in day.products"
                  :key="packageProductDescription.packageProduct.itineraryId ||
                        packageProductDescription.packageProduct.addItineraryId">
                <PackageProductCard
                    :class="[vm.displayClass || vm.display]"
                    :display="vm.display"
                    :packageProductDescription="packageProductDescription"
                    :dayIndex="day.dayIndex"
                    :dayDate="day.date"
                    :location="vm.packageData.location"
                    :allocationData="vm.allocationData"
                    :forBasket="vm.display === 'basket-package'"
                >
                </PackageProductCard>
              </template>
            </template>
          </template>

          <template v-if="vm.packageData.daysOutOfRange?.length">
            <template
                v-for="day in vm.packageData.daysOutOfRange"
                :key="day.dayIndex"
            >
              <PackageDate
                  :date="day.date"
                  :dayIndex="day.dayIndex"
              ></PackageDate>

              <template
                  v-for="(packageProductDescription, index) in day.products"
                  :key="
                  packageProductDescription.packageProduct.itineraryId ||
                  packageProductDescription.packageProduct.addItineraryId
                "
              >
                <PackageProductCard
                    :class="[vm.displayClass || vm.display]"
                    :display="vm.display"
                    :packageProductDescription="packageProductDescription"
                    :dayIndex="day.dayIndex"
                    :dayDate="day.date"
                    :location="vm.packageData.location"
                    :allocationData="vm.allocationData"
                    :forBasket="vm.display === 'basket-package'"
                >
                </PackageProductCard>
              </template>
            </template>
          </template>
        </template>
      </section>
      <div class="package-controls">
        <div class="sticky">
          <slot name="package-summary" />
          <slot name="margins" />
          <div class="package-buttons">
            <slot name="main-buttons" />
          </div>
        </div>
      </div>
    </div>
  </section-wrapper>
  <EmptyBasket v-else-if="vm.showEmptyBasket !== false"></EmptyBasket>
</template>

<script setup lang="ts">
import { useCurrentEvent } from "~/service/helpers/event/current-event.service.factory";
import { useCurrentCustomer } from "~/service/helpers/user-common/current-customer-service.factory";
import { useCurrentUser } from "~/service/helpers/user-common/current-user.factory";
import { useEventPackageBuilder } from "~/service/helpers/package-builder/package-builder.service.factory";
import { usePackageSaver } from "~/service/helpers/package-builder/package-saver.service.factory";
import { usePackageBookingNotifyService } from "~/service/helpers/package/package-booking-notify.service.factory";
import { usePackageViewDataPreparer } from "~/service/helpers/package-builder/package-view-data-preparer.service.factory";
import { usePackageAllocationInfoHelperService } from "~/service/helpers/package/package-allocation-info-helper.service.factory";
import { useProductPriceViewService } from "~/service/helpers/pricing/product-price-view-service.factory";
import { useEventPermissionsService } from "~/service/helpers/event/event-permissions.service.factory";
import { useEventBookedHistoryService } from "~/service/helpers/event/event-booked-history.service.factory";
import { useSettingsTemplateService } from "~/service/helpers/data-templates/settings-template.factory";
import { useDataTemplateFabricService } from "~/service/helpers/data-templates/data-template-fabric.factory";
import { useCurrentEventStore } from "~/store/currentEvent";
import { useCustomerEvents } from "~/service/helpers/event/customer-events.service.factory";
import { useCurrentSiteArea } from "~/service/helpers/current-site-area.factory";
import { useCsLodash } from "~/service/cs-lodash.factory";
import type { IPackageProductViewModel } from "~/service/helpers/package-builder/package-view-day.interface";
import type { PackageProduct } from "~/service/models/packageProduct";
import type { IProductOption } from "~/service/models/productOption";


interface APackageProps {
  title?: string;
  display: string;
  displayClass?: string,
  useCurrent: boolean;
  usePackageData?: any;
  showEmptyBasket?: boolean,
  showSubtitle?: boolean,
  titleNumber?: number,
  isCustomerArea?: boolean;
  isWebPackage?: boolean,
}


const currentEvent = useCurrentEvent();
const currentCustomer = useCurrentCustomer();
const currentUser = useCurrentUser();
const packageBuilder = useEventPackageBuilder();
const packageSaver = usePackageSaver();
const packageBookingNotifyService = usePackageBookingNotifyService();
const packageViewDataPreparer = usePackageViewDataPreparer();
const packageAllocationInfoHelperService = usePackageAllocationInfoHelperService();
const productPriceViewService = useProductPriceViewService();
const eventPermissionsService = useEventPermissionsService();
const eventBookedHistoryService = useEventBookedHistoryService();
const settingsTemplateService = useSettingsTemplateService();
const dataTemplateFabric = useDataTemplateFabricService();
const currentEventStore = useCurrentEventStore();
const customerEvents = useCustomerEvents();
const currentSiteArea = useCurrentSiteArea();
const csLodash = useCsLodash();

const props = defineProps<APackageProps>();


const vm = reactive<any>({
  isWebPackage: props.isWebPackage || false,
  packageData: null,
  display: props.display,
  displayClass: props.displayClass,
  showEmptyBasket: props.showEmptyBasket,
  titleNumber: props.titleNumber,
  eventsSubscriptions: [],
  allocationData: undefined,
  datepickerProps: null,
  peopleSelectProps: null,
  nightsSelectProps: null,
  datepickerInstance: null,
  onDateIsSelected: null,
  bookPackageAfterSave: null,
  getAllocationInProgress: false,
  isCustomerArea: props.isCustomerArea,
  isReviewsEditingAllowed: false,
});



const subTitle = computed(() => {
  if (!props.showSubtitle) {
    return undefined;
  }

  const locationName = vm.packageData.location.name;
  const locationNumber = vm.packageData.locationNumber;

  if (!locationNumber || locationNumber === 1) {
    return locationName;
  }

  return `${locationName} ${locationNumber}`;
});

const sectionTitle = computed(() => {
  if (vm.display === "full-package") {
    const locationName = vm.packageData.location.name;
    return `${locationName} - details`;
  } else {
    return "";
  }
});

const days = computed(() => {
  return vm.packageData?.days;
});

const peopleCount = computed(() => {
  return vm.packageData?.peopleCount || 0;
});

const nightsCount = computed(() => {
  if (currentSiteArea.isCustomerArea()) {
    return vm.packageData?.inRangeDaysCount > 0 ? vm.packageData.inRangeDaysCount - 1 : 0;
  }

  return days.value.length - 1;
});

const areReviewsEnabled = computed(() => {
  return vm.display === "full-package" && vm.isCustomerArea && vm.isReviewsEditingAllowed;
});

onMounted(() => {
  if (props.useCurrent) {
    subscribeAll();
  }

  if (props.useCurrent) {
    const viewData = packageBuilder.getViewData();
    vm.packageData = viewData ? {...viewData} : null;
  } else if (props.usePackageData) {
    vm.packageData =  packageViewDataPreparer.prepare(
        props.usePackageData,
        null,
        null,
    );
  }
});

onUnmounted(() => {
  unsubscribeAll();
});

watch(() => props.usePackageData, () => {
  onNewPackageData({isLoaded: true});
});

watch(() => props.useCurrent, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    subscribeAll();
  } else if (oldVal && !newVal) {
    unsubscribeAll();
  }

  onNewPackageData({isLoaded: true});
});


async function onNewPackageData(config?) {
  if (props.useCurrent) {
    if (packageBuilder.getViewData()) {
      vm.packageData = {...packageBuilder.getViewData()};
    } else {
      vm.packageData = undefined;
    }
  } else {
    vm.packageData = packageViewDataPreparer.prepare(
        props.usePackageData,
        null,
        null,
    );
  }

  vm.isReviewsEditingAllowed = currentEvent.isReviewsEditingAllowed();

  prepareDatepickerPropsIfNeed(config);
  prepareNightsSelectPropsIfNeed(config);
  preparePeopleSelectPropsIfNeed(config);
  await updateAllocations();
}

function isReviewEditingAllowed(packageProduct: PackageProduct): boolean {
  if (!areReviewsEnabled.value) {
    return false;
  }

  const product = packageProduct?.product;
  const customerId = currentCustomer.getId();

  if (!packageProduct || !product || !customerId) {
    return false;
  }

  const category = product.getCategory();

  if (!category?.name || category.name.toLowerCase() === 'kitty') {
    return false;
  }

  return packageProduct.isConfirmed() && packageProduct.isCustomerAttending(customerId);
}

function isMultiActivity(packageProduct: PackageProduct): boolean {
  return packageProduct.product.isMultiActivity();
}

function getProductOptions(packageProduct: PackageProduct): IProductOption[] {
  return packageProduct.product.isAllProductsForOptions() ?
    packageProduct.product.getOptions() : packageProduct.product.getSelectedOptions();
}

function prepareDescriptionForProductOption(packageProductDescription: IPackageProductViewModel, productOption: IProductOption, dayIndex: number) {
  const packageProduct = packageBuilder.prepareProductForPackage(productOption.product, dayIndex, {
    isProductOption: true,
    parentProductId: packageProductDescription.packageProduct.productId,
  });

  const viewName = packageProduct.product.getOriginalName();

  return {...packageProductDescription, packageProduct, viewName};
}

function getReviewItem(productId: string) {
  const customerId = currentCustomer.getId();
  const reviews = currentEvent.getCustomerReviews(customerId);

  if (!reviews?.products?.list?.length) {
    return null;
  }

  return reviews.products.list.find(item => item.id === productId);
}

function prepareDatepickerPropsIfNeed(config) {
  if (!config?.isLoaded) {
    return;
  }

  const canChangeDate = currentSiteArea.isCustomerArea() &&
    eventPermissionsService.hasPermission('packagePageFunctions.editDate', {});

  const startDate = vm.packageData ? vm.packageData.startDate : undefined;
  const settingsStartDate = settingsTemplateService.getSettingsStartDate();

  let minDate = settingsStartDate.minDate;

  if (startDate && startDate < minDate) {
    minDate = startDate;
  }

  let maxDate = settingsStartDate.maxDate;

  if (startDate && startDate > maxDate) {
    maxDate = startDate;
  }

  const dataTemplate = dataTemplateFabric.get({name: 'event'});
  const valFromTemplate = dataTemplate.getRaw('event.dateRequired');
  const isDateRequired = valFromTemplate ? valFromTemplate.required === 'Yes' : true;

  vm.datepickerProps = {
    minDate,
    maxDate,
    disabled: !canChangeDate,
    required: isDateRequired,
  };
}

function prepareNightsSelectPropsIfNeed(config) {
  if (!config?.isLoaded) {
    return;
  }

  const settingsNights = settingsTemplateService.getSettingsNights();

  vm.nightsSelectProps = {
    disabled: vm.datepickerProps.disabled,
    options: getNightsOptionsList(settingsNights),
    labelGetter: (v) => v === 1 ? `${v} Night` : `${v} Nights`,
  };
}

function getNightsOptionsList(settingsNights) {
  if (!settingsNights) {
    return [];
  }

  return settingsNights.possibleCounts;
}

function preparePeopleSelectPropsIfNeed(config) {
  if (!config?.isLoaded) {
    return;
  }

  const canChangePeople = currentSiteArea.isCustomerArea() &&
    eventPermissionsService.hasPermission('packagePageFunctions.editEstimatedCustomers', {});

  const settingsPeople = settingsTemplateService.getSettingsPeople();

  const peopleCountIsReadOnly = !currentEvent.isManualUpdateOfPeopleCountPossible() ||
      eventBookedHistoryService.isHistoryBookedMode();

  const peopleOptionsList = getPeopleCountOptionsList(settingsPeople, peopleCount.value, peopleCountIsReadOnly);

  vm.peopleSelectProps = {
    disabled: !canChangePeople || peopleCountIsReadOnly || peopleOptionsList.length < 2,
    options: peopleOptionsList,
    labelGetter: (v) => `${v} People`,
  };
}

function getPeopleCountOptionsList(settingsPeople, peopleValue, peopleCountIsReadOnly) {
  if (!settingsPeople) {
    return [];
  }

  let possiblePeopleCounts = settingsPeople.possibleCounts;

  const attending = currentEvent.getAttendingCustomerCount();

  if (attending) {
    possiblePeopleCounts = possiblePeopleCounts.filter(value => value >= attending);
  }

  if (peopleCountIsReadOnly || possiblePeopleCounts.length === 0) {
    possiblePeopleCounts = [peopleValue];
  }

  if (possiblePeopleCounts.indexOf(peopleValue) === -1) {
    possiblePeopleCounts.push(peopleValue);

    possiblePeopleCounts.sort((a, b) => a - b);
  }

  return possiblePeopleCounts;
}

function subscribeOnPackageUpdated() {
  return packageBuilder.onChanged(async (changed) => {
    if (!changed) {
      return;
    }

    setTimeout(async () => {
      await onNewPackageData({isUpdated: true});
    }, 300);
  });
}


function subscribeOnPackageLoaded() {
  return packageBuilder.onPackageLoaded(async (value) => {
    if (!value) {
      return;
    }

    setTimeout(async () => {
      await onNewPackageData({isLoaded: true});
    }, 300);
  });
}


function subscribeOnPriceViewValueChange() {
  return productPriceViewService.subscribeOnPriceViewValueChange(
      async (value) => {
        if (!value) {
          return;
        }
        // Need to wait a bit to get updated packageBuilder viewData.
        // It uses the same subscription subscribeOnPriceViewValueChange
        setTimeout(async () => {
          await onNewPackageData();
        }, 300);
      }
  );
}


function subscribeOnStartPackageSaving() {
  return packageSaver.beforeCurrentPackageSaved(event => {
    showCalendarIfNeed(event, vm.datepickerProps?.required)
  });
}


function subscribeOnStartPackageBooking() {
  return packageBookingNotifyService.onBeforePackageBooking()
      .subscribe(event => {
        vm.onDateIsSelected = () => vm.bookPackageAfterSave = true;
        showCalendarIfNeed(event, true);
      });
}


function subscribeOnCurrentEventBookedMode() {
  return currentEventStore.$onAction(({name, after}) => {
    if (name !== 'setCurrentEventBookedMode' && name !== 'resetCurrentEventBookedMode') {
      return;
    }

    after(() => {
      setTimeout(async () => {
        await onNewPackageData({isLoaded: true});
      }, 300);
    });
  });
}


function subscribeOnCurrentUserRolesChanged() {
  return currentUser.afterCurrentUserRolesChanged()
    .subscribe(async () => {
      await onNewPackageData({isLoaded: true});
    });
}


async function updateAllocations() {
  if (!packageBuilder.getPackage()) {
    return;
  }

  if (vm.getAllocationInProgress || packageBuilder?.getPackage().isBooked()) {
    return;
  }

  vm.getAllocationInProgress = true;

  const data = await packageAllocationInfoHelperService.getAllocationDetails();
  vm.getAllocationInProgress = false;

  if (!data) {
    return;
  }

  vm.allocationData = data;
}


function isFirstDay(dayIndex: any): boolean {
  return days.value.findIndex(day => day.dayIndex === dayIndex) === 0;
}


function onPackageStartDateUpdate(date) {
  packageBuilder.setStartDate(date);

  if (date && vm.onDateIsSelected) {
    vm.onDateIsSelected();
    vm.onDateIsSelected = null;
  }

  savePackageIfNeed();
}


function onPackageNightsUpdate(nights) {
  if (nights !== nightsCount) {
    packageBuilder.setNightsCount(nights);
    savePackageIfNeed();
  }
}


function onPackagePeopleUpdate(people) {
  packageBuilder.setPeopleCount(people);
  savePackageIfNeed();
}


function onDatepickerInstanceUpdate(value) {
  vm.datepickerInstance = value;
}


function savePackageIfNeed() {
  setTimeout(() => {
    const afterCurrentPackageSavedSubscription = packageSaver.afterCurrentPackageSaved(() => {
      afterCurrentPackageSavedSubscription.unsubscribe();

      if (vm.bookPackageAfterSave) {
        packageBookingNotifyService.notifyNeedBookPackage();
      }

      customerEvents.reload();
    });

    const event = new CustomEvent('needToSaveCurrentPackage', {cancelable: true});
    currentEvent.notifyNeedToSaveCurrentPackage(event);
  }, 100);
}


function showCalendarIfNeed(event, dateIsRequiredOverride) {
  if (dateIsRequiredOverride === false) {
    return;
  }

  if (needToSetDate(dateIsRequiredOverride)) {
    // saveEventIfDateIsSelected = true;

    if (vm.datepickerInstance) {
      vm.datepickerInstance.openMenu();
    }

    event.preventDefault();
  }
}

function needToSetDate(dateIsRequiredOverride = false) {
  return (dateIsRequiredOverride || vm.datepickerProps?.required) && !vm.packageData.startDate;
}


function subscribeAll() {
  if (vm.eventsSubscriptions?.length > 0) {
    return;
  }

  vm.eventsSubscriptions = [];
  vm.eventsSubscriptions.push(subscribeOnPackageLoaded());
  vm.eventsSubscriptions.push(subscribeOnPackageUpdated());
  vm.eventsSubscriptions.push(subscribeOnPriceViewValueChange());
  vm.eventsSubscriptions.push(subscribeOnStartPackageSaving());
  vm.eventsSubscriptions.push(subscribeOnStartPackageBooking());
  vm.eventsSubscriptions.push(subscribeOnCurrentEventBookedMode());
  vm.eventsSubscriptions.push(subscribeOnCurrentUserRolesChanged());
}


function unsubscribeAll() {
  if (!vm.eventsSubscriptions?.length) {
    return;
  }

  vm.eventsSubscriptions.forEach((s) => {
    if (s.unsubscribe) {
      s.unsubscribe()
    } else {
      s();
    }
  });

  vm.eventsSubscriptions = null;
}


</script>
<style lang="scss">
.package-itinerary {
  width: 100%;
  padding-bottom: 52px;
}
.full-package {
  .title-number {
    display: inline-block;
    color: white;
    font-size: 20px;
    line-height: 1;
    padding: 5px;
    text-align: center;
    background-color: $C1;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    letter-spacing: 0;
    position: relative;
    top:-4px;
  }
  .package-date{
    color: $CB-2;
  }
  .section-sub-title {
    font-family: $ff2;
    text-transform: uppercase;
    letter-spacing: 10px;
    font-size: 24px;
    font-weight: 300;
  }
  .package-wrapper {
    .cancelled-wrapper{
      font-size:20px;
      font-family: $ff2;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: white;
      font-weight: 600;
    }
    @include mobile {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    @include desktop {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }
    .package-itinerary {
      @include mobile {
        max-width: 600px;
        margin: 0 auto;
        padding: 0 2.5%;
      }
      @include desktop {
        width: 600px;
        margin-left: auto;
      }
    }
  }
  .package-controls {
    display: flex;
    flex-direction: column;
    align-items: center;

    @include desktop {
      width: clamp(360px, calc(50vw - 300px), 10000px);
    }

    .sticky {
      position: sticky;
      top: 100px;
      border-radius: 3px;
      background: white;

      text-align: center;


      font-size: 16px;
      font-family: $ff2;
      padding: 20px;
      @include mobile {
        // background: initial;
        max-width: 400px;
        // color: $ct;
        margin-top: 40px;
      }
      @include desktop {
        width: 320px;

      }

      .price {
        font-size: 64px;
      }
      .package-buttons {
        .button-main {
          margin-top: 10px;
        }
      }
    }
  }
}
.basket {

  .package-buttons {
    width: 100%;
    display: flex;
    flex-grow: 1;
  }
  .package-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    bottom: 10px;
    .sticky {
      width: 100%;
      position: sticky;
      top: 100px;
    }
  }
}
.package-controls {
  .package-itinerary {
    @media (max-width: 960px) {
      margin: 0 auto;
    }
  }
}
</style>
