<template>
    <CardsContainer
      title="Guides"
      display="slider"
      id="guides"
      v-if="guideListGridModel.length"
      :cardsCount="guideListGridModel.length"
    >
      <PostCard
        v-for="guide in guideListGridModel"
        class="card"
        :link="guide.link"
        :title="guide.title"
        :imageId="guide.imageId"
        :key="guide.id"
      >
      </PostCard>
    </CardsContainer>
</template>

<script setup lang="ts">
import { useCurrentSection } from "~/services/helpers/current-section.factory";
import { useContentService } from "~/services/helpers/content.service.factory";
import { useContentListGridModelPreparer } from "~/services/helpers/content-grid-model-preparer.service.factory";
import { useCurrentLocationStore } from "~/store/currentLocation";
import { useLocationService } from "~/services/helpers/location.service.factory";
import { usePageDataLoadedStore } from "~/store/pageDataLoaded";

interface SectionDestinationGuidesProps {
  guides: any[];
}

const currentSection = useCurrentSection();
const contentService = useContentService();
const currentLocation = useCurrentLocationStore();
const contentListGridModelPreparer = useContentListGridModelPreparer();
const locationService = useLocationService();
const pageDataLoadedStore = usePageDataLoadedStore();

const props = defineProps<SectionDestinationGuidesProps>();

let guideListGridModel = ref([]);

function prepareGuides(rawGuides) {
  // filterAndSortGuides() {
  let result = contentListGridModelPreparer.prepareContentListGridModel(rawGuides);

  let section = currentSection.get();

  if (section === "any" || !section) {
    section = "stag";
  }

  const location = currentLocation.data;

  result = result.map((item) => {
    if (location) {
      const prepareLocationName = locationService.prepareLocationNameForUrl(location.name);
      item["link"] = `/${section}/in-${prepareLocationName}/post-${item.id}`;
    } else {
      item["link"] = `/${section}/post-${item.id}`;
    }

    return item;
  });

  guideListGridModel.value = result;

  // TODO: may be latter
  // filtersForGuides = filtersForGuides.map((filter: ICurrentFilter) => {
  //   if (filter.key === 'string') {
  //     filter.value = this.searchString;
  //   }
  //
  //   return filter;
  // });

  // filteredAndSortedGuideListGridModel = filteringGridHelperForGuides
  //     .filterItems(guideListGridModel, filtersForGuides);
  // filteredAndSortedGuideListGridModel = sortingHelperInstanceForGuides
  //     .sortItems(filteredAndSortedGuideListGridModel, currentSortForGuides);
  //
  // searchVariantsForGuides = _getCurrentSearchVariantsForGuides();
}

prepareGuides(props.guides);

pageDataLoadedStore.set();
</script>

<style scoped></style>
