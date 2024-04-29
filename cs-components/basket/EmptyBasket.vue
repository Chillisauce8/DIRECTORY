<template>
    <div class="empty-basket" @click="basketStore.toggle()">
      <div class="message">
        <h1>Your {{ currentSection.getLongName() }} Package is Empty!</h1>
        <div class="text">
          Go and find some awesome activities and create your own {{ currentSection.getLongName() }}!
        </div>
      </div>

      <ImageWrapper
        class="box"
        :width="300"
        loading="eager"
        :random="true"
        :max="1"
        :images="basketImages"
        alt=""
      />
    </div>
</template>

<script>
import {useBasketStore} from "~/store/basket";
import {useCurrentSection} from '~/service/helpers/current-section.factory';

export default {
  setup() {
    const currentSection = useCurrentSection();
    return {
      basketStore: useBasketStore(),
      currentSection,
    }
  },
  data() {
    return {
      basketImages: [
        {
          cloudinaryId: "65453101c302c20f898ff9ce",
        },

      ],
    };
  },
};
</script>

<style lang="scss">
.empty-basket {
  cursor: pointer;
  width: 90%;
  height: 90%;
  margin: 0 auto;
  background: transparent;
  & .message {
    margin: 50px 0;
    padding: 30px;
   // border-radius: 10px;
    color: white;
    //background: rgba(white, $alpha: 1.9);
    & h1{
      text-align: center;
      font-family: $ff2;
      margin-bottom: 20px;
    }
    & .text {
      font-size: 16px;
    }
  }

  & .box {
    width: 100%;
 @include aspect-ratio(1,1);
  }
}
</style>
