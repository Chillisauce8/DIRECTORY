<template>
  <section class="splash">
    <section class="information">
      <TheLogo :width="275" />
      <div class="message">{{ title ?? 'Event Organising Made Simple' }}</div>
      <button-main class="home-main-button" v-show="!dataState.isSignedIn" @click.native="showSignInDialog">
        Login
      </button-main>
      <client-only>
        <button-main class="home-main-button" v-if="dataState.isSignedIn" @click.native="navigateHome">
          {{ getNavigateHomeButtonLabel() }}
        </button-main>
      </client-only>
    </section>

    <section class="sections">
      <nuxt-link to="/hen" class="section hen">
        <image-wrapper :width="defaultWidth" :height="defaultHeight" loading="eager"
          cloudinaryId="6547bbb7a3cc100f92a91d52"
          alt="Hen Do Ideas"
        >
          <div class="title">Hen Parties</div>
        </image-wrapper>
      </nuxt-link>
      <nuxt-link to="/stag" class="section stag">
        <image-wrapper :width="defaultWidth" :height="defaultHeight" loading="eager"
          cloudinaryId="6547c7d878cc730f852beb59"
          alt="Stag Do Ideas"
        >
          <div class="title">Stag Weekends</div>
        </image-wrapper>
      </nuxt-link>
      <nuxt-link to="/groups" class="section activity">
        <image-wrapper :width="defaultWidth" :height="defaultHeight" loading="eager"
          cloudinaryId="6547c9ca78cc730f852bec49"
          alt="Activity Weekends"
        >
          <div class="title">Activity Weekends</div>
        </image-wrapper>
      </nuxt-link>
      <nuxt-link to="/events" class="section corporate">
        <image-wrapper :width="defaultWidth" :height="defaultHeight" loading="eager"
          cloudinaryId="6547c6eaa3cc100f92a927cd"
          alt="Corporate Events"
        >
          <div class="title">Corporate Events</div>
        </image-wrapper>
      </nuxt-link>
    </section>
  </section>
</template>

<script setup lang="ts">
import {useSignInDialogShowService} from '~/services/dialog/auth/sign-in-dialog-show.service';
import {onUnmounted, reactive} from 'vue';
import { useCurrentUser } from '~/services/helpers/user-common/current-user.factory';
import { useMessageService } from '~/services/helpers/message.factory';
import { useGlobalElementsTemplateService } from '~/services/helpers/data-templates/global-elements-template.factory';
import { useCurrentEvent } from '~/services/helpers/event/current-event.service.factory';
import {useCurrentUserStore} from '~/store/currentUser';
import {useCustomerEventsStore} from '~/store/customerEvents';
import { eventEmitterFilter, eventEmitterObsFirstValueFrom } from "~/services/models/event-emitter-observable-helpers";
import {getWindowSafe} from '~/services/helpers/browser/browser.helpers';
import {useDataTemplateFabricService} from '~/services/helpers/data-templates/data-template-fabric.factory';
import {useDataTemplatesStore} from '~/store/dataTemplates';
import {useDefaultPageUrlGetterService} from '~/services/helpers/default-page-url-getter.factory';
import { useRelCanonicalHelperService } from '~/services/helpers/browser/rel-canonical-helper.service.factory';
import { CurrentEventInitStates } from '~/services/helpers/event/current-event.service';
import { useCurrentPageHeadService } from '~/services/helpers/current-page-head.service.factory';


interface SplashPageProps {
  title?: string;
}

const signInDialogShowService = useSignInDialogShowService();
const currentUser = useCurrentUser();
const currentEvent = useCurrentEvent();
const messageService = useMessageService();
const globalElementsTemplateService = useGlobalElementsTemplateService();
const currentUserStore = useCurrentUserStore();
const customerEventsStore = useCustomerEventsStore();
const defaultPageUrlGetterService = useDefaultPageUrlGetterService();
const currentPageHeadService = useCurrentPageHeadService();
const route = useRoute();


const props = defineProps<SplashPageProps>();
const dataTemplatesStore = useDataTemplatesStore();
const dataTemplateFabric = useDataTemplateFabricService();
const relCanonicalHelperService = useRelCanonicalHelperService();

const defaultWidth = 307;
const defaultHeight = 307

const dataState = reactive<any>({
  isSignedIn: !!currentUserStore.user,
  homePageTemplate: null,
});


await dataTemplatesStore.fetch({templateName: 'home'});


dataState.homePageTemplate = dataTemplateFabric.get({name: 'home'});


const unsubscribe = currentUserStore.$onAction(({name, after}) => {
  if (!['set', 'reset'].includes(name)) {
    return;
  }

  after(() => dataState.isSignedIn = !!currentUserStore.user);
});

onUnmounted(() => {
  unsubscribe();
});


async function showSignInDialog(): Promise<void> {
  await signInDialogShowService.show({closeOnNavigation: false});
}


async function navigateHome() {
  const window = getWindowSafe();

  if (currentUser.isStaffOrHiddenStaff()) {
    const url = await defaultPageUrlGetterService.getDefaultStaffAreaPageUrl();

    return window.open(url, '_self');
  } else if (currentUser.isSupplierContact()) {
    const url = await defaultPageUrlGetterService.getDefaultSupplierAreaPageUrl();

    return window.open(url, '_self');
  } else if (currentUser.isCustomer()) {
    goToCustomerArea();
  }
}


function getNavigateHomeButtonLabel() {
  const defaultTitle = 'Go to Home page';

  if (!dataState?.homePageTemplate) {
    return '';
  }

  return dataState?.homePageTemplate?.getValue('home.loginButtonLabel') ?? defaultTitle;
}


function goToCustomerArea() {
  if (currentEvent.has() && (currentEvent.isOrganiser() || currentEvent.isGuest())) {
    return currentEvent.goToCurrentEvent();
  }

  const firstEvent = customerEventsStore?.events?.[0];

  if (!firstEvent) {
    const message = globalElementsTemplateService.getMessageFromDictionaryVariables('noEventsLabel');
    messageService.showErrorMessage(message);
    return;
  }

  eventEmitterObsFirstValueFrom(currentEvent.currentEventInitDone()
    .pipe(eventEmitterFilter(value => value !== CurrentEventInitStates.no &&
        value !== CurrentEventInitStates.started)))
    .then(() => {
      currentEvent.goToCurrentEvent();
    });

  currentEvent.load(firstEvent._doc);
}

</script>

<style lang="scss">
$image-size-desktop: 40vh;
$title-size-desktop: 38vh;

$image-size-mobile: 40vw;
$title-size-mobile: 38vw;

.splash {
  background-color: white;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  @include mobile {
    flex-direction: column;
  }
  & .information {
    display: flex;
    flex-direction: column;
    justify-content: center;
    & .message {
      font-family: $ff2;
      font-size: 18px;
      text-align: center;
      margin: 20px 0 30px 0;
      //       text-transform: uppercase;
    }
  
  }

  & .sections {
   // transform: rotate(-180deg);
    @include desktop {
      width: $image-size-desktop * 2;
      height: $image-size-desktop * 2;
    }
    @include mobile {
      width: $image-size-mobile * 2;
      height: $image-size-mobile * 2;
    }
    display: grid;
    grid-gap: 15px;
    @include mobile {
      grid-gap: 10px;
    }

  //  animation: spin-round 0.5s ease 0.7s forwards;
    grid-template-rows: 1fr, 1fr;
    grid-template-columns: 1fr, 1fr;
    grid-template-areas:
      'hen stag'
      'activity corporate';
    & .title {
      color: white;
      font-family: $ff2;
      text-transform: uppercase;
      text-align: center;
      text-shadow: 2px 2px black;

      @include desktop {
        width: $title-size-desktop;
        font-size: 16px;
        letter-spacing: 4px;
        height: 24px;
      }
      @include mobile {
        width: $title-size-mobile;
        letter-spacing: 0px;
        font-size: 12px;
        height: 22px;
      }
    }
    & .section {
      box-shadow: 10px 10px 30px $CB-1;
      cursor: pointer;
      filter: grayscale(1);

      animation: enter-in-sections 0.5s ease forwards, get-color 0.5s ease 0.5s forwards;

      &.stag{
        background-image: linear-gradient(to top,  rgba(0,255,205,.8) 0%,  rgba(2,161,124,1) 100%);
       
      }
      &.hen{
        background-image: linear-gradient( to right,  rgba(226,24,24,.8) 0%, rgba(160,6,6,1) 90% );
       
      }
      &.activity{
        background: linear-gradient(to top, rgba(4,171,191,0.8) 0%, rgba(0,74,83,1) 100%);
       
       
      }
      &.corporate{

       
        background-image: linear-gradient(90deg, rgba(189,195,199,1) 0%, rgba(44,62,80,1) 100%);
      }


      &:hover {
        transition: filter 1.5s ease;
        filter: brightness(120%);
      }
      & .images {
        @include aspect-ratio(1, 1);

      }

      &.hen {
        grid-area: hen;
        transform: translate(-50vh, -50vh);
        animation-delay: 0s;
   //     animation: enter-in-sections 0.5s 0.1s ease forwards, get-color 4s  ease forwards;
        & .title {
          margin: auto auto 10px auto;
        }
      }
      &.hen,
      &.hen img {
        border-top-left-radius: 100%;
      }
      &.stag {
        grid-area: stag;
        transform: translate(50vh, -50vh);
       animation-delay: 0.1s;
      //  animation: enter-in-sections 0.5s 0.3s ease forwards, get-color .2s 2.5s ease forwards;;

        & .title {
          margin: auto auto 10px auto;
        }
      }
      &.corporate {
        grid-area: corporate;

        transform: translate(50vh, 50vh);
       animation-delay: 0.2s;
  //      animation: enter-in-sections 0.5s 0.6s ease forwards, get-color .2s 2.3s ease forwards;;
        & .title {
          margin: 10px auto auto auto;
        }
      }
      &.corporate,
      &.corporate img {
        border-bottom-right-radius: 100%;
      }
      &.activity {
        grid-area: activity;
        transform: translate(-50vh, 50vh);
        animation-delay: 0.3s;
//        animation: enter-in-sections 0.5s 0.9s ease forwards, get-color .2s 2.1s ease forwards;;

        & .title {
          margin: 10px auto auto auto;
        }
      }
      &.activity,
      &.activity img {
        border-bottom-left-radius: 100%;
      }
    }
  }
}
/*
@keyframes enter-in-sections {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
}
*/
@keyframes enter-in-sections {
  0% {
    opacity: 0;
   transform: translate(0, 0);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
}

@keyframes spin-round {
  0% {
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes get-color{
0%{
  filter: grayscale(1);
}
70%{
  filter: grayscale(1);
}

100%{
  filter: grayscale(0);
}



}
</style>
