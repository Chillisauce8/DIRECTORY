<template>
  <CardsContainer display="slider" :toggle="false" title="Steps to a Brilliant Stag Do"
                  subTitle="We make it simple to organise a legendary stag weekend">
    <MarketingCard :props="vm.marketingCard1Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard2Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard3Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard4Props"></MarketingCard>
  </CardsContainer>
  <AbtaStripSmall/>
  <TopLocations title="Top Stag Do Locations" :section="vm.section" :limit="10"></TopLocations>
  <MarketingBooster2/>
  <MarketingTimeline :eventType="vm.eventType"></MarketingTimeline>
  <MarketingBooster1/>
  <CardsContainer display="slider" :toggle="false"
                  title="Why Chillisauce - is the UK's Largest Stag Do Organiser"
                  subTitle="Chillisauce is the largest organiser of stag weekends in the UK - not by a bit - by a country mile!"
  >
    <MarketingCard :props="vm.marketingCard8Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard9Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard10Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard11Props"></MarketingCard>
  </CardsContainer>

  <TopActivities title="Popular Stag Do Activities" :section="vm.section"></TopActivities>
  <CardsContainer display="slider" :toggle="false"
                  title="Take the Stress Out of Payments"
                  subTitle="Managing the money from a large group of people is STRESSFUL - chasing up guests for money, being let down, and out of pocket - we solve all the problems."
                  class="CB-1">
    <MarketingCard class="card-5 Transparent" :props="vm.marketingCard5Props"></MarketingCard>
    <MarketingCard class="card-6 Transparent" :props="vm.marketingCard6Props"></MarketingCard>
    <MarketingCard class="card-7 Transparent" :props="vm.marketingCard7Props"></MarketingCard>
  </CardsContainer>

  <CardsContainer display="slider" :toggle="false" title="Browse By Stag Do Location">
    <MarketingCard :props="vm.marketingCard12Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard13Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard14Props"></MarketingCard>
  </CardsContainer>
</template>

<script setup>
const vm = {
  section: 'stag',
  eventType: 'stag do',
  marketingCard1Props: {
    title: 'Browse, Read Reviews, Pick and Mix',
    copy: 'Choose from thousands of activities across 69 locations to build your enquiry',
    images: [
      {
        cloudinaryId: '650c2d0dc541fd0f83d2f3a3',
        alt: 'Pick and mix items for your stag do',
      },
    ],
    loading: "eager"
  },
  marketingCard2Props: {
    title: 'Reserve your favourite stuff',
    copy: 'Secure your weekend with a deposit of only £30 for the whole group',
    images: [
      {
        cloudinaryId: '63ebe754da9fa50fd75e77b3',
        alt: 'Reserve your favourite stag do ideas',
      },
    ],
    loading: "eager"
  },
  marketingCard3Props: {
    title: 'Simple individual payments',
    copy: 'Send your mates a link to our online payment system, where they can pay off their deposits and remaining balances',
    images: [
      {
        cloudinaryId: '918e1fc761207ff1f9d7',
        alt: 'Make payments for your stag weekend individually',
      },
    ],
    loading: "eager"
  },
  marketingCard4Props: {
    title: 'Manage your booking online',
    copy: 'We keep you constantly updated through our online booking system',
    images: [
      {
        cloudinaryId: '63ee65c7f0357c0fa8463ac0',
        alt: 'Manage everything about your stag do online',
      },
    ],
    loading: "eager"
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
    svg: 'piggy-bank'

  },
  marketingCard6Props: {
    title: 'We chase any overdue payments',
    copy: "Chasing people for money is a hell of a headache - our systems do all the money chasing all automatically so you don't have to worry about it",
    /*    images: [
          {
            cloudinaryId: '6545195807e1e20f8ebb15bf',
            alt: 'We chase up all overdue payments for you',
          },
        ],
        */
    svg: 'megaphone'
  },
  marketingCard7Props: {
    title: 'Chill-out as we do all the leg work',
    copy: 'Our payment system is very flexible - you can pay the amount you want for who you want when you want!',
    /*   images: [
         {
           cloudinaryId: '6545191c07e1e20f8ebb15ae',
           alt: 'Relax as we do all the leg work',
         },
       ],
       */
    svg: 'beer'
  },
  marketingCard8Props: {
    title: 'Largest Selection of Locations and Products',
    copy: 'We have more products and locations than anyone else in the indistry - more choice, more testing = better stag weekends',
    images: [
      {
        cloudinaryId: '650c27bfc541fd0f83d2ef26',
        alt: 'The largest selection of Stag Do products and activities',
      },
    ],
  },
  marketingCard9Props: {
    title: "1000's and 1000's of activity and location reviews",
    copy: 'EVERY customer is asked to review the location and activities they went on - we publish the good, bad and ugly so you get an accurate picture of what locations and products are genuinily like',
    images: [
      {
        cloudinaryId: '650c2eecc541fd0f83d2f460',
        alt: 'All our activities and locations are reviewed',
      },
    ],
  },
  marketingCard10Props: {
    title: 'All Online At your Fingertips',
    copy: 'Managing a stag do can be a hassle - we provide everything you need in a single, simple user interface',
    images: [
      {
        cloudinaryId: '650c282e0e02650f948adace',
        alt: 'Everything for your stag do is available online',
      },
    ],
  },
  marketingCard11Props: {
    title: 'Dedicated Event Manager',
    copy: 'We train all our event managers like no one else - they live and breath stag weekends, and we get the staff out their doing the stuff they sell.',
    images: [
      {
        cloudinaryId: '650c2d4cf788810f824299d3',
        alt: 'We will give you a dedicated stag do event manager',
      },
    ],
  },
  marketingCard12Props: {
    title: 'UK Stag Do Ideas',
    copy: '',
    link: '/stag/region-uk',
    images: [
      {
        cloudinaryId: '1a4ec562f58b8b1f8b21',
        alt: 'UK Stag Do Ideas and Cities',
      },
    ],
  },
  marketingCard13Props: {
    title: 'Europe Stag Do Ideas',
    link: '/stag/region-europe',
    images: [
      {
        cloudinaryId: '65b9f77b860fb5792a2e71a9',
        alt: 'European Stag Do Ideas and Cities',
      },
    ],
  },
  marketingCard14Props: {
    title: 'Eastern Europe Stag Do Ideas',
    link: '/stag/region-eastern-europe',
    images: [
      {
        cloudinaryId: '65b9f6f3a61cac22fb09f60a',
        alt: 'Eastern European Stag Do Ideas and Cities',
      },
    ],
  }
};
</script>

<style scoped>

</style>