<template>
  <LazyCSAutocomplete v-model="vm.modelValue"
                  :placeholder="props?.placeholder ?? 'Select venue'"
                  :options-list-getter="fetchAndSortVenueOptionList"
                  :label-getter="v => v.getName()"
                  :model-match-option="(model, optionValue) => model.getId() === optionValue.getId()"
                  @update:modelValue="onVenueSelect">
  </LazyCSAutocomplete>

</template>

<script setup lang="ts">
import {Venue} from '~/services/models/venue';
import {useVenueService} from '~/services/helpers/product/venue.service.factory';


interface SelectVenueProps {
  modelValue: Venue;
  placeholder: string;
}


interface SelectVenueEmits {
  (e: 'update:modelValue', value: Venue): void;
}


interface SelectVenueVM {
  modelValue: Venue;
}

const props = defineProps<SelectVenueProps>();
const emits = defineEmits<SelectVenueEmits>();

const vm = reactive<SelectVenueVM>({
  modelValue: props?.modelValue,
});

const venueService = useVenueService();


function sortVenueList(v1: Venue, v2: Venue): number {
  let name1 = v1.getRawData().title.toLowerCase();
  let name2 = v2.getRawData().title.toLowerCase();

  if (name1 < name2) {
    return -1;
  }

  if (name1 > name2) {
    return 1;
  }

  return 0;
}


async function fetchAndSortVenueOptionList(searchString: string): Promise<Venue[]> {
  let requestConfig = {
    page: 0,
    count: 1000,
    searchString: searchString
  };

  return venueService.getList(requestConfig)
    .then(venueList => venueList.sort(sortVenueList));
}


function onVenueSelect(venue: Venue): void {
  vm.modelValue = venue;

  emits('update:modelValue', venue);
}

watch(() => props.modelValue, () => vm.modelValue = props.modelValue);


onMounted(() => vm.modelValue = props.modelValue);
</script>

<style lang="scss">

</style>
