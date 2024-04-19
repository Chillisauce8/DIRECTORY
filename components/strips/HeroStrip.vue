<template>
  <section-wrapper title="Be a Legend">
    <div class="hero-strip Split Copy W2">
      <div class="stress-list wrapper">
        <div class="sticky">
          <h1>Aspirin for {{ eventType }} headaches</h1>
          <ul>
            <li v-for="(listItem, index) in list[version]" :key="index">
            {{ listItem.item }}
            </li>
          </ul>
          <ImageWrapper
              class="image-left"
              :cloudinaryId="imageLeft"
              :width="400"
        
              alt="Orgainsier Getting Frustrated"
          />
        </div>
      </div>

      <div class="solution wrapper">
        <div class="sticky">
          <h1>You take all the credit</h1>

          <ImageWrapper
              class="image-right"
              :cloudinaryId="imageRight"
              :width="400"
              alt="You take all the credit"
          />
        </div>
      </div>
    </div>
  </section-wrapper>
</template>

<script>
export default {
  props:{
  eventType: {
      type: String,
      default: () => "Event",
    },
    imageLeft: {
      type: String,
      default: () => "652d2389de74af0f8b40302f",
    },
    imageRight: {
      type: String,
      default: () => "652d209d7d17660f8944807b",
    },
    version:{
      type: String,
      default: () => "default",
    },
  },
  data() {
    return {
      list:{
        default:[
          {
            item: "How do I get money off people?",
          },
          {
            item: "Will the activities be good?",
          },
          {
            item: "Will we get into nightclubs?",
          },
          {
            item: "Who's coming or not?",
          },
          {
            item: "Will I end up out of pocket?",
          }
        ],
        corporate:[
          {
            item: "Will all the staff enjoy it?",
          },
          {
            item: "Will the activities be good?",
          },
          {
            item: "Will we get value for money",
          },
          {
            item: "What happens if.......",
          },
          {
            item: "Will the managers think its good value?",
          }
        ]
      }
      

    }
  },
  }
</script>

<style lang="scss">
.hero-strip {
  & .stress-list {
    & ul {
      border-left: 3px solid $C1;
      padding-left: 20px;
      margin-bottom: 40px;
    }
    & li {
      //      margin-bottom: 10px;
      letter-spacing: 2px;
      @include font-size(1);
    }
  }
  & .image-left figure {
    @include aspect-ratio(3, 2);
    background-image: linear-gradient(#2193b0, #6dd5ed);
  }

  & .image-right figure {
    @include aspect-ratio(1, 1);
    background-image: linear-gradient(#2193b0, #6dd5ed);
  }
}
</style>
