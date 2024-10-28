<template>
  <section-wrapper class="marketing-timeline X-Center Copy CB-05"
                   :title="title[version]">
    
      <section v-for="timeline in timelines[version]" class="marketing-timeline-entry Column-Row" :key="timeline.title">
    <div class="timeline Center">
      <div class="circle-container Center">
        <div class="number circle Center"></div>
      </div>
      <div class="dotted-line"></div>
    </div>
    <ImageWrapper class="marketing-image" :images="timeline.images" :width="500" />
    <div class="copy">
      <h1>{{ timeline.title }}</h1>

      {{ timeline.copy }}
    </div>
  </section>
   
  </section-wrapper>
</template>

<script>
export default {
props:{
  eventType: {
      type: String,
      default: () => "Event",
    },
    version: {
      type: String,
      default: () => "default",
    },
    
  },
  data: function () {
    return {
      title:{
        default: "How it Works",
        corporate: "How We Help"
      },
      timelines: {
        default: [
        {
          title: 'Browse Thousands of Products Online',
          copy: "We have 1000's of " + this.eventType + ' ideas and activities to choose from. All our products are individually tested by our ' + this.eventType + ' experts, before going on our website. Then every person doing our products are asked to review them - giving you thousands of independant reviews from people just like you.',
          images: [
            {
              cloudinaryId: '656b60f625c30f0fa1d9c678',
           
              alt: 'Browse Thousands of Products Online',
            },
          ],
        },
        {
          title: 'Build your own ' + this.eventType,
          copy: 'Browse products and ideas that take your fancy and build them into full intineraries. Make as many itineraries as you want and get prices when you need. All our staff are only a call away from helping you build the perfect ' + this.eventType,
          images: [
            {
              cloudinaryId: '6526a9491d27f60f95734b97',
              alt: 'Personalised ' + this.eventType + ' Planner',
            },
          ],
        },
        {
          title: 'Manage Your Whole ' + this.eventType + ' Online',
          copy: 'At Chillisauce we make everything available to you, so you can organise and manage your whole ' + this.eventType + ' online. You can manage which guests are on which events, swap activities, add new items, see who has paid what and when, what paymeents are due next - everything you could possibly need to make sure you have a perfect' + this.eventType,
          images: [
            {
              cloudinaryId: '656b621b17d0f00f83c3273f',
              alt: 'Manage all aspects of your event online',
            },
          ],
        },

        {
          title: 'Personal ' + this.eventType + ' Manager',
          copy: 'As soon as you contact us we will assign you a personal event manager. All our event managers have loads of experience and will be there every step of the way to ensure you have a fantastic ' + this.eventType,
          images: [
            {
              cloudinaryId: '656b61d917d0f00f83c32736',
              alt: 'Personalised ' + this.eventType + ' Planner',
            },
          ],
        },
        {
          title: 'Send Invites to Your Group via WhatsApp or Email',
          copy: 'Our online system makes it easy to send invites to your ' + this.eventType + ' guests, and allow them to fill in all their details, saving you ages of manually typing in everyones details! Login via desktop, phone or tablet.',
          images: [
            {
              cloudinaryId: '651451c3f686e70f86466e6c',
              alt: 'Send Invites via WhatsApp',
            },
          ],
        },
        {
          title: 'Manage & Check All Payments Online',
          copy: 'Manage your deposit and balance payments or choose to pay on behalf of others on the ' + this.eventType + '. Keep track of who hasnt paid, how much is left to pay and who has paid what and when.',
          images: [
            {
              cloudinaryId: '657333dab7867c10011f908f',
              alt: 'Manage all your payments in our online system',
            },
          ],
        },

        {
          title: 'Check Your ' + this.eventType + ' Itinerary',
          copy: 'Your Itinerary is updated through the booking process, to give you all the information you need to get to your ' + this.eventType + ', with emergency numbers, location maps, times and who is doing what. Everything is at you fingetips so you are in complete control on your event',
          images: [
            {
              cloudinaryId:  '656b617217d0f00f83c32730',
              alt: 'Check your ' + this.eventType + ' itinerary wherever you are',
            },
          ],
        },
      ],
      corporate:[
      {
          title: 'Help promote staff morale and productivity',
          copy: "✓ Encourage engagement ✓Build a constructive environment ✓ Break down barriers to communication ✓ Promote positive relationships between staff ✓ Reward staff for a job well done ✓ Aid on-boarding",
          images: [
            {
              cloudinaryId: '35cb011eeff248d84948',
           
              alt: 'Promoate staff and morale',
            },
          ],
        },
      {
          title: 'Easily find the perfect venue',
          copy: "We’ll help you find the right setting, whatever the occasion. We work with 1000s of inspiring venues across the UK and Europe, so we’ll secure you the best rates and ensure you pick the perfect place for your work event.",
          images: [
            {
              cloudinaryId: '62395dff4232059d65f4',
           
              alt: 'Choose from 1000s of perfect venues',
            },
          ],
        },
        {
          title: "Unique Ideas",
          copy: "Every corporate and team building event is different and special. Every event and corporate itinerary has its own distinct audience, tone, personality and set of business objectives. Our specialist events team will creating your perfect event from beginning to end, building lasting memories and achieving your business goals.",
          images: [
            {
              cloudinaryId: 'a57c768286e7a5ebcccf',
              alt: 'Personalised ' + this.eventType + ' Planner',
            },
          ],
        },
        {
          title: "100's of Virtual Events.",
          copy:"It takes extra creativity and engaging activities to build a strong team virtually, so we offer a number of interactive games, workshops and conference software designed to motivate, engage, inspire and excite." ,
          images: [
            {
              cloudinaryId: '5e99be6fde6f111ba36c95e5',
              alt: 'Hundreds of virtual events to choose from',
            },
          ],
        },

      ]
      }
    }
  },
}
</script>

<style lang="scss">
.marketing-timeline {
  margin: 0 auto;
  counter-reset: number; // For incrementing the number on the child elements
  & .marketing-timeline-entry {
    margin: 0 auto;
    &:nth-child(odd) {
      @include desktop() {
        flex-direction: row-reverse;
      }
    }
    & .marketing-image {
      margin: 10px;
    }

    & .copy,
    & .images {
      @include desktop() {
        padding-top: 80px;
      }
    }
    & .images {
      @include mobile() {
        padding: 40px 0;
      }

      @include aspect-ratio(3, 2);
      order: 1;
      @include mobile() {
        order: 3;
      }
      width: clamp(300px, 90vw, 500px);
    }
    & .copy {
      order: 3;
      @include mobile() {
        order: 2;
      }
      margin: 10px;
      width: clamp(300px, 90vw, 500px);
      @include mobile() {
        text-align: center;
      }
      & > h1 {
        font-size: 28px;
        margin-bottom: 20px;
      }
    }
    & .timeline {
      order: 2;
      @include mobile() {
        order: 1;
      }
      width: 100px;
      position: relative;
      min-height: 100px;
      //   background-color: pink;
      & .dotted-line {
        height: 100%;
        border-left: 2px dashed $CB-3;
      }
      & .circle-container {
        height: 75px;
        width: 100%;
        // background-color: $CB;
        @include overlay();
        & .number {
          font-family: $ff2;
          font-size: 20px;
          color: white;
          text-align: center;
          background-color: $C1;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          line-height: 1;
          &:after {
            counter-increment: number;
            content: counter(number);
          }
        }
      }
    }
  }
}

</style>
