<template>
  <tool-dialog title="Edit venue" form-name="">
    <form name="edit-product-venue-form" @submit.prevent="submit">
      <template v-if="!vm.listAllVenues">
        <template v-if="hasProductMeetingPoint()">
          <CSFormField>
            <LazyCSSelect v-model="vm.selectedMeetingPoint"
                      :option-list="vm.possibleMeetingPointList"
                      :model-match-option="(m, o) => m.getId() === o.getId()"
                      :label-getter="v => v.getName()"
                      placeholder="Meeting point">
            </LazyCSSelect>
          </CSFormField>
        </template>

        <CSFormField>
          <LazyCSSelect v-model="vm.selectedVenue"
                    :option-list="vm.possibleTopVenueList"
                    :model-match-option="(m, o) => m.getId() === o.getId()"
                    :label-getter="v => v.getName()"
                    placeholder="Venue">
          </LazyCSSelect>
        </CSFormField>
      </template>

      <template v-if="vm.listAllVenues">
        <template v-if="hasProductMeetingPoint()">
          <CSFormField>
            <SelectVenue v-model="vm.selectedMeetingPoint" placeholder="Meeting Point">
            </SelectVenue>
          </CSFormField>
        </template>

        <CSFormField>
          <SelectVenue v-model="vm.selectedVenue" placeholder="Venue"></SelectVenue>
        </CSFormField>
      </template>

      <label @click="vm.listAllVenues = !vm.listAllVenues"><input type="checkbox" v-model="vm.listAllVenues" @click.stop=""/>List all Venues</label>

      <button-main type="submit" >OK</button-main>
    </form>
  </tool-dialog>
</template>

<script setup lang="ts">
import {PackageProduct} from '~/services/models/packageProduct';
import {useEventPermissionsService} from '~/services/helpers/event/event-permissions.service.factory';
import type {IVenue} from '~/services/models/venue.interface';
import {VENUE_TO_BE_CONFIRMED_ID} from '~/services/models/venue.interface';
import {useCsLodash} from '~/services/cs-lodash.factory';
import {useVenueService} from '~/services/helpers/product/venue.service.factory';
import CSSelect from '~/components/forms/CSSelect.vue';
import type {DbNode} from '~/services/helpers/db-node.typings';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface EditVenueDialogData {
  packageProduct: PackageProduct;
}


export interface EditVenueDialogResult {
  venueId?: string;
  venueRaw?: DbNode;
  meetingPointId?: string;
  meetingPointRaw?: DbNode;
}


const dialogData = useDialogData<EditVenueDialogData>();
const dialogInstance = useDialogInstance<EditVenueDialogResult>();

const eventPermissionsService = useEventPermissionsService();
const csLodash = useCsLodash();
const venueService = useVenueService();


const vm = reactive({
  listAllVenues: false,
  possibleTopVenueList: getPossibleTopVenueList(),
  possibleMeetingPointList: getPossibleMeetingPoints(),
  canEditVenueListAll: eventPermissionsService
    .hasPermission('packageProductFunctions.editVenueListAll', {}),
  selectedMeetingPoint: null,
  selectedVenue: null,
  venueInProgress: true,
  meetingPointInProgress: true,
});

function onchange() {
  vm.listAllVenues = !vm.listAllVenues;
}


function hasProductMeetingPoint(): boolean {
  return dialogData.packageProduct.product.hasMeetingPoint() && !!vm.possibleMeetingPointList.length;
}

function getPossibleTopVenueList(): IVenue[] {
  return dialogData.packageProduct.product.getTopVenues();
}

function getPossibleMeetingPoints(): IVenue[] {
  let result = dialogData.packageProduct.product.getVenues()
    .map(item => item.getMeetingPoint())
    .flat()
    .filter(item => !!item);

  if (result && result.length) {
    result = csLodash.uniqBy(result, meetingPoint => meetingPoint.getId());
  }

  return result;
}

function findPossibleTopVenueById(venueId: string) {
  return vm.possibleTopVenueList.find((venue: IVenue) => venue?.getId() === venueId);
}

function findPossibleMeetingPoint(venueId: string) {
  return vm.possibleMeetingPointList.find(venue => venue.getId() === venueId);
}

function initPreSelectedVenue() {
  let preSelectedVenueIdInPackageProduct = dialogData.packageProduct.venueId;

  if (preSelectedVenueIdInPackageProduct && preSelectedVenueIdInPackageProduct !== VENUE_TO_BE_CONFIRMED_ID) {
    vm.selectedVenue = findPossibleTopVenueById(preSelectedVenueIdInPackageProduct);

    if (!vm.selectedVenue)  {
      venueService.getVenueById(preSelectedVenueIdInPackageProduct)
        .then(venue => {
          vm.selectedVenue = venue;
          vm.possibleTopVenueList.push(venue);
        });
    }
  } else if (dialogData.packageProduct.product.hasSelectedVenue()) {
    vm.selectedVenue = dialogData.packageProduct.product.getSelectedVenue().getTopVenue();
  } else if (vm.possibleTopVenueList.length === 1) {
    vm.selectedVenue = vm.possibleTopVenueList[0];
  } else {
    vm.venueInProgress = true;
  }
}

function initPreSelectedMeetingPoint() {
  if (!dialogData.packageProduct.product.hasMeetingPoint()) {
    vm.meetingPointInProgress = false;
    return;
  }

  let preSelectedMeetingPointIdInPackageProduct = dialogData.packageProduct.meetingPointId;

  if (preSelectedMeetingPointIdInPackageProduct) {
    vm.selectedMeetingPoint = findPossibleMeetingPoint(preSelectedMeetingPointIdInPackageProduct);

    if (!vm.selectedMeetingPoint) {
      venueService.getVenueById(preSelectedMeetingPointIdInPackageProduct)
        .then((meetingPoint: IVenue) => {
          vm.selectedMeetingPoint = meetingPoint;
          vm.possibleMeetingPointList.push(meetingPoint);
        });
    }
  } else if (dialogData.packageProduct.product.hasSelectedVenue()) {
    vm.selectedMeetingPoint = dialogData.packageProduct.product.getSelectedVenue().getMeetingPoint();
  } else if (vm.possibleMeetingPointList.length === 1) {
    vm.selectedMeetingPoint = vm.possibleMeetingPointList[0];
  }
}

function submit() {
  let result: {venueId?: string, venueRaw?: any,
    meetingPointId?: string, meetingPointRaw?: any} = {};

  if (vm.selectedVenue) {
    result.venueId = vm.selectedVenue.getId();
    result.venueRaw = vm.selectedVenue.getRawData();
  }

  if (vm.selectedMeetingPoint) {
    result.meetingPointId = vm.selectedMeetingPoint.getId();
    result.meetingPointRaw = vm.selectedMeetingPoint.getRawData();
  }

  dialogInstance.close(result);
}


onMounted(() => {
  initPreSelectedVenue();
  initPreSelectedMeetingPoint();
})
</script>

<style lang="scss">

</style>