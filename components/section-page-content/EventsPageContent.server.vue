<template>
  <CardsContainer display="slider" :toggle="false" title="Brilliant Company Events"
                  subTitle="We make company events simple - for all occasions"
  >
    <MarketingCard :props="vm.marketingCard1Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard2Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard3Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard4Props"></MarketingCard>
  </CardsContainer>
  <AbtaStripSmall></AbtaStripSmall>
  <CardsContainer display="slider" :toggle="false" title="Making Events Simple"
                  subTitle="Organising company events is a stressfull business - we make it simple">
    <MarketingCard :props="vm.marketingCard5Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard6Props"></MarketingCard>
    <MarketingCard :props="vm.marketingCard7Props"></MarketingCard>
  </CardsContainer>
  <MarketingBooster1></MarketingBooster1>

  <TopLocations title="Most Popular Event Locations" :section="vm.section" :limit="10"></TopLocations>
  <!--  <CardsContainer display="slider" :toggle="false" title="Why Chillisauce - is the UK's Largest Activity Organiser"
                     subTitle="Chillisauce is the largest organiser of activity weekends in the UK - not by a bit - by a country mile!"
                     >

       <MarketingCard :props="marketingCard8Props"></MarketingCard>
       <MarketingCard :props="marketingCard9Props"></MarketingCard>
       <MarketingCard :props="marketingCard10Props"></MarketingCard>
       <MarketingCard :props="marketingCard11Props"></MarketingCard>
     </CardsContainer>
   -->
  <SplitBox :content="vm.marketingCard12Props" :display="vm.random"/>
  <SplitBox :content="vm.marketingCard13Props" :display="vm.random"/>
  <SplitBox :content="vm.marketingCard14Props" :display="vm.random"/>

  <MarketingBooster2></MarketingBooster2>
  <MarketingTimeline :eventType="vm.eventType" version="corporate"></MarketingTimeline>
  <!---      <TopActivities title="Popular Weekend Activities" :section="vm.section"></TopActivities> -->
  <HeroStrip :eventType="vm.eventType" :imageLeft="vm.heroStrip.imageLeft"
             :imageRight="vm.heroStrip.imageRight" version="corporate"></HeroStrip>
  <!--  <FrequentlyAskedQuestions></FrequentlyAskedQuestions> -->
</template>

<script setup>
const vm = {
  section: 'events',
  eventType: 'event',
  marketingCard1Props: {
    title: 'Something for everyone',
    copy: "The UK's largest range of activities, themes & entertainment ideas",
    images: [
      {
        cloudinaryId: '650c2d0dc541fd0f83d2f3a3',
        alt: 'Pick and mix items for your activity weekend',
      },
    ],
  },
  marketingCard2Props: {
    title: 'Full event management',
    copy: 'Everything done for you, from start to finish, we provide full event management',

    images: [
      {   cloudinaryId: '652d63534020410f9435eed4',
        alt: 'Full event management',
      },

    ],
  },
  marketingCard3Props: {
    title: 'A to Z of team building services',
    copy: 'From concept design, invitations, themeing, and facilitation, we provide compelete team building services',

    images: [
      {
        cloudinaryId: '652d626b4020410f9435ee82',
        alt: 'Make payments for your activity weekend individually',
      },
    ],
  },
  marketingCard4Props: {
    title: 'Huge Network of corporate venues',
    copy: 'We deal with a huge range of corporate venues across the UK and Europe',
    images: [
      {
        cloudinaryId: '652d621b7d17660f8944b07c',
        alt: 'Manage everything about your activity ideas online',
      },
    ],
  },
  marketingCard5Props: {
    title: "Amazing Value For Money",
    copy: "We know every company watches the pennies, we provide the quality without extotionate costs",
    images: [
      {
        cloudinaryId: '651582586624280f8ff60526',
        alt: 'Value for Money',
      },
    ],
  },
  marketingCard6Props: {
    title: 'Let us design and deliver beautiful invites',
    copy: "Announcing and inviting all the guests is a headache in itself - let us come up with beautiful and creative invites",
    images: [
      {
        cloudinaryId: '652d0cbdde74af0f8b40222f',
        alt: 'We chase up all overdue payments for you',
      },
    ],
  },
  marketingCard7Props: {
    title: 'Relax as we do all the leg work',
    copy: 'We know the pressure of delivering a company event - sit back and relax at we remove all the stress of event planning',
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
  marketingCard12Props: {
    title: 'How we make your corporate event or team building day special?',
    text: "We don’t stick to set formulas but instead use our expert knowledge to build bespoke events to meet your needs. Our team of specialist Event Managers are experienced in creating a unique, bespoke event and will work with you to create a programme that works. So whatever your requirements, be there specific needs around logistics, objective, budget or location you can rely on us to build the event to fit. Furthermore, we're always launching new and often unique activities ensuring there is something for everyone!",
    image: [
      {
        image: {id: '7192c1ede19c7e7cd093',  alt: 'How we make your corporate event or team building day special',},
        section: []
      }
    ],
  },
  marketingCard13Props: {
    title: 'The easiest way to plan an exceptional company event',
    text: "our personal event manager will take the hassle out of organising your perfect team building day or corporate event. Securing you the best rates, planning the ideal itinerary for your team whilst meeting your bespoke needs and business requirements.",
    image: [
      {
        image: {id: '48d590c324c8eb7b61f7',  alt: 'How we make your corporate event or team building day special',},
        section: []
      }
    ],
  },
  marketingCard14Props: {
    title: 'Join the hundreds of forward-thinking companies that use Chillisauce every year',
    text: "We have decades of experience helping to put together a wide range of corporate events, parties, entertainment and team building experiences including, Team building days, Incentive Travel, Product Launches, Meetings and Conferences, Bespoke events, Christmas and Summer Parties, Themed Packages, Entertainment and Leadership Off Site Events.",
    image: [
      {
        image: {id: '67f68fecba930eaa4e24',  alt: 'How we make your corporate event or team building day special',},
        section: []
      }
    ],
  },
  heroStrip: {
    imageLeft: '652d21164020410f9435bf10',
    imageRight: '652d2101de74af0f8b402f09',
  },
};
</script>

<style>

</style>