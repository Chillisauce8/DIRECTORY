<template>
  <CardsContainer display="grid" :toggle="false" title="My Cars">
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
</template>

<script setup lang="ts">
const heroHeaderProps = {
  style: "make",
  title: "Austin Healey",
  // subTitle: "Tools to increase your enjoyment of classic car ownership",
  min: 1,
  max: 1,
  grayscale: true,
  width: 1200,
  images: [
    {
      cloudinaryId: "661fecb3d7eafa12344017a8",
    },
  ],
};
const description =
  "Porsche was established in 1931 as an automotive developer and consultant. Founded by the famous Ferdinand Porsche, the company was responsible for the creation of the Volkswagen Type 1 Beetle. After WW2, the company finally began producing its own automobiles, starting with the Porsche 356 in 1948. Since the creation of the 356, Porsche has always had a focus on producing sporty, high performance cars. In 1965, the company introduced the Porsche 911, a car that has gone on to become synonymous with sports cars, and cemented the company's place among the most respected in the motoring world. Aside from famous models such as the Carrera GT and 918 Spyder, Porsche also has a storied history in motorsport, winning championships and titles in a wide range of competitions. Racing legends such as the 908, the 718 RSK, the 917, and the 907 all wear the Porsche badge.";

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
