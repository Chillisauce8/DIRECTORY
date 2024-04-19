<template>
  <CardsContainer display="slider" :toggle="false" title="Steps to a Brilliant Activity Weekend"
                  subTitle="We make it simple to organise a legendary activity weekend">
    <MarketingCard :props="vm.marketingCard1Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard2Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard3Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard4Props"></MarketingCard>
  </CardsContainer>
  <AbtaStripSmall></AbtaStripSmall>
  <CardsContainer display="slider" :toggle="false" title="Take the Stress Out of Payments"
                  subTitle="Managing the money from a large group of people is STRESSFUL - chasing up guests for money, being let down, and out of pocket - we solve all the problems.">
    <MarketingCard :props="vm.marketingCard5Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard6Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard7Props"></MarketingCard>
  </CardsContainer>
  <MarketingBooster1></MarketingBooster1>
  <TopLocations title="Top Activity Weekend Locations" :section="vm.section" :limit="10"></TopLocations>
  <CardsContainer display="slider" :toggle="false"
                  title="Why Chillisauce - is the UK's Largest Activity Organiser"
                  subTitle="Chillisauce is the largest organiser of activity weekends in the UK - not by a bit - by a country mile!">
    <MarketingCard :props="vm.marketingCard8Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard9Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard10Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard11Props"></MarketingCard>
  </CardsContainer>
  <MarketingBooster2></MarketingBooster2>
  <MarketingTimeline :eventType="vm.eventType"></MarketingTimeline>
  <!---    <TopActivities title="Popular Weekend Activities" :section="vm.section"></TopActivities> -->
  <HeroStrip :eventType="vm.eventType" :imageLeft="vm.heroStrip.imageLeft"
             :imageRight="vm.heroStrip.imageRight"></HeroStrip>
  <!--  <FrequentlyAskedQuestions></FrequentlyAskedQuestions> -->
</template>

<script setup>
const vm = {
  section: 'groups',
  eventType: 'event',
  marketingCard1Props: {
    title: 'Browse, Read Reviews, Pick and Mix',
    copy: 'Choose from thousands of activities across 69 locations to build your enquiry',
    images: [
      {
        cloudinaryId: '650c2d0dc541fd0f83d2f3a3',
        alt: 'Pick and mix items for your activity weekend',
      },
    ],
  },
  marketingCard2Props: {
    title: 'Reserve your favourite stuff',
    copy: 'Secure your weekend with a deposit of only £30 for the whole group',

    images: [
      {   cloudinaryId: '650c282e0e02650f948adace',
        alt: 'Reserve your favourite activity ideas',
      },

    ],
  },
  marketingCard3Props: {
    title: 'Simple individual payments',
    copy: 'Send your mates a link to our online payment system, where they can pay off their deposits and remaining balances',
    images: [
      {
        cloudinaryId: '918e1fc761207ff1f9d7',
        alt: 'Make payments for your activity weekend individually',
      },
    ],
  },
  marketingCard4Props: {
    title: 'Manage your booking online',
    copy: 'We keep you constantly updated through our online booking system',
    images: [
      {
        cloudinaryId: '63ee65c7f0357c0fa8463ac0',
        alt: 'Manage everything about your activity ideas online',
      },
    ],
  },
  marketingCard5Props: {
    title: "Everyone Pays Individually",
    copy: "Everyone is accountable for their own payments, so you don't have to pay for others unless you really want to.",
    images: [
      {
        cloudinaryId: '651582586624280f8ff60526',
        alt: 'Everyone pays for their own place on the activity event',
      },
    ],
  },
  marketingCard6Props: {
    title: 'We chase any overdue payments',
    copy: "Chasing people for money is a hell of a headache - our systems do all the money chasing all automatically so you don't have to worry about it",
    images: [
      {
        cloudinaryId: '652d0cbdde74af0f8b40222f',
        alt: 'We chase up all overdue payments for you',
      },
    ],
  },
  marketingCard7Props: {
    title: 'Chill-out as we do all the leg work',
    copy: 'Our payment system is very flexible - you can pay the amount you want for who you want when you want!',
    images: [
      {
        cloudinaryId: '65157f506624280f8ff602c0',
        alt: 'Relax as we do all the leg work',
      },
    ],
  },
  marketingCard8Props: {
    title: 'Largest Selection of Locations and Products',
    copy: 'We have more products and locations than anyone else in the indistry - more choice, more testing = better activity weekends',
    images: [
      {
        cloudinaryId: '650c27bfc541fd0f83d2ef26',
        alt: 'The largest selection of activity products and activities',
      },
    ],
  },

  marketingCard9Props: {
    title: "1000's and 1000's of activity and location reviews",
    copy: 'EVERY customer is asked to review the location and activities they went on - we publish the good, bad and ugly so you get an accurate picture of what locations and products are genuinily like',
    images: [
      {
        cloudinaryId: '652d18c5de74af0f8b4029fa',
        alt: 'All our activities and locations are reviewed',
      },
    ],
  },
  marketingCard10Props: {
    title: 'All Online At your Fingertips',
    copy: 'Managing a activity weekend can be a hassle - we provide everything you need in a single, simple user interface',
    images: [
      {
        cloudinaryId: '652d19071b78b80f894e480e',

        alt: 'Everything for your activity event is available online',
      },
    ],
  },
  marketingCard11Props: {
    title: 'Dedicated Event Manager',
    copy: 'We train all our event managers like no one else - they live and breath activity weekends, and we get the staff out their doing the stuff they sell.',
    images: [
      {
        cloudinaryId: '650c2d4cf788810f824299d3',
        alt: 'We will give you a dedicated event manager',
      },
    ],
  },
  heroStrip:{
    imageLeft: '652d2389de74af0f8b40302f',
    imageRight: '652d209d7d17660f8944807b',
  },
};
</script>

<style scoped>

</style>