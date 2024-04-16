<template>
    <HeroHeader v-if=heroHeaderProps :props="heroHeaderProps"></HeroHeader>
</template>

<script lang="ts">
import { useDataTemplateFabricService } from "~/services/helpers/data-templates/data-template-fabric.factory";
import { DataTemplate } from "~/services/models/dataTemplate";
import { useDataTemplatesStore } from "~/store/dataTemplates";

export default {
  name: "DefaultPage",
  props: ['title'],

  setup(props: any) {
    const dataTemplatesStore = useDataTemplatesStore();
    const dataTemplateFabric = useDataTemplateFabricService();

    let imageId;
    let imageDescription;

    let heroHeaderProps = ref(null);

    useAsyncData(async () => {
      await dataTemplatesStore.fetch({templateName: 'home'});

      const dataTemplate: DataTemplate = dataTemplateFabric.get({name: 'home'});

      imageId = dataTemplate?.getImage('home.introImage');
      imageDescription = dataTemplate?.getImageDescription('home.introImage');

      heroHeaderProps.value = {
        title: props.title,
        subTitle: '',
        type: 'barText',
        images: [{
          src: `https://media.chillisauce.com/image/upload/e_grayscale/w_1000,f_auto,q_auto/${imageId}`,
          alt: imageDescription
        }],
      }
    });

    return {
      heroHeaderProps,
    }
  }
};
</script>

<style scoped>

</style>
