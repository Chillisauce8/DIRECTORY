<template>
    <div class="full-screen">
        <HeroHeader :props="heroHeaderProps" />
        <ContentBlock :title="content1.title" :text="content1.text" :images="content1.images" />
        <ContentBlock :title="content2.title" :text="content2.text" :images="content2.images" />
        <CardGallery />
        <fancy-box :options="{ Carousel: { infinite: true } }">
            <a href="https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto/654663d2c302c20f899089c3" data-fancybox="gallery">
                <img src="https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto/654663d2c302c20f899089c3" alt="Thumbnail" />
            </a>
        </fancy-box>
    </div>
</template>

<script setup lang="ts">
const listings = useListings();

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
</script>
