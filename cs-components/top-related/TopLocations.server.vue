<template>
    <CardsContainer :title="props.title" class="top-locations" display="slider" :to="'/' + section + '/locations'" toTitle="Browse All Locations">
      <template v-for="location in locationsList" :key="location.id">
        <LocationCard :name="location.name" :country="location.country.name ? location.country.name : location.country"
                      :section="section"
                      :images="location.imageList">
        </LocationCard>
      </template>
    </CardsContainer>
</template>

<script lang="ts" setup>
import {useDataTemplateFabricService} from "~/service/helpers/data-templates/data-template-fabric.factory";
import { useDataTemplatesStore } from '~/store/dataTemplates';
import { useLocationService } from '~/service/helpers/location.service.factory';
import {usePageDataLoadedStore} from '~/store/pageDataLoaded';


interface TopLocationsProps {
  title: string;
  section?: string;
  limit?: number;
}

const props = defineProps<TopLocationsProps>();


const dataTemplateFabric = useDataTemplateFabricService();
const dataTemplatesStore = useDataTemplatesStore();
const locationService = useLocationService();
const pageDataLoadedStore = usePageDataLoadedStore();

let locationsList = ref([]);

let section = props.section;

if (!section || section === 'any') {
  section = 'stag';
}

const templateName = section + 'Home';

let currentSectionHomeTemplate;

await useAsyncData(async () => {
  const data = await dataTemplatesStore.fetch({templateName});
  currentSectionHomeTemplate = dataTemplateFabric.prepareBasic(data, {});
});

if (!currentSectionHomeTemplate) {
  currentSectionHomeTemplate = dataTemplateFabric.get({
    name: templateName,
    notUpdateDefaultHeaderTemplate: false
  });
}

let result = currentSectionHomeTemplate.getArray('homeDestinationsModule.locationList');

if (props.limit && props.limit > 0) {
  result = result.slice(0, props.limit);
}

locationsList.value = result;

setTimeout(() => {
  pageDataLoadedStore.set();
}, 300);


</script>

<style scoped>

</style>
