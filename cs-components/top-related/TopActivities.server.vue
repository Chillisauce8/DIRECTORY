<template>
  <CardsContainer :title="props.title" display="slider" :to="'/' + section + '/activities'" toTitle="Browse All Activities">
    <template v-for="item in categoryList" :key="item.id">
      <CategoryCard :name="item.title" :images="item.imageList" :section="section" :url="item.url">
      </CategoryCard>
    </template>
  </CardsContainer>
</template>

<script lang="ts" setup>
import {useDataTemplateFabricService} from "~/service/helpers/data-templates/data-template-fabric.factory";
import { useDataTemplatesStore } from '~/store/dataTemplates';
import {usePageDataLoadedStore} from '~/store/pageDataLoaded';


interface TopActivitiesProps {
  title: string;
  section: string;
  limit?: number;
}

const props = defineProps<TopActivitiesProps>();


const dataTemplateFabric = useDataTemplateFabricService();
const dataTemplatesStore = useDataTemplatesStore();
const pageDataLoadedStore = usePageDataLoadedStore();


let categoryList = ref([]);

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

let result = currentSectionHomeTemplate.getArray('homeCategoryModule.categoryList');

if (props.limit && props.limit > 0) {
  result = result.slice(0, props.limit);
}

categoryList.value = result;

onMounted(() => {
  setTimeout(() => {
    pageDataLoadedStore.set();
  }, 300);
});

</script>

<style scoped>

</style>
