<template>
    <div class="card flex justify-content-center">
        <Galleria
            v-model:activeIndex="activeIndex"
            v-model:visible="displayCustom"
            :value="images"
            :responsiveOptions="responsiveOptions"
            containerStyle="max-width: 600px"
            :circular="true"
            :fullScreen="true"
            :showItemNavigators="true"
            :showThumbnails="true"
        >
            <template #item="slotProps">
                <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="width: 100%; display: block" />
            </template>
            <template #caption="slotProps">
                <div class="title">{{ slotProps.item.title }}</div>
                <p class="description">{{ slotProps.item.alt }}</p>
                <div>Edit Me</div>
            </template>

            <template #thumbnail="slotProps">
                <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" style="display: block" />
            </template>
        </Galleria>
        <vue-horizontal>
            <div v-if="images" class="grid" style="max-width: 800px">
                <div v-for="(image, index) of images" :key="index" class="col-4">
                    <img :src="image.thumbnailImageSrc" :alt="image.alt" style="cursor: pointer" @click="imageClick(index)" />
                </div>
            </div>
        </vue-horizontal>
    </div>
</template>

<script setup>
const images = [
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365a43e70ac51006d4d811',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365a43e70ac51006d4d811',
        alt: 'Pick and mix items for your stag do'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365a61e70ac51006d4d814',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365a61e70ac51006d4d814',
        title: 'Here is my Image Title 1'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365a9b87fa1f24532a35d0',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365a9b87fa1f24532a35d0',
        title: 'Here is my Image Title 2',
        alt: 'Make payments for your stag weekend individually'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365abb87fa1f24532a35d3',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365abb87fa1f24532a35d3',
        title: 'Here is my Image Title 3',
        alt: 'Manage everything about your stag do online'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365b5ee70ac51006d4d845',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365b5ee70ac51006d4d845',
        title: 'Here is my Image Title 4',
        alt: 'Everyone pays for their own place on the stag do'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365ba693a20f781cf46dd5',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365ba693a20f781cf46dd5',
        alt: 'We chase up all overdue payments for you'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365bc7e70ac51006d4d857',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365bc7e70ac51006d4d857',
        alt: 'Everyone pays for their own place on the stag do'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365be9e70ac51006d4d862',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365be9e70ac51006d4d862',
        alt: 'We chase up all overdue payments for you'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365a43e70ac51006d4d811',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365a43e70ac51006d4d811',
        alt: 'Pick and mix items for your stag do'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365a61e70ac51006d4d814',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365a61e70ac51006d4d814',
        alt: 'Reserve your favourite stag do ideas'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365a9b87fa1f24532a35d0',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365a9b87fa1f24532a35d0',
        alt: 'Make payments for your stag weekend individually'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365abb87fa1f24532a35d3',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365abb87fa1f24532a35d3',
        alt: 'Manage everything about your stag do online'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365b5ee70ac51006d4d845',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365b5ee70ac51006d4d845',
        alt: 'Everyone pays for their own place on the stag do'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365ba693a20f781cf46dd5',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365ba693a20f781cf46dd5',
        alt: 'We chase up all overdue payments for you'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365bc7e70ac51006d4d857',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365bc7e70ac51006d4d857',
        alt: 'Everyone pays for their own place on the stag do'
    },
    {
        itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/66365be9e70ac51006d4d862',
        thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_60,h_40/66365be9e70ac51006d4d862',
        alt: 'We chase up all overdue payments for you'
    }
];

//const images = ref();
const activeIndex = ref(0);
const responsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 5
    },
    {
        breakpoint: '768px',
        numVisible: 3
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
]);
const displayCustom = ref(false);
const imageClick = (index) => {
    activeIndex.value = index;
    displayCustom.value = true;
};
</script>
