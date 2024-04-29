<template>
    <section-wrapper v-if="vm?.content" class="split-box">
      <div class="Split Alternate W5 random" :class="[vm.style,  display]">
        <div class="image-box">
          <ImageWrapper v-if="vm.content?.image?.[0]" :cloudinary-id="vm.content?.image?.[0]?.image.id"
                        :width="600"/>
        </div>
        <div class="text-box">
          <div class="Copy">
            <h2 v-if="vm.content.title" >{{ vm.content.title }}</h2>
            <Markdown v-if="vm.content.text" :data="vm.content.text"></Markdown>
          </div>
        </div>
      </div>
    </section-wrapper>
</template>

<script setup lang="ts">
import {useCurrentSection} from '~/service/helpers/current-section.factory';

interface SplitBoxContentImage {
  id: string;
}


interface SplitBoxContentImageItem {
  image: SplitBoxContentImage;
  section?: string[];
}


interface SplitBoxContent {
  title: string;
  text: string;
  description?: string;
  image?: SplitBoxContentImageItem[];
  imageList?: SplitBoxContentImageItem[];
  website?: string;
}


interface SplitBoxProps {
  content: SplitBoxContent;
  display?:  string;
}

const currentSection = useCurrentSection();
const props = defineProps<SplitBoxProps>();



const vm = reactive<{content: SplitBoxContent; style: string}>({
  content: null,
  style: 'style-' + Math.ceil(Math.random() * 9),
});


function init(): void {
  if (!props.content) {
    return;
  }

  vm.content = prepareContent(props.content);
}


function filterContentImageListIfNeeded(imageList: SplitBoxContentImageItem[]): SplitBoxContentImageItem[] {
  if (!imageList?.length) {
    return;
  }

  if (currentSection.get() === 'any') {
    return imageList ?? [];
  }

  return imageList.filter(i => {
    if (!i.section?.length) {
      return true;
    }

    return i.section.includes(currentSection.get());
  });
}


function prepareContent(originalContent: SplitBoxContent): SplitBoxContent {
  const content = {...originalContent};

  content.image = filterContentImageListIfNeeded(content.image || content.imageList);

  if (!content.text && content.description) {
    content.text = content.description;
  }

  if (content.website) {
    if (content.text) {
      content.text += '\n';
    }

    content.text += '#### [Website](' + content.website + ')';
  }

  return content;
}


watch(() => props.content, () => init(), {deep: true});


init();

</script>
