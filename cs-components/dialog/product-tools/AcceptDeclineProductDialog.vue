<script setup lang="ts">
import type {IVenue} from '~/services/models/venue.interface';
import {VENUE_TO_BE_CONFIRMED_ID} from '~/services/models/venue.interface';
import type {IConfirmation} from '~/services/models/packageProduct';
import {PackageProduct, ProductNoteShowToEnum} from '~/services/models/packageProduct';
import {useEventPackageBuilder} from '~/services/helpers/package-builder/package-builder.service.factory';
import {useDateHelper} from '~/services/helpers/date-helper.factory';
import {useCurrentSupplier} from '~/services/helpers/supplier-common/current-supplier.factory';
import {useCurrentUser} from '~/services/helpers/user-common/current-user.factory';
import {useDataTemplateFabricService} from '~/services/helpers/data-templates/data-template-fabric.factory';
import {useVenueService} from '~/services/helpers/product/venue.service.factory';
import {usePackageTimesHelperService} from '~/services/helpers/package-builder/package-times-helper.service.factory';
import {useCurrentEvent} from '~/services/helpers/event/current-event.service.factory';
import {DataTemplate} from '~/services/models/dataTemplate';
import {useCsLodash} from '~/services/cs-lodash.factory';
import {
  usePackageConfirmationHelperService
} from '~/services/helpers/package-builder/package-confirmation-helper.service.factory';
import type {ValidationRule} from '@vuelidate/core';
import {useVuelidate} from '@vuelidate/core';
import {required} from '@vuelidate/validators';
import {useAcceptProductDialogShowService} from '~/services/dialog/product-tools/accept-product-dialog-show.service';
import {useDeclineProductDialogShowService} from '~/services/dialog/product-tools/decline-product-dialog-show.service';
import {eventEmitterTap} from '~/services/models/event-emitter-observable-helpers';
import {getValidationErrorMessage} from '~/utils/cs-form-validation-helpers';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface AcceptDeclineProductDialogData {
  packageProduct: PackageProduct;
  readonly?: boolean;
}


interface AcceptDeclineProductDialogResultBase {
  accepted: boolean;
}


interface AcceptDialogResult extends AcceptDeclineProductDialogResultBase {
  accepted: true;
  venueId: string;
  meetingPointId: string;
  startTime: Date;
  acceptProductNote?: string;
}

interface DeclineDialogResult extends AcceptDeclineProductDialogResultBase {
  accepted: false;
  declineReason: string;
}


export type AcceptDeclineProductDialogResult<Accepted extends boolean = any> =
  Accepted extends boolean ? (Accepted extends true ? AcceptDialogResult : DeclineDialogResult) :
    AcceptDeclineProductDialogResultBase;


interface AcceptDeclineProductVM {
  needDeclineButton: boolean;
  possibleTimeList: Date[];
  possibleTopVenueList: IVenue[];
  selectedVenue: IVenue;
  selectedVenueName: string;
  selectedMeetingPoint: IVenue;
  selectedMeetingPointName: string;
  supplierName: string;
  productName: string;
  selectedTime: Date;
  selectedTimeView: Date;
  options: string;
  optionsCount: number;
  addons: string;
  addonsCount: number;
  people: number;
  units: number;
  date: string;
  supplierNotes: string;
  supplierNoteCount: number;
  previousConfirmation: IConfirmation;
  readonly: boolean;
}


type AcceptDeclineProductFieldsWithValidation = 'selectedVenue' | 'selectedTime';



interface AcceptDeclineProductValidationRules {
  [fieldName: AcceptDeclineProductFieldsWithValidation]: ValidationRule[];
}


const dialogData = useDialogData<AcceptDeclineProductDialogData>();
const dialogInstance = useDialogInstance<AcceptDeclineProductDialogResult>();
const packageBuilder = useEventPackageBuilder();
const dateHelper = useDateHelper();
const acceptProductDialog = useAcceptProductDialogShowService();
const declineProductDialogShowService = useDeclineProductDialogShowService();
const venueService = useVenueService();
const currentSupplier = useCurrentSupplier();
const currentUser = useCurrentUser();
const packageTimesHelper = usePackageTimesHelperService();
const dataTemplateFabric = useDataTemplateFabricService();
const currentEvent = useCurrentEvent();
const packageConfirmationHelper = usePackageConfirmationHelperService();
const csLodash = useCsLodash();

const vm = reactive<AcceptDeclineProductVM>({
  selectedVenue: null,
  selectedTime: null,
});

const formValidationRules = computed(() => {
  const isVenueRequired = vm.possibleTopVenueList?.length && isVenueConfirmationRequired();
  const isTimeRequired = vm.possibleTimeList?.length;

  return {
    selectedVenue: isVenueRequired ? [required] : [],
    selectedTime: isTimeRequired ? [required] : [],
  };
});

const v$ = useVuelidate(formValidationRules, vm, {$autoDirty: true});

let packageProduct: PackageProduct;
let packageProductCopy: PackageProduct;
let eventTemplate: DataTemplate;
let venueToBeConfirmedOption: IVenue;


function loadTemplate(): DataTemplate {
  return dataTemplateFabric.get({name: 'event', notUpdateDefaultHeaderTemplate: true});
}

function extendVenueOptions() {
  if (!hasVenueRequiredDate()) {
    return;
  }

  if (vm.possibleTopVenueList.length) {
    vm.possibleTopVenueList.unshift(venueToBeConfirmedOption);
  }
}

function resetSelectedVenueToBeConfirmedIfNotAnOption() {
  if (vm.selectedVenue === venueToBeConfirmedOption &&
      !vm.possibleTopVenueList.find(item => item === venueToBeConfirmedOption)) {
    vm.selectedVenue = null;
    packageProduct.venueId = null;
    initPreSelectedVenue();
  }
}

function selectedVenueToBeConfirmedIfNotConfirmed() {
  if (vm.possibleTopVenueList.find(item => item === venueToBeConfirmedOption) && !packageProduct.isVenueConfirmed()) {
    vm.selectedVenue = venueToBeConfirmedOption;
    packageProduct.venueId = VENUE_TO_BE_CONFIRMED_ID;
    initPreSelectedVenue();
  }
}

function createVenueToBeConfirmed(): IVenue {
  return {
    getName: () => 'Venue To Be Confirmed',
    getId: () => VENUE_TO_BE_CONFIRMED_ID
  } as IVenue;
}

function needDeclineButton(): boolean {
  return packageConfirmationHelper.possibleToDecline(packageProduct);
}

function onTimeChanged() {
  packageProduct.setPreferredStartTime(vm.selectedTime, packageProduct.preferredStartTimeRange);
}

function getPrice(): any {
  return packageProduct.getSupplierPrice({isNightActivity: packageProduct.isNightActivity}, true);
}

function isPriceCalculated(): boolean {
  return isFinite(getPrice());
}

function getCurrencySymbol(): string {
  return packageProduct.product.getCurrencySymbol();
}

function isPeopleValueChanged(): boolean {
  return packageConfirmationHelper.isPeopleValueChanged(packageProduct, vm.people);
}

function getPeoplePreviousViewValue(): number {
  return packageConfirmationHelper.getPeoplePreviousViewValue(packageProduct);
}

function isUnitsValueChanged(): boolean {
  return packageConfirmationHelper.isUnitsValueChanged(packageProduct, vm.units);
}

function getUnitsPreviousViewValue(): number {
  return packageConfirmationHelper.getUnitsPreviousViewValue(packageProduct);
}

function isDateValueChanged(): boolean {
  return packageConfirmationHelper.isDateValueChanged(packageProduct, packageProduct.date);
}

function getDatePreviousViewValue(): string {
  return packageConfirmationHelper.getDatePreviousViewValue(packageProduct);
}

function isTimeValueChanged(): boolean {
  return packageConfirmationHelper.isTimeValueChanged(packageProduct, vm.selectedTime);
}

function getTimePreviousViewValue(): string {
  return packageConfirmationHelper.getTimePreviousViewValue(packageProduct);
}

function isCostCurrencyChanged(): boolean {
  return packageConfirmationHelper.isCostCurrencyChanged(packageProduct);
}

function getCostCurrencyPreviousViewValue(): number {
  return packageConfirmationHelper.getCostCurrencyPreviousViewValue(packageProduct);
}

function onSelectedVenueChange(): void {
  if (!vm.selectedVenue) {
    return;
  }

  let venues = packageProduct.product.getVenues()
    .filter(item => {
      return !!(item.getMeetingPoint() && item.getTopVenue().getId() === vm.selectedVenue.getId());
    });

  if (venues && venues.length) {
    vm.selectedMeetingPoint = venues[0].getMeetingPoint();
    initSelectedMeetingPoint();
  }
}

function isTopVenueValueChanged(): boolean {
  return packageConfirmationHelper.isTopVenueValueChanged(packageProduct);
}

function needShowPrevVenueValue(): boolean {
  if (isTopVenueValueChanged()) {
    return true;
  }

  if (!vm.previousConfirmation) {
    return false;
  }

  let hasVenueToBeConfirmedOption = !!vm.possibleTopVenueList.find(item => item === venueToBeConfirmedOption);

  if (!hasVenueToBeConfirmedOption && vm.previousConfirmation.venueId === VENUE_TO_BE_CONFIRMED_ID) {
    return true;
  }

  return false;
}

function getTopVenuePreviousViewValue(): string {
  return packageConfirmationHelper.getTopVenuePreviousViewValue(packageProduct);
}

function isMeetingPointValueChanged(): boolean {
  return packageConfirmationHelper.isMeetingPointValueChanged(packageProduct);
}

function getMeetingPointPreviousViewValue(): string {
  return packageConfirmationHelper.getMeetingPointPreviousViewValue(packageProduct);
}

function isOptionsValueChanged(): boolean {
  return packageConfirmationHelper.isOptionsValueChanged(packageProduct);
}

function getOptionsPreviousViewValue(): string {
  return packageConfirmationHelper.getOptionsPreviousViewValue(packageProduct);
}

function isAddonsValueChanged(): boolean {
  return packageConfirmationHelper.isAddonsValueChanged(packageProduct);
}

function getAddonsPreviousViewValue(): string {
  return packageConfirmationHelper.getAddonsPreviousViewValue(packageProduct);
}

function needUnitsConfirmation(): boolean {
  return !packageProduct.product.isUnitTypePerson() && !!vm.units;
}

async function startConfirmAccept(): Promise<void> {
  v$.value.$touch();

  if (v$.value.$invalid) {
    return;
  }

  const result = await acceptProductDialog.show({});

  if (!result) {
    return;
  }

  if (result.cancelled) {
    return;
  }

  confirmAccept(result.data);
}

function confirmAccept(note?: string): void {
  const result: AcceptDeclineProductDialogResult<true> = {
    accepted: true,
    venueId: vm.selectedVenue ? vm.selectedVenue.getId() : undefined,
    meetingPointId: vm.selectedMeetingPoint ? vm.selectedMeetingPoint.getId() : undefined,
    startTime: vm.selectedTime,
  };

  if (note) {
    result.acceptProductNote = note;
  }

  dialogInstance.close(result);
}

function confirmDecline(reason: string): void {
  let result: AcceptDeclineProductDialogResult<false> = {
    accepted: false,
    declineReason: reason
  };

  dialogInstance.close(result);
}

async function startConfirmDecline(): Promise<void> {
  const result = await declineProductDialogShowService.show({})

  if (!result) {
    return;
  }

  if (result.cancelled) {
    return;
  }

  confirmDecline(result.data);
}

function isCustomerVenueChoice(): boolean {
  return packageProduct.product.isCustomerVenueChoice();
}

function isVenueConfirmationRequired(): boolean {
  if (!packageProduct.product) {
    return false;
  }

  return packageProduct.product.isVenueConfirmationRequired();
}

function showVenues(): boolean {
  if (!isVenueConfirmationRequired()) {
    return false;
  }

  if (vm.possibleTopVenueList && vm.possibleTopVenueList.length) {
    return true;
  }

  if (vm.selectedVenue && vm.selectedVenueName) {
    return true;
  }

  return false;
}

function getCustomerVenueChoice(): string {
  return packageProduct.product.getCustomerVenueChoice();
}

function getVenueConfirmationRequired(): string {
  return packageProduct.product.getVenueConfirmationRequired();
}

function getMultiVenueSetting(): string {
  return packageProduct.product.getMultiVenueSetting();
}

function hasVenueRequiredDate(): boolean {
  if (getCustomerVenueChoice() === 'Yes') {
    return false;
  }

  if (getVenueConfirmationRequired() === 'No') {
    return false;
  }

  const venuesLength = packageProduct.product.getVenues().length;
  const venueToBeConfirmedSetting = eventTemplate.getRaw('event.venueToBeConfirmed');

  if (venuesLength === 0) {
    return false;
  }

  if (venuesLength === 1 && venueToBeConfirmedSetting !== 'Yes') {
    return false;
  }

  if (venuesLength === 1 && venueToBeConfirmedSetting === 'Yes' && getCustomerVenueChoice() !== 'No') {
    return false;
  }

  return true;
}

function calculateVenueRequiredDate(): Date {
  let balanceDueDate = currentEvent.getBalanceDueDate();
  let item = eventTemplate.getRaw('event.venueRequired');

  if (item) {
    return dateHelper.getDateInNDays(balanceDueDate, item.afterBalanceDueDate);
  } else {
    return balanceDueDate;
  }
}

function restoreProduct() {
  dialogData.packageProduct = {...dialogData.packageProduct, ...packageProductCopy};
  // csLodash.merge(dialogData.packageProduct, packageProductCopy);
}

function initTimeValues() {
  if (packageProduct.product.isAccommodation() || packageProduct.product.isTransfer()) {
    return;
  }

  vm.possibleTimeList = packageBuilder.getPossiblePreferredStartTimeList(
      packageProduct, packageProduct.dayIndex);

  let startTime = packageProduct.getStartTime();

  vm.selectedTime = vm.possibleTimeList.find((item: any) => {
    return csLodash.isEqual(dateHelper.viewTimeFormat(item),
        dateHelper.viewTimeFormat(startTime));
  });

  if (!vm.selectedTime && !!startTime) {
    vm.selectedTime = startTime;
    vm.possibleTimeList.push(startTime);
  }

  let selectedTimeOffset = packageProduct.preferredStartTimeRange;
  let minSelectedTime = dateHelper.subtractHoursFromDate(vm.selectedTime, selectedTimeOffset);
  let maxSelectedTime = dateHelper.addHoursToDate(vm.selectedTime, selectedTimeOffset);

  vm.possibleTimeList = vm.possibleTimeList.filter((item: Date) => {
    if (!item) {
      return false;
    }

    let low = dateHelper.getOffsetInHours(item, minSelectedTime);
    let high = dateHelper.getOffsetInHours(item, maxSelectedTime);

    return low >= 0 && high <= 0;
  });


  if (vm.possibleTimeList && vm.possibleTimeList.length === 1) {
    vm.selectedTimeView = packageTimesHelper.getViewStartOfEntryTime(packageProduct, packageProduct.dayIndex,
        packageProduct.getStartTime());
  }


  nextTick(() => v$.value.$validate());
}

function getPossibleTopVenueList(): IVenue[] {
  if (isCustomerVenueChoice()) {
    return [];
  } else {
    return packageProduct.product.getTopVenues();
  }
}

async function initPreSelectedVenue(): Promise<void> {
  let preSelectedVenueIdInPackageProduct = packageProduct.venueId;

  if (preSelectedVenueIdInPackageProduct) {
    vm.selectedVenue = findPossibleTopVenueById(preSelectedVenueIdInPackageProduct);

    if (!vm.selectedVenue) {
      if (preSelectedVenueIdInPackageProduct === VENUE_TO_BE_CONFIRMED_ID) {
        vm.selectedVenue = venueToBeConfirmedOption;
      }
    }

    if (!vm.selectedVenue) {
      const venue = await venueService.getVenueByIdForSupplier(preSelectedVenueIdInPackageProduct, getSupplierId())

      vm.selectedVenue = venue;

      if (vm.possibleTopVenueList && vm.possibleTopVenueList.length) {
        vm.possibleTopVenueList.push(venue);
      }

      initSelectedVenue();
    }
  } else if (packageProduct.product.hasSelectedVenue() && packageProduct.product.getSelectedVenue().getTopVenue()) {
    vm.selectedVenue = packageProduct.product.getSelectedVenue().getTopVenue();
  } else if (vm.possibleTopVenueList && vm.possibleTopVenueList.length === 1) {
    vm.selectedVenue = vm.possibleTopVenueList[0];
  }

  initSelectedVenue();
}

function findPossibleTopVenueById(venueId: string): IVenue {
  return (vm.possibleTopVenueList ?? [])
    .filter(v => !!v)
    .find((venue: IVenue) => venue.getId() === venueId);
}

function initSelectedVenue(): void {
  vm.selectedVenueName = vm.selectedVenue ? vm.selectedVenue.getName() : '';

  nextTick(() => v$.value.$validate());
}

async function initPreSelectedMeetingPoint(): Promise<void> {
  if (!packageProduct.product.hasMeetingPoint()) {
    return;
  }

  let preSelectedMeetingPointIdInPackageProduct = packageProduct.meetingPointId;

  if (preSelectedMeetingPointIdInPackageProduct) {
    const meetingPoint = await venueService
      .getVenueByIdForSupplier(preSelectedMeetingPointIdInPackageProduct, getSupplierId())

    vm.selectedMeetingPoint = meetingPoint;
    initSelectedMeetingPoint();
  } else if (packageProduct.product.hasSelectedVenue()) {
    vm.selectedMeetingPoint = packageProduct.product.getSelectedVenue().getMeetingPoint();
  }

  initSelectedMeetingPoint();
}

function initSelectedMeetingPoint(): void {
  vm.selectedMeetingPointName = vm.selectedMeetingPoint ? vm.selectedMeetingPoint.getName() : '';
}

function getSupplierId(): string {
  if (currentUser.isSupplierContact()) {
    return currentSupplier.getId();
  } else if (currentUser.isStaffOrHiddenStaff()) {
    let supplier = packageProduct.getSupplier();
    return supplier && supplier.id ? supplier.id : '';
  }

  return '';
}

function getPossibleTimeOptionLabel(item: Date): string {
  const labelDate = vm.possibleTimeList.length === 1 && vm.selectedTimeView ? vm.selectedTimeView : item;

  return dateHelper.viewTimeFormat(labelDate);
}


const dialogResultPublishSubscription = dialogInstance.onResultPublish()
  .pipe(
    eventEmitterTap(() => restoreProduct()),
  )
  .subscribe();

onUnmounted(() => dialogResultPublishSubscription.unsubscribe());

onMounted(() => {
  vm.readonly = dialogData.readonly ?? false;

  packageProduct = dialogData.packageProduct;
  packageProductCopy = csLodash.clone(dialogData.packageProduct);

  initTimeValues();

  venueToBeConfirmedOption = createVenueToBeConfirmed();

  vm.possibleTopVenueList = getPossibleTopVenueList();
  initPreSelectedVenue();
  initPreSelectedMeetingPoint();

  vm.supplierName = packageProduct.product.getSupplier().name;
  vm.productName = packageProduct.product.getNameForSupplier();

  const selectedOptions = packageProduct.product.getSelectedOptions();
  vm.options = selectedOptions
      .map(item => item.product.getNameForSupplier())
      .join('\n');
  vm.optionsCount = selectedOptions.length;

  const selectedAddons = packageProduct.product.getSelectedAddons();
  vm.addons = selectedAddons
      .map(item => item.product.getNameForSupplier())
      .join('\n');
  vm.addonsCount = selectedAddons.length;

  vm.people = packageProduct.needPeople;

  vm.units = packageProduct.needUnits;

  vm.date = dateHelper.viewDateFormat(packageProduct.date);

  if (packageProduct.confirmation && packageProduct.confirmation.length) {
    vm.previousConfirmation = packageProduct.confirmation.slice(-1)[0];
  }

  if (packageProduct.productNote?.length) {
    const notes = (packageProduct.productNote || [])
        .filter(item => !!item.showTo && item.showTo.includes(ProductNoteShowToEnum.supplier))
        .map(item => item.note)
        .filter(item => !!item);

    vm.supplierNoteCount = notes.length;
    vm.supplierNotes = notes.join('\n');
  }

  vm.needDeclineButton = needDeclineButton();


  eventTemplate = loadTemplate();
  extendVenueOptions();
  resetSelectedVenueToBeConfirmedIfNotAnOption();
  selectedVenueToBeConfirmedIfNotConfirmed();

  const instance = getCurrentInstance();
  (instance?.proxy as any)?.$forceUpdate();
});

</script>

<template>
  <tool-dialog v-if="packageProduct"
               class="accept-decline-product-dialog"
               title="Accept / Decline Booking" formName="confirmationForm">
    <form name="confirmationForm">
      <template v-if="!!vm.productName">
        <CSFormField>
          <CSInput type="text"
                   readonly
                   placeholder="Product"
                   v-model="vm.productName"
                   :disabled="vm.readonly"
                   name="productName">
          </CSInput>
        </CSFormField>
      </template>

      <template v-if="!!vm.supplierName">
        <CSFormField>
          <CSInput  type="text"
                    readonly
                    placeholder="Supplier"
                    v-model="vm.supplierName"
                    :disabled="vm.readonly"
                    name="supplierName">
          </CSInput>
        </CSFormField>
      </template>

      <template v-if="showVenues()">
        <template v-if="vm?.possibleTopVenueList.length">
          <template v-if="vm.possibleTopVenueList.length > 1">
            <CSFormField>
              <LazyCSSelect :disabled="vm.readonly"
                        v-model="vm.selectedVenue"
                        :option-list="vm.possibleTopVenueList"
                        :label-getter="v => v.getName()"
                        @update:modelValue="onSelectedVenueChange()"
                        placeholder="Venue">
              </LazyCSSelect>
            </CSFormField>
          </template>

          <template v-if="vm.possibleTopVenueList.length === 1">
            <CSFormField>
              <CSInput type="text"
                       :disabled="vm.readonly"
                       readonly
                       placeholder="Venue"
                       v-model="vm.selectedVenueName">
              </CSInput>

              <template #suffix>
                <CSError class="cs-form-text-error" :vuelidateField="v$.selectedVenue"></CSError>
              </template>
            </CSFormField>
          </template>
        </template>

        <template v-if="(!vm.possibleTopVenueList.length) && vm.selectedVenueName">
          <CSFormField>
            <CSInput :disabled="vm.readonly"
                     type="text" readonly
                     placeholder="Venue"
                     v-model="vm.selectedVenueName">
            </CSInput>

            <template #suffix>
              <p class="cs-form-text-error" v-if="needShowPrevVenueValue()">(Previously {{ getTopVenuePreviousViewValue() }})</p>
            </template>
          </CSFormField>
        </template>
      </template>

      <template v-if="vm.selectedMeetingPoint && vm.selectedMeetingPointName">
        <CSFormField>
          <CSInput :disabled="vm.readonly"
                   type="text"
                   readonly
                   placeholder="Meeting Point"
                   v-model="vm.selectedMeetingPointName">
          </CSInput>

          <template #suffix>
            <p class="cs-form-text-error" v-if="isMeetingPointValueChanged()">(Previously {{ getMeetingPointPreviousViewValue() }})</p>
          </template>
        </CSFormField>
      </template>

      <template v-if="!!vm.options">
        <CSFormField>
          <CSTextarea :disabled="vm.readonly"
                      v-model="vm.options"
                      name="options"
                      :rows="vm.optionsCount"
                      placeholder="Options">
          </CSTextarea>

          <template #suffix>
            <p class="cs-form-text-error" v-if="isOptionsValueChanged()">(Previously {{ getOptionsPreviousViewValue() }})</p>
          </template>
        </CSFormField>
      </template>

      <template v-if="!!vm.addons">
        <CSFormField>
          <CSTextarea :disabled="vm.readonly"
                      v-model="vm.addons"
                      name="addons"
                      :rows="vm.addonsCount"
                      placeholder="Add Ons">
          </CSTextarea>

          <template #suffix>
            <p class="cs-form-text-error" v-if="isAddonsValueChanged()">(Previously {{ getAddonsPreviousViewValue() }})</p>
          </template>
        </CSFormField>
      </template>

      <template v-if="!!vm.date">
        <CSFormField>
          <CSInput :disabled="vm.readonly"
                   type="text"
                   readonly
                   placeholder="Date"
                   v-model="vm.date"
                   name="date">
          </CSInput>

          <template #suffix>
            <p class="cs-form-text-error" v-if="isDateValueChanged()">(Previously {{ getDatePreviousViewValue() }})</p>
          </template>
        </CSFormField>
      </template>

      <template v-if="vm?.possibleTimeList?.length > 0">
        <CSFormField>
          <LazyCSSelect :disabled="vm.readonly"
                    placeholder="Time"
                    v-model="vm.selectedTime"
                    :option-list="vm.possibleTimeList"
                    :label-getter="v => getPossibleTimeOptionLabel(v)"
                    @update:modelValue="onTimeChanged()">
          </LazyCSSelect>

          <template #suffix>
            <CSError class="cs-form-text-error" :vuelidateField="v$.selectedTime"></CSError>

            <p class="cs-form-text-error" v-if="isTimeValueChanged()">(Previously {{ getTimePreviousViewValue() }})</p>
          </template>
        </CSFormField>
      </template>

      <template v-if="!!vm.people">
        <CSFormField>
          <CSInput :disabled="vm.readonly"
                   type="text"
                   readonly
                   placeholder="People"
                   v-model="vm.people"
                   name="people">
          </CSInput>

          <template #suffix>
            <p class="cs-form-text-error" v-if="isPeopleValueChanged()">(Previously {{ getPeoplePreviousViewValue() }})</p>
          </template>
        </CSFormField>
      </template>

      <template v-if="needUnitsConfirmation()">
        <CSFormField>
          <CSInput :disabled="vm.readonly"
                   type="text"
                   placeholder="Units"
                   v-model="vm.units"
                   name="units">
          </CSInput>

          <template #suffix>
            <p class="cs-form-text-error" v-if="isUnitsValueChanged()">(Previously {{ getUnitsPreviousViewValue() }})</p>
          </template>
        </CSFormField>
      </template>

      <template v-if="isPriceCalculated()">
        <CSFormField>
          <CSInput :disabled="vm.readonly"
                   type="text"
                   readonly
                   :placeholder="'Price ' + getCurrencySymbol()"
                   :modelValue="getPrice()">
          </CSInput>

          <template #suffix>
            <p class="cs-form-text-error" v-if="isCostCurrencyChanged()">(Previously {{ getCostCurrencyPreviousViewValue() }})</p>
          </template>
        </CSFormField>
      </template>

      <template v-if="vm.supplierNotes">
        <CSFormField>
          <CSTextarea :disabled="true"
                      v-model="vm.supplierNotes"
                      name="supplierNotes"
                      readonly
                      :rows="vm.supplierNoteCount"
                      placeholder="Supplier Notes">
          </CSTextarea>
        </CSFormField>
      </template>

    <div v-if="!vm.readonly" class="field Row Center Grow gap-horizontal15">
      <FormButtonWrapper>
        <ButtonMain class="_2nd" type="button" @click.native="startConfirmDecline()" v-if=vm.needDeclineButton>
          Decline
        </ButtonMain>



        <ButtonMain type="button" @click.native="startConfirmAccept()">
          Accept
        </ButtonMain>
      </FormButtonWrapper>
      </div>
    </form>
  </tool-dialog>
</template>

<style lang="scss">
.accept-decline-product-dialog {
  width: 650px !important;
}

.gap-horizontal15 {
  gap: 15px;
}
</style>