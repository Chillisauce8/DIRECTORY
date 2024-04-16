<script setup lang="ts">
import {useUILockerSVGStore} from '~/store/uiLockerSVG';


const uiLockerSVGStore = useUILockerSVGStore();

const svgElement = ref<HTMLElement>(null);


async function getOrFetchLockerSVG(): Promise<string> {
  if (!uiLockerSVGStore.svg) {
    await uiLockerSVGStore.fetch();
  }

  return uiLockerSVGStore.svg;
}


onMounted(async () => {
  const elementHTML = await getOrFetchLockerSVG();

  if (!svgElement?.value) {
    return;
  }

  svgElement.value.outerHTML = elementHTML;
});
</script>

<template>
  <svg ref="svgElement"></svg>
</template>

<style lang="scss">

</style>