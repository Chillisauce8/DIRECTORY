<template>
  <card-wrapper class="package-card" :selectable="true" :selected="selected">
    <image-wrapper :cloudinaryId="locationImageId" class="top-image random-tint"
                   :width="defaultWidth" :height="defaultHeight" :tint="true">
      <div class="number"> {{ packageIndex + 1 }} </div>
      <SvgIcon v-if="isWebPackage" svg="medal-1" class="medal" :class="cardMedal"></SvgIcon>
      <div class="content">
        <div class="location"> {{cardName}} </div>
        <div class="nights">{{nightsCount}} Night{{nightsCount > 1 ? 's' : ''}}</div>
      
<!--        <div class="notes" v-if="isWebPackage">-->
<!--          A good base package to start building up a bigger packages-->
<!--        </div>-->
      </div>
    </image-wrapper>

    <LazyAPackage
      :display="isWebPackage ? 'web-package-card' : 'package-card'"
      displayClass="package-card"
      :usePackageData="useCurrent ? null : eventPackage"
      :useCurrent="useCurrent"
      :isWebPackage="isWebPackage"
      :isCustomerArea="true"
    />
  </card-wrapper>
</template>

<script>


import {useSelectMediaHelper} from "~/services/helpers/select-media-helper.factory";
import {useCurrentSection} from "~/services/helpers/current-section.factory";

export default {
  props: ['eventPackage', 'selected', 'useCurrent', 'packageIndex', 'isWebPackage'],
  setup() {
    return {
      selectMediaHelper: useSelectMediaHelper(),
      currentSection: useCurrentSection(),
    };
  },
  computed: {
    cardName() {
      // return this.isWebPackage ? this.eventPackage.eventName : this.eventPackage.getLocation()?.name;
      return this.eventPackage.getLocation()?.name;
    },
    cardMedal() {
      return this.isWebPackage ? this.eventPackage.medal : null;
    },
    nightsCount() {
      return this.eventPackage ? this.eventPackage.getDaysCount() - 1 : 0;
    }
  },
  data() {
    const location = this.eventPackage.getLocation();
    const imageItem = this.selectMediaHelper.getOneImageBySection(
      location?.imageList, this.currentSection.get());

    return {
      defaultWidth: 290,
      defaultHeight: 290,
      locationImageId: imageItem?.image.id,
    };
  },
}
</script>

<style lang="scss">
body {
  counter-reset: package-counter;
}
.package-card {
  &:not(.package-card.package-product-card){
    width: 300px;
  }
  
  :hover {
    cursor: pointer;
  }
  & .section-content {
    padding: 0; // This removes default padding around sections that give to much space on a package card.
  }
  & .package-product-card {
    margin: 2px 0;
  }

  & .top-image  {
    font-size:18px;
    text-transform: uppercase;
   
    & figure {
      @include aspect-ratio(3, 1);
      margin-top: 0;
      width: 100%;
    }
    & .medal{
      position:absolute;
      right: 0;
      top: -10px;
      width: 56px;
      height: 56px;
      
      svg{
        stroke:black;
      }
      .strap{
        fill: $C1;
      }
      &.Gold .circle{
          fill: #FFD700;
      }
      &.Silver .circle{
          fill: #C0C0C0;
      }
      &.Bronze .circle{
          fill: #CD7F32;
      }
     }
    & .content{
      text-align: center;
      padding: 2px;
      & .location {
      font-family: $ff2;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 5px;
    }
    & .nights{
      font-size: 14px;
      font-weight: 700;
   //   letter-spacing: 5px;
    }
    & .medal-color{
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 5px;
    }
     & .notes{
      font-size: 12px;
     }


    }
    & .number {
      &::before {
        //counter-increment: package-counter;
        //content: counter(package-counter);
      }

      border-radius: 3px;
      font-size: 16px;
      width: 24px;
      height: 24px;
      text-align: center;
      background: $C1;
      position: absolute;
      top: -7px;
      left: -7px;
      font-family: $ff2;
    }
  }
  & .package-date {
    font-family: $ff2;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-size: 12px;
    text-align: center;
    margin: 0.5em;
  }
  & .package-product-card {
  & .visible-area{
    display:flex;
  }
    & .images {
      width: 20%;
      @include aspect-ratio(3, 2);
    }
    & header {
      position: relative;
      width: 75%;
      margin-left: 5%;
      & h1 {
        font-family: $ff1;
        font-size: 12px;

       text-transform: uppercase;
      }
    }
    & .label {
      display: none;
    }
    &:hover {
      box-shadow: none;
    }
  }
  & .itinerary {
    & > *:not(:last-child) {
      margin-bottom: 2%;
    }
  }
}
</style>
