<template>
  <CardsContainer display="slider" :toggle="false"
                  title="Steps to a Brilliant Hen Party"
                  subTitle="We make it simple to organise a legendary hen do">
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
  <TopLocations title="Top Hen Party Locations" :section="vm.section" :limit="10"></TopLocations>
  <CardsContainer display="slider" :toggle="false"
                  title="Why Chillisauce - is the UK's Largest Hen Party Organiser"
                  subTitle="Chillisauce is the largest organiser of hen parties in the UK - find out why">
    <MarketingCard :props="vm.marketingCard8Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard9Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard10Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard11Props"></MarketingCard>
  </CardsContainer>
  <MarketingBooster2></MarketingBooster2>
  <MarketingTimeline :eventType="vm.eventType"></MarketingTimeline>
  <!-- <TopActivities title="Popular Hen Do Activities" :section="vm.section"></TopActivities> -->
  <HeroStrip :eventType="vm.eventType" :imageLeft="vm.heroStrip.imageLeft"
             :imageRight="vm.heroStrip.imageRight"></HeroStrip>
  <!--    <FrequentlyAskedQuestions></FrequentlyAskedQuestions> -->
</template>

<script setup>
const vm = {
  section: 'hen',
  eventType: 'hen do',
  heroHeaderProps: {
    title: 'The easiest way to organise a hen do',
    subTitle: 'Choose from 1000s of hen do activities, nightlife ideas and places to stay',
    type: 'barText',
    random: true,
    min:3,
    max: 6,
    grayscale: false,
    width: 500,
    images: [
      {
        cloudinaryId: '65460b34c943fd0f932cc542',
      },
      {
        cloudinaryId: '65460b81c302c20f899059f8',
      },
      {
        cloudinaryId: '65460b9fc943fd0f932cc554',
      },
      {
        cloudinaryId: '65460bc3c943fd0f932cc568',
      },
      {
        cloudinaryId: '65460be0c943fd0f932cc573',
      },
      {
        cloudinaryId: '65460bfcc302c20f89905a0f',
      },
      {
        cloudinaryId: '65460c16c943fd0f932cc5bc',
      },
      {
        cloudinaryId: '65460c31c943fd0f932cc6a3',
      },
      {
        cloudinaryId: '65465ca2c943fd0f932d001f'
      },
      {
        cloudinaryId: '654661f8c302c20f89908754'
      },
      {
        cloudinaryId: '654663f0c302c20f899089d4'
      },
      {
        cloudinaryId: '654664c6afa7da0f9649fd37'
      },

    ],
  },
  marketingCard1Props: {
    title: 'Browse, Read Reviews, Pick and Mix',
    copy: 'Choose from thousands of activities across 69 locations to build your enquiry',
    images: [
      {
        cloudinaryId: '650c2d0dc541fd0f83d2f3a3',
        alt: 'Pick and mix items for your hen do',
      },
    ],
  },
  marketingCard2Props: {
    title: 'Reserve your favourite stuff',
    copy: 'Secure your weekend with a deposit of only £30 for the whole group',

    images: [
      {
        cloudinaryId: '652d15701b78b80f894e44cf',
        alt: 'Reserve your favourite hen do ideas',
      },

    ],
  },
  marketingCard3Props: {
    title: 'Simple individual payments',
    copy: 'Send your mates a link to our online payment system, where they can pay off their deposits and remaining balances',
    images: [
      {
        cloudinaryId: '652d13e27d17660f89447625',
        alt: 'Make payments for your hen weekend individually',
      },
    ],
  },
  marketingCard4Props: {
    title: 'Manage your booking online',
    copy: 'We keep you constantly updated through our online booking system',
    images: [
      {
        cloudinaryId: '652d14977d17660f89447657',
        alt: 'Manage everything about your hen do online',
      },
    ],
  },
  marketingCard5Props: {
    title: "Everyone Pays Individually",
    copy: "Everyone is accountable for their own payments, so you don't have to pay for others unless you really want to.",
    images: [
      {
        cloudinaryId: '651581e07b11f60fa26358f6',
        alt: 'Everyone pays for their own place on the hen do',
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
        cloudinaryId: '652d0d471b78b80f894e3fed',
        alt: 'We do all the leg work',
      },
    ],
  },
  marketingCard8Props: {
    title: 'Largest Selection of Locations and Products',
    copy: 'We have more products and locations than anyone else in the indistry - more choice, more testing = better hen weekends',
    images: [
      {
        cloudinaryId: '652d180e4020410f9435b7f2',
        alt: 'We offer the largest selection of hen do activities in the UK',
      },
    ],
  },
  marketingCard9Props: {
    title: "1000's and 1000's of activity and location reviews",
    copy: 'EVERY customer is asked to review the location and activities they went on - we publish the good, bad and ugly so you get an accurate picture of what locations and products are genuinily like',
    images: [
      {
        cloudinaryId: '652d18c5de74af0f8b4029fa',
        alt: 'All our hen products are individually reviewed',
      },
    ],
  },
  marketingCard10Props: {
    title: 'All Online At your Fingertips',
    copy: 'Managing a hen do can be a hassle - we provide everything you need in a single, simple user interface',
    images: [
      {
        cloudinaryId: '652d19071b78b80f894e480e',
        alt: 'Your whole hen party is avialble online',
      },
    ],
  },
  marketingCard11Props: {
    title: 'Dedicated Event Manager',
    copy: 'We train all our event managers like no one else - they live and breath hen weekends, and we get the staff out their doing the stuff they sell.',
    images: [
      {
        cloudinaryId: '650c2d4cf788810f824299d3',
        alt: 'We give you a dedicated hen party manager',
      },
    ],
  },
  heroStrip: {
    imageLeft: '652d21164020410f9435bf10',
    imageRight: '652d2101de74af0f8b402f09',
  },
};
</script>

<style scoped>

</style>