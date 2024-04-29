<template>
  <template v-if="showItem">
    <template v-if="item.text">
      <ContentText>
        <Markdown :data="item.text" :isCustomSanitizing="true"></Markdown>
      </ContentText>
    </template>

    <template v-if="item.break">
      <ContentBreak :title="item.break.title" :text="item.break.text">
      </ContentBreak>
    </template>

    <template v-if="item.image && item.image.length === 1">
<!--        <ImageWrapper :cloudinaryId="item?.image[0]?.image?.id"-->
<!--                      :alt="item.image[0].image.description"-->
<!--                      :width="500" :height="300"/>-->
<!--        <ImageTextBlock :blockText="item.image[0].text"></ImageTextBlock>-->

      <MediaCarousel class="carousel" :mediaData="[{id: item?.image[0]?.image?.id, alt: item.image[0].text}]">
      </MediaCarousel>

      <div class="content relative"></div>
    </template>

    <template v-if="item.image && item.image.length > 1">
        <MediaCarousel class="carousel" :mediaData="item.image.map(itemImage => ({id: itemImage.image.id, alt: itemImage.image.description}))">
        </MediaCarousel>
<!--        <ImageWrapper :images="item.image.map(itemImage => ({cloudinaryId: itemImage.image.id, alt: itemImage.image.description}))"-->
<!--                      :width="500" :height="300" class="image-grid"/>-->
    </template>

    <template v-if="item.splitBox">
      <SplitBox :content="item.splitBox"></SplitBox>
    </template>

    <template v-if="item.overlayBox">
      <SplitBox :content="item.overlayBox"></SplitBox>
    </template>

    <template v-if="item.venueList && item.venueList.venues && item.venueList.venues.length">
      <SplitBox v-for="venueItem in item.venueList.venues" :content="venueItem"></SplitBox>
    </template>

  </template>
</template>

<script setup lang="ts">
  import { useCurrentSection } from '~/service/helpers/current-section.factory';
  import { useContentHelper } from '~/service/helpers/content/content-helper.service.factory';

  interface PostContentItemProps {
    item: any;
    ignoreSection?: boolean;
  }

  const currentSection = useCurrentSection();
  const contentHelper = useContentHelper();


  const {item, ignoreSection} = defineProps<PostContentItemProps>();

  const showItem: boolean = showItemComponent(item);
  const showHideItem: boolean = showItem ? false : showHideComponent(item);

  function showItemComponent(item: any): boolean {
    if (!item || Array.isArray(item) || !contentHelper.showContentItem(item)) {
      return false;
    }

    return !!((item.text) ||
        (item.image && item.image.length) ||
        (item.video && item.video.length) ||
        (item.break && (item.break.title || item.break.text)) ||
        (item.splitBox && (item.splitBox.title || item.splitBox.text ||
            (item.splitBox.image && item.splitBox.image.length))) ||
        (item.overlayBox && (item.overlayBox.title || item.overlayBox.text ||
            (item.overlayBox.image && item.overlayBox.image.length))) ||
        (item.venueList && item.venueList.venues && item.venueList.venues.length) ||
        (item.table && item.table.text) ||
        (item.customContent && item.customContent.length));
  }

  function showHideComponent(item: any): boolean {
    return item && Array.isArray(item) && item.length > 0 && item[0].hideStart;
  }

</script>

<style scoped>

</style>
