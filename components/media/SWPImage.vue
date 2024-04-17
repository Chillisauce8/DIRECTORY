<template>
  <img ref="imgElement" :src="preparedSrc()" :alt="alt" :loading="loading">
</template>

<script setup lang="ts">
import {computed, ref, toRefs, watch} from 'vue';
import {
  getTransformationPartFromCloudinaryURL,
  isSrcToCloudinary,
  parseTransformationUrl, prepareTransformationsUrl
} from '~/services/helpers/media/cloudinary';

interface SWPImageProps {
  src: string;
  alt?: string;
  width?: number,
  height?: number,
  transformToElementSize?: boolean;
  loading?: string;
  preloadRandom?: boolean;
}


const props = defineProps<SWPImageProps>();

const imgElement = ref<HTMLElement>(null);

const {src, alt} = toRefs(props);

function addSizeToImageSrcIfNeed(src: string, fixedWidth?: number, fixedHeight?: number) {
  const transformationPartFromURL = getTransformationPartFromCloudinaryURL(src);

  const transformations = transformationPartFromURL ?
    parseTransformationUrl(transformationPartFromURL) : {};

  if (isFinite(transformations.width)) {
    return src;
  }

  if (isFinite(transformations.height)) {
    return src;
  }

  if (fixedWidth || fixedHeight) {
    transformations.width = fixedWidth;
    transformations.height = fixedHeight;
  } else {
    const { clientWidth: width, clientHeight: height } = imgElement?.value;
    transformations.width = width;
    transformations.height = height;
  }

  const updatedTransformations = prepareTransformationsUrl(transformations);

  if (transformationPartFromURL) {
    return src.replace(transformationPartFromURL, updatedTransformations);
  } else {
    const urlParts = src.split('/');

    urlParts.splice(urlParts.length - 1, 0, updatedTransformations);

    return urlParts.join('/');
  }
}

function preparedSrc() {
  // const {src = '', transformToElementSize = true,
  //   width: fixedWidth , height: fixedHeight} = props;

  if (!props.src) {
    return '';
  }

  if (props.width || props.height) {
    return addSizeToImageSrcIfNeed(props.src, props.width, props.height);
  }

  if (props.transformToElementSize !== true) {
    return props.src;
  }

  if (!imgElement?.value) {
    return props.src;
  }

  if (!isSrcToCloudinary(props.src)) {
    return props.src;
  }

  return addSizeToImageSrcIfNeed(props.src);
}


if (props.preloadRandom && process.server) {
  const links = [{
      rel: 'preload',
      as: 'image',
      href: preparedSrc(),
    }];

  useHead({
    link: links
  });
}

</script>

<style>

</style>
