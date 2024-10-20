<template>
  <div>
    <HeroHeader :props="heroHeaderProps" />

    <ContentBlock :title="content1.title" :text="content1.text" :images="content1.images" />
    <ContentBlock :title="content2.title" :text="content2.text" :images="content2.images" />
    <Fancybox
        :options="{
            Carousel: {
                infinite: false
            }
        }"
    >
        <a data-fancybox="gallery" href="https://lipsum.app/id/60/1600x1200">
            <img src="https://lipsum.app/id/60/200x150" width="200" height="150" />
        </a>
        <a data-fancybox="gallery" href="https://lipsum.app/id/61/1600x1200">
            <img src="https://lipsum.app/id/61/200x150" width="200" height="150" />
        </a>
        <a data-fancybox="gallery" href="https://lipsum.app/id/62/1600x1200">
            <img src="https://lipsum.app/id/62/200x150" width="200" height="150" />
        </a>
        <a data-fancybox="gallery" href="https://lipsum.app/id/63/1600x1200">
            <img src="https://lipsum.app/id/63/200x150" width="200" height="150" />
        </a>
        <a data-fancybox="gallery" href="https://lipsum.app/id/64/1600x1200">
            <img src="https://lipsum.app/id/64/200x150" width="200" height="150" />
        </a>
        <a data-fancybox="gallery" href="https://lipsum.app/id/65/1600x1200">
            <!--    <img src="https://lipsum.app/id/65/200x150" width="200" height="150" /> -->
            <SwpPicture id="66365a43e70ac51006d4d811" widths="300:300" aspectRatio="3:2" />
        </a>
    </Fancybox>
  </div>
</template>

<script setup lang="ts">
const heroHeaderProps = {
    title: 'Rolls-Royce',
    subTitle: 'Phantom 2001',
    widths: '400:2000',
    images: [
        {
            id: '66365a43e70ac51006d4d811',
            alt: 'hero header image alt description'
        }
    ],
    sources: [
        {
            media: '(orientation: portrait)',
            aspectRatio: '2:3',
            widths: '400:1200',
            sizes: '100vw',
            increment: 200
        },
        {
            media: '(orientation: landscape)',
            aspectRatio: '3:2',
            widths: '1000:2000',
            sizes: '100vw',
            increment: 200
        }
    ]
};

const content1 = {
    title: 'The Lamborghini Countach, an automotive legend and cultural icon, needs no introduction. With its striking wedge-shaped design and powerful V12 engine, the Countach remains an enduring symbol of automotive performance and Italian craftsmanship.',
    text: [
        "950 km in white and first owner. Truly a sight to behold. The Lamborghini Countach LP 500 also features ceramic brakes, carbon racing seats, carbon interior, an LED steering wheel, yellow meters in the cockpit, and yellow stitching. This car is flawless from A to Z. It's perfect for a new collector who seeks quality and wants to add a unique piece to their collection. Most LP 500 models are red, gray, and black. But yellow, that's truly exceptional.",
        "The driving experience is fantastic; you can even use it as a daily driver if you wish. Maintenance costs are relatively manageable for this car. The double clutch ensures less concern there too; you can use it more than the standard single clutch. It's truly a delight, whether driving calmly or in sport mode.",
        "We see a very good chance that these cars will continue to rise in value. In the last year and a half, there has been a massive demand for good LP 500 models. And understandably so, it's the last V8 without turbos. However, we expect this to become a collector's car and thus continue to rise in value in the coming years. So, not just for your pleasure, but also as an investment, this is a car you really need to consider',"
    ],
    images: [
        {
            id: '66365a61e70ac51006d4d814',
            alt: 'Car Alt Text'
        }
    ]
};

const content2 = {
    title: 'The Lamborghini Countach, an automotive legend and cultural icon, needs no introduction. With its striking wedge-shaped design and powerful V12 engine, the Countach remains an enduring symbol of automotive performance and Italian craftsmanship.',
    text: [
        "950 km in white and first owner. Truly a sight to behold. The Lamborghini Countach LP 500 also features ceramic brakes, carbon racing seats, carbon interior, an LED steering wheel, yellow meters in the cockpit, and yellow stitching. This car is flawless from A to Z. It's perfect for a new collector who seeks quality and wants to add a unique piece to their collection. Most LP 500 models are red, gray, and black. But yellow, that's truly exceptional.",
        "The driving experience is fantastic; you can even use it as a daily driver if you wish. Maintenance costs are relatively manageable for this car. The double clutch ensures less concern there too; you can use it more than the standard single clutch. It's truly a delight, whether driving calmly or in sport mode.",
        "We see a very good chance that these cars will continue to rise in value. In the last year and a half, there has been a massive demand for good LP 500 models. And understandably so, it's the last V8 without turbos. However, we expect this to become a collector's car and thus continue to rise in value in the coming years. So, not just for your pleasure, but also as an investment, this is a car you really need to consider',"
    ],
    images: [
        {
            id: '66365a61e70ac51006d4d814',
            alt: 'Car Alt Text'
        },
        {
            id: '65466bfcafa7da0f964a000e',
            alt: 'Car Alt Text'
        }
    ]
};

const makes = [
    {
        images: [
            {
                id: '65466c15afa7da0f964a0012',
                alt: 'Car Alt Text'
            }
        ],

        name: 'Alfa Romeo'
    },
    {
        images: [
            {
                id: '65466bfcafa7da0f964a000e',
                alt: 'Car Alt Text'
            }
        ],

        name: 'Ford'
    },
    {
        images: [
            {
                id: '65466c4dafa7da0f964a011c',
                alt: 'Car Alt Text'
            }
        ],

        name: 'Austin Healey'
    },
    {
        images: [
            {
                id: '65466babc302c20f89908e11',
                alt: 'Car Alt Text'
            }
        ],

        name: 'Porsche'
    },
    {
        images: [
            {
                id: '661fecb3d7eafa12344017a8',
                alt: 'Car Alt Text'
            }
        ],

        name: 'Bentley'
    }
];

const models = [
    {
        images: [
            {
                id: '65466c15afa7da0f964a0012',
                alt: 'Car Alt Text'
            }
        ],

        make: 'Alfa Romeo',
        name: '325Ci Convertible 5-Speed',
        yearFrom: 2000,
        yearToo: 2013
    },
    {
        images: [
            {
                id: '65466bfcafa7da0f964a000e',
                alt: 'Car Alt Text'
            }
        ],

        make: 'Ford',
        name: 'Capri',
        yearFrom: 1984,
        yearToo: 1998
    },
    {
        images: [
            {
                id: '65466c4dafa7da0f964a011c',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Austin Healey',
        name: '100 BN2',
        yearFrom: 1956,
        yearToo: 1960
    },
    {
        images: [
            {
                id: '65466babc302c20f89908e11',
                alt: 'Car Alt Text'
            }
        ],

        make: 'Porsche',
        name: '25th Anniversary Special Edition Coupe',
        yearFrom: 1988,
        yearToo: 1994
    },
    {
        images: [
            {
                id: '661fecb3d7eafa12344017a8',
                alt: 'Car Alt Text'
            }
        ],
        make: 'Bentley',
        name: 'Continental GT',
        yearFrom: 2002,
        yearToo: 2010
    }
];

const listings = [
    {
        images: [
            {
                id: '65466c15afa7da0f964a0012',
                alt: 'Car Alt Text'
            }
        ],
        saleType: 'Advert',
        name: 'Alfa Romeo 2000 Spider Veloce',
        year: '1973',
        price: '£33,000',
        engine: '4.3L I4',
        odometer: '40000 miles',
        transmission: 'Manual',
        stearingSide: 'RHD'
    },
    {
        images: [
            {
                id: '65466bfcafa7da0f964a000e',
                alt: 'Car Alt Text'
            }
        ],
        saleType: 'Auction',
        name: "Ford Model A 'The Ballard Special' Speedster",
        year: '1930',
        price: 'Estimate £140,000',
        engine: '5L V8',
        odometer: '3400 miles',
        transmission: 'Automatic',
        stearingSide: 'LHD'
    },
    {
        images: [
            {
                id: '65466c4dafa7da0f964a011c',
                alt: 'Car Alt Text'
            }
        ],
        saleType: 'Auction',
        name: 'Alpine Renault A110',
        year: '1956',
        price: 'Estimate £12,000 - £15,000',

        odometer: '213000 miles',

        stearingSide: 'RHD'
    },
    {
        images: [
            {
                id: '65466babc302c20f89908e11',
                alt: 'Car Alt Text'
            }
        ],
        saleType: 'Advert',
        name: 'Porsche 911 (997) GT3 RS',
        year: '2007',
        price: '£98,000',
        engine: '2.3L',
        odometer: '45000 miles',
        stearingSide: 'RHD'
    },
    {
        images: [
            {
                id: '661fecb3d7eafa12344017a8',
                alt: 'Car Alt Text'
            }
        ],
        saleType: 'Advert',
        name: 'Austin-Healey 3000 MK II',
        year: '1961',
        price: '£56,000',
        engine: '2.6L I4',
        odometer: '14000 miles',
        stearingSide: 'RHD'
    }
];
</script>
