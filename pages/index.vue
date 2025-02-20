<template>
    <div>
        <hero-header :props="heroHeaderProps" >
            <MarketSearch />
        </hero-header>


    </div>
</template>

<script setup lang="ts">
const heroHeaderProps = {
    title: 'Rolls-Royce',
    subTitle: 'Phantom 2001',
    widths: '400:2000',
    images: [
        {
            _id: '6749c3be4c3a9f01b56ebf2a',
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
</script>
