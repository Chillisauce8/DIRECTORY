<template>
  <CardsContainer
    :title="locationName + ' ' + sectionName + ' Ideas'"
    :subTitle="'View all ' + locationName + ' ' + sectionName + ' Ideas'"
    class="location-section-list"
    display="slider"
    :to="'/' + section + '/locations'"
    :toTitle="'Browse All Location Ideas'"
  >

      <LocationSectionCard v-for="subSection in sectionCards.stag"
        :title="subSection.title"
        :cloudinaryId="subSection.cloudinaryId"
        :link="subSection.link"
        :section="section"
        :locationName="locationName"
        :sectionName="sectionName"
        :key="subSection.cloudinaryId"
      >
      </LocationSectionCard>

  </CardsContainer>
</template>

<script setup lang="ts">
  import {useCurrentSection} from '~/services/helpers/current-section.factory';
  import { useLocationService } from '~/services/helpers/location.service.factory';


  interface LocationSectionListProps {
    locationName: string;
    section: string;
    sectionName: string;
  }


  const currentSection = useCurrentSection();
  const locationService = useLocationService();

  const props = defineProps<LocationSectionListProps>();

  let section = props.section;

  if (!section || section === 'any') {
    section = 'stag';
  }

  const preparedLocationName = locationService.prepareLocationNameForUrl(props.locationName);

  const sectionCards = {
      stag: [{
          title: "Accomodation",
          cloudinaryId: "65537609f768b70f95b1d5d2",
          link: `/${section}/in-${preparedLocationName}` + "#hotels",
        },
        {
          title: "Driving",
          cloudinaryId: "655374ade8a5580f9bad9485",
          link: `/${section}/in-${preparedLocationName}` + "#driving",
        },
        {
          title: "Shooting",
          cloudinaryId: "655375e8e8a5580f9bad956f",
          link: `/${section}/in-${preparedLocationName}` + "#shooting",
        },
        {
          title: "Sports",
          cloudinaryId: "6553762af768b70f95b1d5dc",
          link: `/${section}/in-${preparedLocationName}` + "#sports",
        },
        {
          title: "Unusual",
          cloudinaryId: "6553773578769a0f995f5e67",
          link: `/${section}/in-${preparedLocationName}` + "#unusual",
        },
        {
          title: "Nightlife",
          cloudinaryId: "6553764a78769a0f995f5dec",
          link: `/${section}/in-${preparedLocationName}` + "#nightlife",
        },
        {
          title: "Spicy",
          cloudinaryId: "65537670f768b70f95b1d60c",
          link: `/${section}/in-${preparedLocationName}` + "#spicy",
        },
        {
          title: "Reviews",
          cloudinaryId: "655376b1f768b70f95b1d64c",
          link: `/${section}/in-${preparedLocationName}` + "#reviews",
        },
        {
          title: "Guides",
          cloudinaryId: "655376e9f768b70f95b1d672",
          link: `/${section}/in-${preparedLocationName}` + "#guides",
        },
      ],
    };

</script>

<style lang="scss">
</style>
