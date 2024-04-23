<template>
  <HeroHeader :props="heroHeaderProps" />
  <!-- <PageNav /> -->
  <CardsContainer display="slider" :toggle="true" title="Makes">
    <template v-for="(make, index) in makes" :key="index">
      <MakeCard :images="make.images" :name="make.name" />
    </template>
  </CardsContainer>

  <CardsContainer display="slider" :toggle="true" title="Models">
    <template v-for="(model, index) in models" :key="index">
      <ModelCard
        :images="model.images"
        :make="model.make"
        :name="model.name"
        :yearFrom="model.yearFrom"
        :yearToo="model.yearToo"
      />
    </template>
  </CardsContainer>

  <CardsContainer display="slider" :toggle="true" title="Vehicles">
    <template v-for="(listing, index) in listings" :key="index">
      <ListingCard
        :images="listing.images"
        :saleType="listing.saleType"
        :name="listing.name"
        :year="listing.year"
        :price="listing.price"
        :engine="listing.engine"
        :odometer="listing.odometer"
        :transmission="listing.transmission"
        :stearingSide="listing.stearingSide"
      />
    </template>
  </CardsContainer>
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
const makes = [
  {
    images: [
      {
        cloudinaryId: "65466c15afa7da0f964a0012",
        alt: "Car Alt Text",
      },
    ],

    name: "Alfa Romeo",
  },
  {
    images: [
      {
        cloudinaryId: "65466bfcafa7da0f964a000e",
        alt: "Car Alt Text",
      },
    ],

    name: "Ford",
  },
  {
    images: [
      {
        cloudinaryId: "65466c4dafa7da0f964a011c",
        alt: "Car Alt Text",
      },
    ],

    name: "Austin Healey",
  },
  {
    images: [
      {
        cloudinaryId: "65466babc302c20f89908e11",
        alt: "Car Alt Text",
      },
    ],

    name: "Porsche",
  },
  {
    images: [
      {
        cloudinaryId: "661fecb3d7eafa12344017a8",
        alt: "Car Alt Text",
      },
    ],

    name: "Bentley",
  },
];

const models = [
  {
    images: [
      {
        cloudinaryId: "65466c15afa7da0f964a0012",
        alt: "Car Alt Text",
      },
    ],

    make: "Alfa Romeo",
    name: "325Ci Convertible 5-Speed",
    yearFrom: 2000,
    yearToo: 2013,
  },
  {
    images: [
      {
        cloudinaryId: "65466bfcafa7da0f964a000e",
        alt: "Car Alt Text",
      },
    ],

    make: "Ford",
    name: "Capri",
    yearFrom: 1984,
    yearToo: 1998,
  },
  {
    images: [
      {
        cloudinaryId: "65466c4dafa7da0f964a011c",
        alt: "Car Alt Text",
      },
    ],
    make: "Austin Healey",
    name: "100 BN2",
    yearFrom: 1956,
    yearToo: 1960,
  },
  {
    images: [
      {
        cloudinaryId: "65466babc302c20f89908e11",
        alt: "Car Alt Text",
      },
    ],

    make: "Porsche",
    name: "25th Anniversary Special Edition Coupe",
    yearFrom: 1988,
    yearToo: 1994,
  },
  {
    images: [
      {
        cloudinaryId: "661fecb3d7eafa12344017a8",
        alt: "Car Alt Text",
      },
    ],
    make: "Bentley",
    name: "Continental GT",
    yearFrom: 2002,
    yearToo: 2010,
  },
];

const listings = [
  {
    images: [
      {
        cloudinaryId: "65466c15afa7da0f964a0012",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Advert",
    name: "Alfa Romeo 2000 Spider Veloce",
    year: "1973",
    price: "£33,000",
    engine: "4.3L I4",
    odometer: "40000 miles",
    transmission: "Manual",
    stearingSide: "RHD",
  },
  {
    images: [
      {
        cloudinaryId: "65466bfcafa7da0f964a000e",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Auction",
    name: "Ford Model A 'The Ballard Special' Speedster",
    year: "1930",
    price: "Estimate £140,000",
    engine: "5L V8",
    odometer: "3400 miles",
    transmission: "Automatic",
    stearingSide: "LHD",
  },
  {
    images: [
      {
        cloudinaryId: "65466c4dafa7da0f964a011c",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Auction",
    name: "Alpine Renault A110",
    year: "1956",
    price: "Estimate £12,000 - £15,000",

    odometer: "213000 miles",

    stearingSide: "RHD",
  },
  {
    images: [
      {
        cloudinaryId: "65466babc302c20f89908e11",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Advert",
    name: "Porsche 911 (997) GT3 RS",
    year: "2007",
    price: "£98,000",
    engine: "2.3L",
    odometer: "45000 miles",
    stearingSide: "RHD",
  },
  {
    images: [
      {
        cloudinaryId: "661fecb3d7eafa12344017a8",
        alt: "Car Alt Text",
      },
    ],
    saleType: "Advert",
    name: "Austin-Healey 3000 MK II",
    year: "1961",
    price: "£56,000",
    engine: "2.6L I4",
    odometer: "14000 miles",
    stearingSide: "RHD",
  },
];
</script>
