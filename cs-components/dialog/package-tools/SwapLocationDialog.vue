<script setup lang="ts">
import {useDestinationLocationService} from '~/service/helpers/destination-location.factory';
import {useSectionStore} from '~/store/section';
import {useDialogData, useDialogInstance} from '~/service/dialog/core/dialog.composables';

interface LocationItem {
  id: string;
  name: string;
}


export interface SwapLocationDialogData {
  locationId: string;
}


export interface SwapLocationDialogResult extends SwapLocationDialogData {}


interface SwapLocationDialogVM {
  selectedLocation: LocationItem;
  possibleLocations: LocationItem[];
  loading: boolean;
}


const dialogData = useDialogData<SwapLocationDialogData>();
const dialogInstance = useDialogInstance<SwapLocationDialogResult>();
const destinationLocationsService = useDestinationLocationService();
const sectionStore = useSectionStore();


const vm = reactive<SwapLocationDialogVM>({
  possibleLocations: [],
  selectedLocation: null,
  loading: true,
});


async function getPossibleLocationList(): Promise<LocationItem[]> {
  const locationList = await destinationLocationsService.getAll(sectionStore.section, 'name');

  return locationList.map(i => ({id: i._doc, name: i.name}));
}


function save() {
  dialogInstance.close({
    locationId: vm.selectedLocation.id,
  });
}


onMounted(async () => {
  const possibleLocations = await getPossibleLocationList() ?? [];

  vm.possibleLocations = possibleLocations;
  vm.selectedLocation = possibleLocations.find(i => i.id === dialogData.locationId);

  vm.loading = false;
});
</script>

<template>
  <tool-dialog title="Swap Location" class="swap-location">
    <form name="swap-location" @submit.prevent="save">
      <CSFormField>
        <LazyCSSelect v-model="vm.selectedLocation"
                  :option-list="vm.possibleLocations"
                  :loading="vm.loading"
                  :label-getter="v => v?.name"
                  placeholder="Location">
        </LazyCSSelect>
      </CSFormField>

      <ButtonMain type="submit">Save</ButtonMain>
    </form>
  </tool-dialog>
</template>

<style lang="scss">
.swap-location {
  .content {
    min-height: calc(150%);
    max-height: calc(200% - 64px);
  }
}

</style>
