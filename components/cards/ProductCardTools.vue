<template>
  <reveal-content :open="open" v-if="toolAllowed() && productFunctions.length">
    <ul class="product-card-tools" :class="[open ? 'open' : 'closed']">
      <template v-for="(func, funcKey) in productFunctions" :key="funcKey">
        <li>
          <template v-for="(button, key) in func.buttons" :key="key">
            <div>
              <ListButton @click="button.onClick()" :text="button.longLabel" />
            </div>
          </template>
        </li>
      </template>
    </ul>
  </reveal-content>
</template>

<script lang="ts">
import {useEventPackageBuilder} from "~/services/helpers/package-builder/package-builder.service.factory";
import {useCsLodash} from "~/services/cs-lodash.factory";
import {useCurrentCustomer} from "~/services/helpers/user-common/current-customer-service.factory";
import {useCategoryService} from "~/services/helpers/category.service.factory.";
import {useCurrentEvent} from "~/services/helpers/event/current-event.service.factory";
import {usePackageSaver} from "~/services/helpers/package-builder/package-saver.service.factory";
import {usePermissionFunctionsService} from "~/services/helpers/event/permission-functions.service.factory";
import {PackageQueryParams} from "~/services/helpers/package-builder/package-url-query-params";
import {useLocationService} from "~/services/helpers/location.service.factory";
import {useToolsDialogShowService} from '~/services/dialog/tools-dialog-show.service';
import {useHideProductDialogShowService} from '~/services/dialog/product-tools/hide-product-dialog-show.service';
import {
  usePreferredStartTimeDialogShowService
} from '~/services/dialog/product-tools/preferred-start-time-dialog-show.service';
import {useBasketStore} from '~/store/basket';
import {useStartTimeDialogShowService} from '~/services/dialog/product-tools/start-time-dialog-show.service';
import {
  useSwapProductSupplierDialogShowService
} from '~/services/dialog/product-tools/swap-product-supplier-dialog-show.service';
import {useEditVenueDialogShowService} from '~/services/dialog/product-tools/edit-venue-dialog-show.service';
import {useEditCustomersDialogShowService} from '~/services/dialog/product-tools/edit-customers-dialog-show.service';
import {
  useEditCustomersAttendingDialogShowService
} from '~/services/dialog/product-tools/edit-customers-attending-dialog-show.service';
import type {EditCustomersDialogResult} from '~/components/dialog/product-tools/EditCustomersDialog.vue';
import type {EditCustomersAttendingDialogResult} from '~/components/dialog/product-tools/EditCustomersAttendingDialog.vue';
import type {DialogResult} from '~/services/dialog/core/dialog.typings';
import {
  useAcceptDeclineProductDialogShowService
} from '~/services/dialog/product-tools/accept-decline-product-dialog-show.service';
import {
  useEditProductStageDialogShowService
} from '~/services/dialog/product-tools/edit-product-stage-dialog-show.service';
import {
  useAcceptProductCancellationDialogShowService
} from '~/services/dialog/product-tools/accept-product-cancellation-dialog-show.service';
import {
  useEditParticipationDialogShowService
} from '~/services/dialog/product-tools/edit-participation-dialog-show.service';
import {
  usePackageBuilderAlertsService
} from '~/services/helpers/package-builder/package-builder-alerts.service.factory';
import {
  useEditFlightDetailsDialogShowService
} from '~/services/dialog/product-tools/edit-flight-details-dialog-show.service';
import {
  useEditProductNoteDialogShowService
} from '~/services/dialog/product-tools/edit-product-note-dialog-show.service';
import {useCancelProductDialogShowService} from '~/services/dialog/product-tools/cancel-product-dialog-show.service';
import {
  useEditProductCostDialogShowService
} from '~/services/dialog/product-tools/edit-product-cost-dialog-show.service';
import {
  useEditProductPriceDialogShowService
} from '~/services/dialog/product-tools/edit-product-price-dialog-show.service';
import {useVenueMapUrlBuilderService} from '~/services/helpers/venue-map-url-builder.factory';
import {getWindowSafe} from '~/services/helpers/browser/browser.helpers';
import {
  usePackageConfirmationHelperService
} from '~/services/helpers/package-builder/package-confirmation-helper.service.factory';
import { useEventBookedHistoryService } from '~/services/helpers/event/event-booked-history.service.factory';
import { useCurrentSupplier } from '~/services/helpers/supplier-common/current-supplier.factory';
import {ProductViewMode, useProductViewModeStore} from '~/store/productViewMode';
import {useMessageService} from '~/services/helpers/message.factory';
import {
  useCustomContentDialogShowService
} from '~/services/dialog/product-tools/custom-content-dialog-show.service';
import { useCustomerEvents } from '~/services/helpers/event/customer-events.service.factory';
import chilliLocalStorageService from '~/services/helpers/storage/chilli-local-storage.service';

export default {
  setup() {
    return {
      router: useRouter(),
      packageBuilder: useEventPackageBuilder(),
      csLodash: useCsLodash(),
      currentCustomer: useCurrentCustomer(),
      categoryService: useCategoryService(),
      currentEvent: useCurrentEvent(),
      customerEvents: useCustomerEvents(),
      packageSaver: usePackageSaver(),
      permissionFunctionsService: usePermissionFunctionsService(),
      locationService: useLocationService(),
      toolsDialogShowService: useToolsDialogShowService(),
      hideProductDialogShowService: useHideProductDialogShowService(),
      preferredStartTimeDialogShowService: usePreferredStartTimeDialogShowService(),
      startTimeDialogShowService: useStartTimeDialogShowService(),
      swapProductSupplierDialogShowService: useSwapProductSupplierDialogShowService(),
      editVenueDialogShowService: useEditVenueDialogShowService(),
      editCustomersDialogShowService: useEditCustomersDialogShowService(),
      editCustomersAttendingDialogShowService: useEditCustomersAttendingDialogShowService(),
      acceptDeclineProductDialogShowService: useAcceptDeclineProductDialogShowService(),
      editProductStageDialogShowService: useEditProductStageDialogShowService(),
      acceptProductCancellationDialogShowService: useAcceptProductCancellationDialogShowService(),
      editParticipationDialogShowService: useEditParticipationDialogShowService(),
      editFlightDetailsDialogShowService: useEditFlightDetailsDialogShowService(),
      editProductNoteDialogShowService: useEditProductNoteDialogShowService(),
      cancelProductDialogShowService: useCancelProductDialogShowService(),
      editProductCostDialogShowService: useEditProductCostDialogShowService(),
      editProductPriceDialogShowService: useEditProductPriceDialogShowService(),
      venueMapUrlBuilderService: useVenueMapUrlBuilderService(),
      packageBuilderAlertsService: usePackageBuilderAlertsService(),
      basketStore: useBasketStore(),
      packageConfirmationHelperService: usePackageConfirmationHelperService(),
      eventBookedHistoryService: useEventBookedHistoryService(),
      currentSupplier: useCurrentSupplier(),
      productViewModeStore: useProductViewModeStore(),
      messageService: useMessageService(),
      customContentDialogShowService: useCustomContentDialogShowService(),
      localStorage: chilliLocalStorageService
    }
  },

  props: ['open', 'packageProductDescription', 'forBasket', 'dayIndex'],

  data() {
    return {
      savePackageInProgress: false,
      eventsSubscriptions: [],
      productFunctions: [],
      productCustomDataKey: 'chillisauce.productcustomdata'
    }
  },

  mounted() {
    this.init();
  },

  beforeUpdate() {
    this._initPackageProductFunctions();
  },

  unmounted() {
    this.eventsSubscriptions.forEach(s => s.unsubscribe());
  },

  methods: {
    init() {
      this._initPackageProductFunctions();

      this._initCurrentPackageSavedListeners();
    },

    toolAllowed() {
      return !this.eventBookedHistoryService.isHistoryBookedMode();
    },

    remove() {
      this.packageBuilder.removeProduct(this.packageProductDescription.packageProduct);
    },

    moveUp() {
      this.packageBuilder.moveProductUp(this.packageProductDescription.packageProduct);
    },

    moveDown() {
      this.packageBuilder.moveProductDown(this.packageProductDescription.packageProduct);
    },

    copyUp() {
      this.packageBuilder.copyProductUp(this.packageProductDescription.packageProduct);
    },

    copyDown() {
      this.packageBuilder.copyProductDown(this.packageProductDescription.packageProduct);
    },

    view() {
      const section = this.packageBuilder.getPackage().getSection();
      const locationName = this.packageBuilder.getPackage().getLocation().name;
      const categoryUrl = this.packageProductDescription.packageProduct.product.getCategoryUrl();
      const productId = this.packageProductDescription.packageProduct.product.getId();
      const supplierId = this.packageProductDescription.packageProduct.product.getSupplier()?.id;

      const prepareLocationName = this.locationService.prepareLocationNameForUrl(locationName);

      let url = `/${section}/in-${prepareLocationName}/do-${categoryUrl}/go-${productId}`;

      const currentUrl = unref(this.router.currentRoute).fullPath;
      if (currentUrl.indexOf('/my-events') !== -1) {
        url = '/my-events/package' + url;
      } else if (currentUrl.indexOf('/supplier') === 0) {
        url = `/supplier/${supplierId}/event/${this.currentEvent.getId()}/package/${section}/in-${prepareLocationName}/do-${categoryUrl}/go-${productId}`;
      }

      let productViewMode;

      if (this.basketStore.isOpened) {
        productViewMode = ProductViewMode.basket;
      } else {
        productViewMode = ProductViewMode.package;
      }

      this.router.push({
        path: url,
        query: {
          ...unref(this.router.currentRoute).query,
          [PackageQueryParams.viewProduct]: true,
          [PackageQueryParams.viewProductMode]: productViewMode,
          itineraryId: this.packageProductDescription.packageProduct.itineraryId,
          newItineraryId: this.packageProductDescription.packageProduct.addItineraryId,
        }
      });

      this.productViewModeStore.set(ProductViewMode.package);
      this.basketStore.close();
    },

    async showPreferredStartTimeDialog() {
      const data = {
        possibleTimeList: this._getPossiblePreferredTimes(),
        possibleOffsetList: this.csLodash.range(0, 6),
        allowTime: this.packageProductDescription.packageProduct.duration,
        startTime: this.packageProductDescription.packageProduct.startTime,
        preferredStartTimeRange: this.packageProductDescription.packageProduct.preferredStartTimeRange
      };

      const result = await this.preferredStartTimeDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.setPreferredStartTime(this.packageProductDescription.packageProduct,
        result.data.preferredTime, result.data.preferredStartTimeRange);

      await this._savePackage('editPreferredStartTime');
    },

    async showStartTimeDialog() {
      const data = {
        possibleTimeList: this._getPossiblePreferredTimes(),
        startTime: this.packageProductDescription.packageProduct.startTime,
        preferredStartTimeOffset: this.packageProductDescription.packageProduct.preferredStartTimeRange as number
      };

      const result = await this.startTimeDialogShowService.show({data});

      if (result?.cancelled) {
        return;
      }

      if (!result?.data?.startTime) {
        return;
      }

      this.packageBuilder.setProductStartTime(this.packageProductDescription.packageProduct, result.data.startTime);

      await this._savePackage('editStartTime');
    },

    async showSwapSupplierDialog() {
      const data = {
        supplier: this.packageProductDescription.packageProduct.getSupplier(),
      };

      const result = await this.swapProductSupplierDialogShowService.show({data});

      if (result.cancelled) {
        return;
      }

      if (!result?.data?.supplier) {
        return;
      }

      this.packageBuilder.setProductSupplier(this.packageProductDescription.packageProduct, result.data.supplier);

      await this._savePackage('editSupplier');
    },

    async showEditVenueDialog() {
      const data = {
        packageProduct: this.packageProductDescription.packageProduct
      };

      const result = await this.editVenueDialogShowService.show({data});


      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      if (!result.data.venueId && !result.data.meetingPointId) {
        return;
      }

      this.packageBuilder.setProductVenueInfo(this.packageProductDescription.packageProduct, result.data);
      await this._savePackage('editVenue');
    },

    async showHideProductDialog() {
      const hideProduct = this.packageProductDescription.packageProduct.hideProduct;

      const data = {hideProduct};

      const result = await this.hideProductDialogShowService.show({data});

      if (result.cancelled) {
        return;
      }

      if (typeof result.data?.hideProduct !== 'boolean') {
        return;
      }

      this.packageBuilder.setProductShowHide(this.packageProductDescription.packageProduct, result.data.hideProduct);

      await this._savePackage('hideProduct');
    },

    async showEditCustomersDialog() {
      let showDialogPromise: Promise<DialogResult<EditCustomersDialogResult | EditCustomersAttendingDialogResult>>;

      if (this.currentEvent.isManualUpdateOfPeopleCountPossible()) {
        const data = {
          packageProductDescription: this.packageProductDescription,
          packagePeopleCount: this.packageProductDescription.packageProduct.getPackage().getPeopleCount(),
        };

        showDialogPromise = this.editCustomersDialogShowService.show({data});
      } else {
        const data = {
          packageProductDescription: this.packageProductDescription
        };

        showDialogPromise = this.editCustomersAttendingDialogShowService.show({data});
      }

      const result = await showDialogPromise;

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.setGuestsInfo(this.packageProductDescription.packageProduct, result.data);
      await this._savePackage('editCustomers');
    },

    async editProductContent() {
      let dialogData;

      if (this.forBasket) {
        dialogData = {
          isCustomData: true,
        };

        if (this.currentEvent.has()) {
          dialogData.eventId = this.currentEvent.getId();
        }

        this.localStorage.store(this.productCustomDataKey, {
          model: this.packageProductDescription.packageProduct.product.toJSON(),
        });
      } else {
        dialogData = {
          eventId: this.currentEvent.getId(),
          packageId: this.currentEvent.getCurrentPackageId(),
          productId: this.packageProductDescription.packageProduct.product.getId(),
        };
      }

      const result = await this.customContentDialogShowService.show({data: dialogData});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      if (this.forBasket) {
        const customData = this.localStorage.retrieve(this.productCustomDataKey);

        const packageProducts = this.packageProductDescription.packageProduct.getPackage()
            .getAllProductOccurrences(this.packageProductDescription.packageProduct.productId);

        for (const packageProduct of packageProducts) {
          this.packageBuilder.setProductCustomData(packageProduct, customData.model);
        }
      } else {
        this.currentEvent.reload();

        const subscription = this.currentEvent.afterCurrentEventLoaded(() => {
          subscription.unsubscribe();
          this.customerEvents.reload();
          this.packageBuilder.loadCurrent();
        });
      }
    },

    async showAcceptDeclineProductDialog() {
      const data = {
        packageProduct: this.packageProductDescription.packageProduct,
      };

      const result = await this.acceptDeclineProductDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.processProductConfirmationResult(this.packageProductDescription.packageProduct, result.data);

      this._savePackage('bookProduct', true);
    },

    async showEditProductStageDialog() {
      const originalProductData = this.packageBuilder.getOriginalPackageProductData(
        this.packageProductDescription.packageProduct.productListItemId);

      const packageProduct = this.packageProductDescription.packageProduct;

      const data = {
        itineraryId: packageProduct.itineraryId,
        productStage: packageProduct.stage,
        wasConfirmed: packageProduct.wasConfirmed(),
        savedProductStage: originalProductData ? originalProductData.stage : null,
      };

      const result = await this.editProductStageDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.setProductStage(this.packageProductDescription.packageProduct, result.data.productStage);

      this._savePackage('editProductStage');
    },

    async showProductCancelDialog() {
      const supplier = this.packageProductDescription.packageProduct.getSupplier();

      let exchangeRate = this.packageProductDescription.packageProduct.product.getPriceCalculator()
        .getExchangeRate(supplier.currencyName);

      if (this.packageProductDescription.packageProduct.money) {
        exchangeRate = this.packageProductDescription.packageProduct.money.exchangeRate;
      }

      const data = {
        costCurrency: this.packageProductDescription.packageProduct.money ?
          this.packageProductDescription.packageProduct.money.costCurrency : null,
        currencySymbol: supplier.currencySymbol,
        exchangeRate: exchangeRate,
        priceGBP: this.packageProductDescription.packageProduct.money ?
          this.packageProductDescription.packageProduct.money.priceGBP : null
      };


      const result = await this.cancelProductDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.cancelProduct(this.packageProductDescription.packageProduct, result.data);

      this._savePackage('cancelProduct');
    },

    async showAcceptProductCancellationDialog() {
      const supplier = this.packageProductDescription.packageProduct.getSupplier();

      const data = {
        costCurrency: this.packageProductDescription.packageProduct.money ?
          this.packageProductDescription.packageProduct.money.costCurrency : null,
        currencySymbol: supplier.currencySymbol,
      };

      const result = await this.acceptProductCancellationDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.acceptProductCancellation(this.packageProductDescription.packageProduct);
      this._savePackage('acceptCancellation');
    },

    async showEditParticipationDialog() {
      const data = {
        customerId: this.currentCustomer.getId(),
        packageProduct: this.packageProductDescription.packageProduct
      };

      const result = await this.editParticipationDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      if (!result?.data?.changed) {
        return;
      }

      await nextTick(async () => {
        const alertResult = await this.packageBuilderAlertsService
            .showChangePlaceAlert({attended: result.data.attending !== 'Yes', type: 'product'});

        if (!alertResult) {
          return;
        }

        if (alertResult.cancelled) {
          return;
        }

        this.packageBuilder.editItineraryAttending(this.packageProductDescription.packageProduct,
            result.data.customerId, result.data.attending);

        this._savePackage('editParticipation', true);
      })
    },

    async showEditFlightDetailsDialog() {
      const data = this.packageProductDescription.packageProduct.flightDetails;

      const result = await this.editFlightDetailsDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.editFlightDetails(this.packageProductDescription.packageProduct, result.data.flightDetails);

      this._savePackage('editFlightDetails');
    },

    async showEditProductNoteDialog() {
      const data = {
        productNoteList: this.packageProductDescription.packageProduct.productNote,
      };

      const result = await this.editProductNoteDialogShowService.show({data});


      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.editProductNote(this.packageProductDescription.packageProduct, result.data.productNoteList);

      this._savePackage('productNote');
    },

    swapProduct() {
      const queryParams = {
        'day-index': this.dayIndex,
        [PackageQueryParams.swapProduct]: this.packageProductDescription.packageProduct.itineraryId,
        newItineraryId: this.packageProductDescription.packageProduct.addItineraryId,
      };

      const section = this.packageBuilder.getPackage().getSection();
      const locationName = this.packageBuilder.getPackage().getLocation().name;
      const prepareLocationName = this.locationService.prepareLocationNameForUrl(locationName);

      const targetUrl = `/my-events/package/swap-product/${section}/in-${prepareLocationName}`;

      this.router.push({
        path: targetUrl,
        query: {...unref(this.router.currentRoute).query, ...queryParams},
      });
    },

    async showEditProductPriceDialog() {
      const packageProductPricePair = this.packageProductDescription.packageProduct.getPrice({getPricePair: true});

      if (packageProductPricePair === null || packageProductPricePair?.agency === null) {
        const message = 'Product don\'t have correct price-calculation configuration. ' +
            'It\'s impossible to calculate cost values. ' +
            'Please use "Product custom" or "Edit product price" functionality first.';

        return this.messageService.showErrorMessage(message, 10 * 1000);
      }

      const money = this.packageProductDescription.packageProduct.money;

      const notOverriddenPricePerPersonGBP = this.packageProductDescription.packageProduct.getPrice({
        priceTarget: 'package',
        skipVatExcluding: true,
        ignorePriceOverridden: true
      });

      const product = this.packageProductDescription.packageProduct.product;
      const fixedPrice = product.isFixedPrice();

      const costing = product.getCosting();

      const costingWithFixedPrice = costing.costItem.find(i => isFinite(i.cost.fixedPrice));

      const data = {
        priceOverride: money ? money.priceOverride : null,
        bookedPricePerPersonGBP: money ? money.bookedPricePerPersonGBP : null,
        minPricePerPersonGBP: money ? money.minPricePerPersonGBP : null,
        pricePerPersonGBP: money ? money.pricePerPersonGBP : null,
        hasFixedPrice: fixedPrice && !!(costingWithFixedPrice),
        notOverriddenPricePerPersonGBP
      };

      const result = await this.editProductPriceDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return ;
      }

      this.packageBuilder.editProductPrice(this.packageProductDescription.packageProduct, result.data);

      this._savePackage('editPrice');
    },

    async showEditProductCostDialog() {
      const money = this.packageProductDescription.packageProduct.money;

      const data = {
        costOverride: money ? money.costOverride : null,
        agency: money && money.costOverrideDetails ? money.costOverrideDetails.agency : null,
        per: money && money.costOverrideDetails ? money.costOverrideDetails.per : null,
        unitType: this.packageProductDescription.packageProduct.product.getConfig().unitType,
        maxPeoplePerUnit: this.packageProductDescription.packageProduct.product.getMaxPeoplePerUnitValue()
      };

      const result = await this.editProductCostDialogShowService.show({data});

      if (!result) {
        return;
      }

      if (result.cancelled) {
        return;
      }

      this.packageBuilder.editProductCost(this.packageProductDescription.packageProduct, result.data);

      this._savePackage('editCost');
    },

    async showProductMap() {
      const product = this.packageProductDescription.packageProduct.product;

      if (!product.hasSelectedVenue()) {
        return;
      }

      const selectedProductVenue = product.getSelectedVenue();

      const venue = selectedProductVenue.getMeetingPoint() || selectedProductVenue.getMainVenue();

      const window = getWindowSafe();

      const url = await this.venueMapUrlBuilderService.getVenueGoogleMapUrlByVenueId(venue.getId());

      window.open(url, '_blank');
    },

    async _savePackage(functionName, needToReloadState = false) {
      if (!this._needSavePackage(functionName)) {
        return;
      }

      return this.packageSaver.savePackageForBuilder(needToReloadState);
    },

    // getEditProductPanelViewable() {
    //   return this.currentViewablePanel.isPanelViewable(this.index,
    //     PACKAGE_BUILDER_PANEL_TYPES['productEdit'],
    //     this.productIndexInDay);
    // },

    async _initPackageProductFunctions() {
      const product = this.packageProductDescription.packageProduct.product;

      const additionalContext = {
        itineraryId: this.packageProductDescription.packageProduct.itineraryId,
        productType: product ? product.getType() : null,
        productStage: this.packageProductDescription.packageProduct.stage,
      };

      let possiblePermissions = this._getPossiblePermissions();

      if (this.forBasket) {
        const basketPossiblePermissions = ['viewProduct', 'moveProduct', 'removeProduct', 'editStartTime',
          'customProduct'];
        possiblePermissions = this.csLodash.intersection(possiblePermissions, basketPossiblePermissions);
      }

      const functionsParameters = {
          possiblePermissions: possiblePermissions,
          permissionsGroup: 'packageProductFunctions',
          additionalContext: additionalContext,
          functionGetButtonClick: this._getButtonClick.bind(this),
          functionGetButtonsCount: this._getButtonsCount.bind(this),
          functionGetCustomIconClasses: this._getCustomIconClasses.bind(this),
          functionGetCustomButtonShortLabel: this._getCustomButtonShortLabel.bind(this),
          functionGetCustomButtonLongLabel: this._getCustomButtonLongLabel.bind(this),
          functionHasSeparatorBetweenButtons: this._hasSeparatorBetweenButtons.bind(this)
        };

      this.productFunctions = this.permissionFunctionsService
        .createFunctionsOrderedArray(functionsParameters);
    },

    getActualAccommodationChain() {
      const accommodationChain = this.packageProductDescription.packageProduct?.getPackageProductChain();

      const IGNORED_STAGES = [
        'Cancelled',
        'Pending Cancellation'
      ];

      return accommodationChain.filter(packageProduct => {
        return !IGNORED_STAGES.includes(packageProduct.stage);
      });
    },

    _getButtonClick(permissionName, buttonIndex) {
      let clickFunction;
      switch (permissionName) {
        case 'viewProduct':
          clickFunction = () => this.view();
          break;
        case 'removeProduct':
          clickFunction = () => this.remove();
          break;
        case 'editCustomers':
          clickFunction = () => this.showEditCustomersDialog();
          break;
        case 'editPreferredStartTime':
          clickFunction = () => this.showPreferredStartTimeDialog();
          break;
        case 'editStartTime':
          clickFunction = () => this.showStartTimeDialog();
          break;
        case 'customProduct':
          clickFunction = () => this.editProductContent();
          break;
        case 'editSupplier':
          clickFunction = () => this.showSwapSupplierDialog();
          break;
        case 'editVenue':
          clickFunction = () => this.showEditVenueDialog();
          break;
        case 'moveProduct':
          if (buttonIndex === 0) {
            const isAccommodation = this.packageProductDescription.packageProduct.product.isAccommodation();

            if (isAccommodation) {
              const accommodationChain = this.getActualAccommodationChain();
              const isAccommodationChain = isAccommodation ? accommodationChain?.length > 1 : false;

              const chainIndex =
                  accommodationChain.indexOf(this.packageProductDescription.packageProduct);

              if (isAccommodationChain && chainIndex === accommodationChain.length - 1) {
                clickFunction = () => this.moveDown();
              } else {
                clickFunction = () => this.moveUp();
              }
            } else {
              clickFunction = () => this.moveUp();
            }
          } else if (buttonIndex === 1) {
            clickFunction = () => this.moveDown();
          } else if (buttonIndex === 2) {
            clickFunction = () => this.copyUp();
          } else if (buttonIndex === 3) {
            clickFunction = () => this.copyDown();
          } else {
            clickFunction = null;
          }
          break;
        case 'hideProduct':
          clickFunction = () => this.showHideProductDialog();
          break;
        case 'bookProduct':
          clickFunction = () => this.showAcceptDeclineProductDialog();
          break;
        case 'editProductStage':
          clickFunction = () => this.showEditProductStageDialog();
          break;
        case 'cancelProduct':
          clickFunction = () => this.showProductCancelDialog();
          break;
        case 'acceptCancellation':
          clickFunction = () => this.showAcceptProductCancellationDialog();
          break;
        case 'editParticipation':
          clickFunction = () => this.showEditParticipationDialog();
          break;
        case 'editFlightDetails':
          clickFunction = () => this.showEditFlightDetailsDialog();
          break;
        case 'productNote':
          clickFunction = () => this.showEditProductNoteDialog();
          break;
        case 'swapProduct':
          clickFunction = () => this.swapProduct();
          break;
        case 'editPrice':
          clickFunction = () => this.showEditProductPriceDialog();
          break;
        case 'editCost':
          clickFunction = () => this.showEditProductCostDialog();
          break;
        case 'viewMap':
          clickFunction = () => this.showProductMap();
          break;
        default:
          clickFunction = null;
      }

      return (event) => {
        if (clickFunction && typeof clickFunction === 'function') {
          // code for hiding of the panel after button click
          // this.showOrHideEditProductPanel();

          // click function called with delay 200ms. it's related with price-calculation block position updating.
          // positions updates in 250ms after event sending
          setTimeout(() => {
            clickFunction(event);
          }, 100);
        }
      };
    },

    _hasSeparatorBetweenButtons(permissionName) {
      return false;
    },

    _getButtonsCount(permissionName) {
      const isAccommodation = this.packageProductDescription.packageProduct.product.isAccommodation();
      const accommodationChain = this.getActualAccommodationChain();
      const isAccommodationChain = isAccommodation ? accommodationChain?.length > 1 : false;

      if (permissionName === 'removeProduct') {
        if (isAccommodationChain) {
          const chainIndex =
              accommodationChain.indexOf(this.packageProductDescription.packageProduct);

          if (chainIndex !== 0 && chainIndex !== accommodationChain.length - 1) {
            return 0;
          }
        }

        return 1;
      }

      if (permissionName === 'moveProduct') {
        if (isAccommodationChain) {
          const chainIndex =
              accommodationChain.indexOf(this.packageProductDescription.packageProduct);

          if (chainIndex !== 0 && chainIndex !== accommodationChain.length - 1) {
            return 0;
          }

          return 1;
        } else if (isAccommodation) {
            return 4;
        }

        return 2;
      }

      if (permissionName === 'editPreferredStartTime') {
        if (!this._timeSelectionPossible()) {
          return 0;
        }
      }

      if (permissionName === 'editStartTime') {
        if (!this._timeSelectionPossible()) {
          return 0;
        }
      }

      return 1;
    },

    _getCustomIconClasses(permissionName, buttonIndex) {
      if (permissionName === 'moveProduct') {
        if (buttonIndex === 0) {
          return 'w18 rotate180';
        } else {
          return 'w18';
        }
      }

      return '';
    },

    _getCustomButtonShortLabel(permissionName, buttonIndex) {
      if (permissionName === 'moveProduct') {
        if (buttonIndex === 0) {
          return 'Up';
        } else {
          return 'Down';
        }
      }

      if (permissionName === 'bookProduct') {
        if (!this.packageConfirmationHelperService.possibleToDecline(this.packageProductDescription.packageProduct)) {
          return 'Update';
        }
      }

      return null;
    },

    _getCustomButtonLongLabel(permissionName, buttonIndex) {
      if (permissionName === 'bookProduct') {
        if (!this.packageConfirmationHelperService.possibleToDecline(this.packageProductDescription.packageProduct)) {
          return 'Update';
        }
      }

      if (permissionName === 'moveProduct') {
        const isAccommodation = this.packageProductDescription.packageProduct.product.isAccommodation();
        const accommodationChain = this.getActualAccommodationChain();

        const isAccommodationChain = isAccommodation ? accommodationChain?.length > 1 : false;

        if (buttonIndex === 0) {
          if (isAccommodationChain) {
            const chainIndex =
                accommodationChain.indexOf(this.packageProductDescription.packageProduct);

            if (chainIndex === accommodationChain.length - 1) {
              if (this.packageBuilder.getPackage() &&
                  this.dayIndex === this.packageBuilder.getPackage().getDaysCount() - 1) {
                return `Copy to Day ${this.dayIndex + 2}`;
              }

              if (this.dayIndex === 0) {
                return `Copy to Previous Day`;
              }

              return 'Copy to Next Day';
            } else if (chainIndex !== -1) {
              return 'Copy to Previous Day';
            }

            return ''
          }

          if (this.dayIndex === 0) {
            return `Move to Previous Day`;
          }

          return 'Move to Previous Day';
        } else if (buttonIndex === 1) {
          if (this.packageBuilder.getPackage() &&
              this.dayIndex === this.packageBuilder.getPackage().getDaysCount() - 1) {
            if (isAccommodationChain) {
              return `Copy to Day ${this.dayIndex + 2}`;
            }

            return `Move Down to Day ${this.dayIndex + 2}`;
          }

          if (isAccommodationChain) {
            return 'Copy to Next Day';
          }

          return 'Move to Next Day';
        } else if (buttonIndex === 2) {
          return 'Copy to Previous Day';
        } else if (buttonIndex === 3) {
          if (this.packageBuilder.getPackage() &&
              this.dayIndex === this.packageBuilder.getPackage().getDaysCount() - 1) {
            return `Copy to Day ${this.dayIndex + 2}`;
          }

          return 'Copy to Next Day';
        }
      }

      return null;
    },

    _getPossiblePreferredTimes() {
      return this.packageBuilder.getPossiblePreferredStartTimeList(this.packageProductDescription.packageProduct,
        this.dayIndex);
    },

    _timeSelectionPossible() {
      return this.packageProductDescription.packageProduct.product.timeSelectionPossible() &&
        this._getPossiblePreferredTimes().length > 0;
    },

    _initCurrentPackageSavedListeners() {
      const s1 = this.packageSaver.beforeCurrentPackageSaved(() => {
        this.savePackageInProgress = true;
      });

      this.eventsSubscriptions.push(s1);

      const s2 = this.packageSaver.afterCurrentPackageSaved(() => {
        this.savePackageInProgress = false;
      });

      this.eventsSubscriptions.push(s2);
    },

    _needSavePackage(functionName) {
      switch (functionName) {
        case 'bookProduct':
          return true;
        default:
          return false;
      }
    },

    _getPossiblePermissions() {
      const list = [
        this.getViewProductPermissionName(),
        this.getMoveProductPermissionName(),
        this.getRemoveProductPermissionName(),
        this.getEditCustomersPermissionName(),
        this.getEditPreferredStartTimePermissionName(),
        this.getEditStartTimePermissionName(),
        this.getCustomProductPermissionName(),
        this.getEditSupplierPermissionName(),
        this.getEditVenuePermissionName(),
        this.getEditProductPermissionName(),
        this.getHideProductPermissionName(),
        this.getBookProductPermissionName(),
        this.getEditProductStagePermissionName(),
        this.getCancelProductPermissionName(),
        this.getAcceptCancellationPermissionName(),
        this.getEditParticipationPermissionName(),
        this.getEditFlightDetailsPermissionName(),
        this.getEditProductNotePermissionName(),
        this.getSwapProductPermissionName(),
        this.getEditProductPricePermissionName(),
        this.getEditProductCostPermissionName(),
        this.getViewProductMapPermissionName()
      ];

      return this.csLodash.compact(list);
    },

    getViewProductPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'viewProduct';
    },

    getMoveProductPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      if (this.packageProductDescription.packageProduct.isCancelled()) {
        return null;
      }

      return 'moveProduct';
    },

    getRemoveProductPermissionName() {
      return 'removeProduct';
    },

    getEditCustomersPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editCustomers';
    },

    getEditPreferredStartTimePermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editPreferredStartTime';
    },

    getEditStartTimePermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editStartTime';
    },

    getCustomProductPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'customProduct';
    },

    getEditSupplierPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editSupplier';
    },

    getEditVenuePermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editVenue';
    },

    getEditProductPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editProduct';
    },

    getHideProductPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'hideProduct';
    },

    getBookProductPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'bookProduct';
    },

    getEditProductStagePermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editProductStage';
    },

    getCancelProductPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'cancelProduct';
    },

    getAcceptCancellationPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'acceptCancellation';
    },

    getEditParticipationPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editParticipation';
    },

    getEditFlightDetailsPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editFlightDetails';
    },

    getEditProductNotePermissionName() {
      return 'productNote';
    },

    getSwapProductPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'swapProduct';
    },

    getEditProductPricePermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editPrice';
    },

    getEditProductCostPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      return 'editCost';
    },

    getViewProductMapPermissionName() {
      if (this.packageProductDescription.packageProduct.isProductRemovedFromDB()) {
        return null;
      }

      if (!this.packageProductDescription.packageProduct.product.hasSelectedVenue()) {
        return null;
      }

      return 'viewMap';
    },

    _getStartTabNameFromCategory(category, section) {
      if (!category || !category.locationPageTabs || !category.locationPageTabs.length) {
        return 'day';
      }

      const filteredTabs = this.csLodash.uniq(category.locationPageTabs
        .filter((item) => {
          return !item.section || !item.section.length ||
            item.section.filter((s) => s === section).length;
        })
        .map((item) => item.tabs)
        .flat());

      return filteredTabs && filteredTabs.length ? filteredTabs[0] : 'day';
    }
  }
}
</script>

<style lang="scss">
.product-card-tools {
  padding: 5%;
  font-family: $ff2 !important;
  text-transform: uppercase;
  & li {
    transition: all 0.5s ease-in-out;
    .button-row {
      padding:5px;
      @include scale(font-size, 14px, 18px, 1.5);
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-between;
      .icon {
        width: 16px;
      }
      &:hover {
        background-color: $CB-1;

        & .icon {
          color: $C1;
        }
      }
    }
  }
}
</style>
