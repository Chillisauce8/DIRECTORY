<template>
  <div>
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
            <img :src="slotProps.item.cloudinaryId" :alt="slotProps.item.alt" style="display: block" />
        </template>
    </Galleria>
    <SelectButton v-model="value" :options="options" aria-labelledby="basic" />
    <vue-horizontal v-if="value === 'Row'" class="media-gallery row-view">
        <div v-for="(image, index) of images" :key="index">
            <PictureImage :id="image.id" :alt="image.alt" params="w_200,h_150" loading="lazy" @click="imageClick(index)" />
        </div>
    </vue-horizontal>
    <div v-else-if="value === 'Grid'" class="media-gallery grid-view">
        <image-wrapper v-if="images" :images="images" :width="290" :height="145" loading="lazy" class="thumbnail" />
    </div>
    <div v-else-if="value === 'Pop'" class="media-gallery grid-view">
        <div v-for="(image, index) of images" :key="index" class="col-4">
            <img :src="image.id" :alt="image.alt" style="cursor: pointer" @click="imageClick(index)" />
        </div>
    </div>

    <div v-else-if="value === 'Test'" class="media-gallery test-view">
        <PictureImage v-for="(image, index) of images" :key="index" :id="image.id" :alt="image.alt" params="w_200,h_150" @click="imageClick(index)" />
    </div>
  </div>
</template>

<script setup>
import VueHorizontal from 'vue-horizontal';
const props = defineProps(['images', 'display']);
const value = ref('Row');
const options = ref(['Row', 'Grid', 'Pop', 'Test']);

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

const images = [
    {
        id: '66365a43e70ac51006d4d811',
        alt: 'Pick and mix items for your stag do'
    },
    {
        id: '66365a61e70ac51006d4d814',
        title: 'Here is my Image Title 1'
    },
    {
        id: '66365a9b87fa1f24532a35d0',
        title: 'Here is my Image Title 2',
        alt: 'Make payments for your stag weekend individually'
    },
    {
        id: '66365abb87fa1f24532a35d3',
        title: 'Here is my Image Title 3',
        alt: 'Manage everything about your stag do online'
    },
    {
        id: '66365b5ee70ac51006d4d845',
        title: 'Here is my Image Title 4',
        alt: 'Everyone pays for their own place on the stag do'
    },
    {
        id: '66365ba693a20f781cf46dd5',
        alt: 'We chase up all overdue payments for you'
    },
    {
        id: '66365bc7e70ac51006d4d857',
        alt: 'Everyone pays for their own place on the stag do'
    },
    {
        id: '66365be9e70ac51006d4d862',
        alt: 'We chase up all overdue payments for you'
    },
    {
        id: '66365a43e70ac51006d4d811',
        alt: 'Pick and mix items for your stag do'
    },
    {
        id: '66365a61e70ac51006d4d814',
        alt: 'Reserve your favourite stag do ideas'
    },
    {
        id: '66365a9b87fa1f24532a35d0',
        alt: 'Make payments for your stag weekend individually'
    },
    {
        id: '66365abb87fa1f24532a35d3',
        alt: 'Manage everything about your stag do online'
    },
    {
        id: '66365b5ee70ac51006d4d845',
        alt: 'Everyone pays for their own place on the stag do'
    },
    {
        id: '66365ba693a20f781cf46dd5',
        alt: 'We chase up all overdue payments for you'
    },
    {
        id: '66365bc7e70ac51006d4d857',
        alt: 'Everyone pays for their own place on the stag do'
    },
    {
        id: '66365be9e70ac51006d4d862',
        alt: 'We chase up all overdue payments for you'
    }
];
</script>

<style lang="scss">
.media-gallery {
    &.grid-view {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    .images.thumbnail {
        width: 290px;
        height: 145px;
    }
}
</style>
