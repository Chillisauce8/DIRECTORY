<template>
  Gallery

  <Galleria :value="images"
            :numVisible="5"
            containerStyle="max-width: 640px">
    <template #item="slotProps">
      <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="width: 100%" />
    </template>
    <template #thumbnail="slotProps">
      <img :src="slotProps.item.thumbnailImageSrc" :alt="slotProps.item.alt" />
    </template>
  </Galleria>

</template>

<script setup lang="ts">
import Galleria from 'primevue/galleria';


const images = [{
  itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/650c2d0dc541fd0f83d2f3a3',
  thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_50,h_50/650c2d0dc541fd0f83d2f3a3',
  alt: 'Pick and mix items for your stag do'
}, {
  itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/63ebe754da9fa50fd75e77b3',
  thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_50,h_50/63ebe754da9fa50fd75e77b3',
  alt: 'Reserve your favourite stag do ideas'
}, {
  itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/918e1fc761207ff1f9d7',
  thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_50,h_50/918e1fc761207ff1f9d7',
  alt: 'Make payments for your stag weekend individually'
}, {
  itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/63ee65c7f0357c0fa8463ac0',
  thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_50,h_50/63ee65c7f0357c0fa8463ac0',
  alt: 'Manage everything about your stag do online'
}, {
  itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/654519aab472c80f8dc32660',
  thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_50,h_50/654519aab472c80f8dc32660',
  alt: 'Everyone pays for their own place on the stag do'
}, {
  itemImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_300,h_300/6545195807e1e20f8ebb15bf',
  thumbnailImageSrc: 'https://media.chillisauce.com/image/upload/c_fill,q_auto,f_auto,dpr_2,w_50,h_50/6545195807e1e20f8ebb15bf',
  alt: 'We chase up all overdue payments for you'
}];
// const responsiveOptions = [{}, {}];

</script>
