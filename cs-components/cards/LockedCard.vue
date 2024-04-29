<template>
  <card-wrapper class="locked-card custom-card">
    <ImageWrapper cloudinaryId="65537670f768b70f95b1d60c" :width="290"/>
    <card-text-wrapper>
      <h1>Tooooo Spicy for Public View</h1>
      <div class="copy">
        To view these products you will need to submit an enquiry or create an event.
      </div>
      <ButtonMain @click.native="showEnquiryDialog">Submit Enquiry to View</ButtonMain>
    </card-text-wrapper>
  </card-wrapper>
</template>

<script>


import {useEnquiryFormDialogShowService} from "~/service/dialog/enquiry-form-dialog-show.service";

export default {
  props: ['props'],
  setup() {
    return {
      enquiryFormDialogShowService: useEnquiryFormDialogShowService(),
    }
  },
  methods: {
    showEnquiryDialog() {
      this.enquiryFormDialogShowService.show({});
    }
  }
}
</script>

<style lang="scss">
.locked-card {
    @include desktop{
        display: flex;
        flex-direction: row;
        width: 800px;
        .images{
            width:400px;
        }
    }
    @include mobile{

        width: clamp(300px, 95%, 500px)
    }
  & figure {
    @include aspect-ratio(1, 1);
  }
  & header {
    @include desktop{
        width: 400px;
        padding: 40px;
    }
    text-align: center;
    & h1 {
      margin: 40px 0;
      font-size: 18px;
    }
    & .copy {
     margin: 40px 0;
      font-size: 16px;
    }
  }

}
</style>
