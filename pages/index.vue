<template>
  <HeroHeader :props="heroHeaderProps" />

  <CardsContainer display="slider" :toggle="true" title="Vehicles">
    <template v-for="(vehicle, index) in vehicles" :key="index">
      <VehicleListingCard
        :images="vehicle.images"
        :saleType="vehicle.saleType"
        :name="vehicle.name"
        :year="vehicle.year"
        :price="vehicle.price"
      />
    </template>
  </CardsContainer>
  <CardsContainer
    display="slider"
    :toggle="false"
    title="Steps to a Brilliant Stag Do"
    subTitle="We make it simple to organise a legendary stag weekend"
  >
    <MarketingCard :props="vm.marketingCard1Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard2Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard3Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard4Props"></MarketingCard>
  </CardsContainer>
  <AbtaStripSmall />
  <MarketingBooster2 />

  <MarketingBooster1 />
  <UAccordion
    color="primary"
    variant="soft"
    size="sm"
    :items="[
      {
        label: '1. What is Nuxt UI?',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
      {
        label: '2. Getting Started',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
      {
        label: '3. Theming',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
      {
        label: '4. Components',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
    ]"
  />
  <!--
  <CardsContainer display="slider" :toggle="false"
                  title="Why Chillisauce - is the UK's Largest Stag Do Organiser"
                  subTitle="Chillisauce is the largest organiser of stag weekends in the UK - not by a bit - by a country mile!"
  >
    <MarketingCard :props="vm.marketingCard8Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard9Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard10Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard11Props"></MarketingCard>
  </CardsContainer>
-->
  <!-- <MarketingTimeline :eventType="vm.eventType"></MarketingTimeline> -->
</template>

<script setup lang="ts">
const heroHeaderProps = {
  title: "Classic Car Heaven",
  subTitle: "Tools to increase your enjoyment of classic car ownership",
  type: "barText",
  random: true,
  min: 1,
  max: 1,
  grayscale: true,
  width: 1200,
  tintClass: "tint",
  images: [
    {
      cloudinaryId: "661fecb3d7eafa12344017a8",
    },
  ],
};
const vehicles = [
  {
    images: [
      {
        cloudinaryId: "65466c15afa7da0f964a0012",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Advert",
    name: "1973 Alfa Romeo 2000 Spider Veloce",
    year: "1973",
    price: "£33,000",
  },
  {
    images: [
      {
        cloudinaryId: "65466bfcafa7da0f964a000e",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Auction",
    name: "1930 Ford Model A 'The Ballard Special' Speedster",
    year: "1930",
    price: "Estimate £140,000",
  },
  {
    images: [
      {
        cloudinaryId: "65466c4dafa7da0f964a011c",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Auction",
    name: "1974 Alpine Renault A110",
    year: "1956",
    price: "Estimate £12,000 - £15,000",
  },
  {
    images: [
      {
        cloudinaryId: "65466babc302c20f89908e11",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Advert",
    name: "2007 Porsche 911 (997) GT3 RS",
    year: "2007",
    price: "£98,000",
  },
  {
    images: [
      {
        cloudinaryId: "661fecb3d7eafa12344017a8",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Advert",
    name: "1961 Austin-Healey 3000 MK II",
    year: "1961",
    price: "£56,000",
  },
];

const vm = {
  section: "stag",
  eventType: "stag do",
  marketingCard1Props: {
    title: "Browse, Read Reviews, Pick and Mix",
    copy: "Choose from thousands of activities across 69 locations to build your enquiry",
    images: [
      {
        cloudinaryId: "650c2d0dc541fd0f83d2f3a3",
        alt: "Pick and mix items for your stag do",
      },
    ],
    loading: "eager",
  },
  marketingCard2Props: {
    title: "Reserve your favourite stuff",
    copy: "Secure your weekend with a deposit of only £30 for the whole group",
    images: [
      {
        cloudinaryId: "63ebe754da9fa50fd75e77b3",
        alt: "Reserve your favourite stag do ideas",
      },
    ],
    loading: "eager",
  },
  marketingCard3Props: {
    title: "Simple individual payments",
    copy: "Send your mates a link to our online payment system, where they can pay off their deposits and remaining balances",
    images: [
      {
        cloudinaryId: "918e1fc761207ff1f9d7",
        alt: "Make payments for your stag weekend individually",
      },
    ],
    loading: "eager",
  },
  marketingCard4Props: {
    title: "Manage your booking online",
    copy: "We keep you constantly updated through our online booking system",
    images: [
      {
        cloudinaryId: "63ee65c7f0357c0fa8463ac0",
        alt: "Manage everything about your stag do online",
      },
    ],
    loading: "eager",
  },
  marketingCard5Props: {
    title: "Everyone Pays Individually",
    copy: "Everyone is accountable for their own payments, so you don't have to pay for others unless you really want to.",
    /*    images: [
          {
            cloudinaryId: '654519aab472c80f8dc32660',
            alt: 'Everyone pays for their own place on the stag do',
          },
        ],
        */
    svg: "piggy-bank",
  },
  marketingCard6Props: {
    title: "We chase any overdue payments",
    copy: "Chasing people for money is a hell of a headache - our systems do all the money chasing all automatically so you don't have to worry about it",
    /*    images: [
          {
            cloudinaryId: '6545195807e1e20f8ebb15bf',
            alt: 'We chase up all overdue payments for you',
          },
        ],
        */
    svg: "megaphone",
  },
  marketingCard7Props: {
    title: "Chill-out as we do all the leg work",
    copy: "Our payment system is very flexible - you can pay the amount you want for who you want when you want!",
    /*   images: [
         {
           cloudinaryId: '6545191c07e1e20f8ebb15ae',
           alt: 'Relax as we do all the leg work',
         },
       ],
       */
    svg: "beer",
  },
  marketingCard8Props: {
    title: "Largest Selection of Locations and Products",
    copy: "We have more products and locations than anyone else in the indistry - more choice, more testing = better stag weekends",
    images: [
      {
        cloudinaryId: "650c27bfc541fd0f83d2ef26",
        alt: "The largest selection of Stag Do products and activities",
      },
    ],
  },
  marketingCard9Props: {
    title: "1000's and 1000's of activity and location reviews",
    copy: "EVERY customer is asked to review the location and activities they went on - we publish the good, bad and ugly so you get an accurate picture of what locations and products are genuinily like",
    images: [
      {
        cloudinaryId: "650c2eecc541fd0f83d2f460",
        alt: "All our activities and locations are reviewed",
      },
    ],
  },
  marketingCard10Props: {
    title: "All Online At your Fingertips",
    copy: "Managing a stag do can be a hassle - we provide everything you need in a single, simple user interface",
    images: [
      {
        cloudinaryId: "650c282e0e02650f948adace",
        alt: "Everything for your stag do is available online",
      },
    ],
  },
  marketingCard11Props: {
    title: "Dedicated Event Manager",
    copy: "We train all our event managers like no one else - they live and breath stag weekends, and we get the staff out their doing the stuff they sell.",
    images: [
      {
        cloudinaryId: "650c2d4cf788810f824299d3",
        alt: "We will give you a dedicated stag do event manager",
      },
    ],
  },
  marketingCard12Props: {
    title: "UK Stag Do Ideas",
    copy: "",
    link: "/stag/region-uk",
    images: [
      {
        cloudinaryId: "1a4ec562f58b8b1f8b21",
        alt: "UK Stag Do Ideas and Cities",
      },
    ],
  },
  marketingCard13Props: {
    title: "Europe Stag Do Ideas",
    link: "/stag/region-europe",
    images: [
      {
        cloudinaryId: "65b9f77b860fb5792a2e71a9",
        alt: "European Stag Do Ideas and Cities",
      },
    ],
  },
  marketingCard14Props: {
    title: "Eastern Europe Stag Do Ideas",
    link: "/stag/region-eastern-europe",
    images: [
      {
        cloudinaryId: "65b9f6f3a61cac22fb09f60a",
        alt: "Eastern European Stag Do Ideas and Cities",
      },
    ],
  },
};
</script>
