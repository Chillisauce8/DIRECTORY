<template>
  <!--  <div style="display: contents"> -->
  <nav class="page-nav page-preview-product-none page-preview-post-none" :class="{ 'nav-down': showNavbar }">
    <div class="nav-inner">
  <!--   <template v-if="filterSelectLink">
            <nuxt-link :to="filterSelectLink"
                       :data-link="filterSelectLink">
                       <button-main
            class="black back-to-products-button desktop page-product-show function-view-product-none"
            text="Back to All Products" icon="arrow-left"
          />
            </nuxt-link>
          </template>
        -->
      <div class="icon-list">
        <client-only>
          <template v-for="item in navItems" :key="item.link">
            <nuxt-link
              :to="{ hash: '#' + item.link, query: currentQuery }"
              class="nav-link column Center"
              :class="item.classes"
              :data-link="item.link">
              <LazySvgIcon :svg="item.icon" />
              <div class="icon-text">{{ item.title }}</div>
            </nuxt-link>

          </template>
        </client-only>
        <div v-if="pageCardList?.length"
             class="search-button nav-link column Center page-location-show page-locations-show page-activities-show page-blog-show function-edit-package-show function-new-package-show"
             @click="searchOpen = !searchOpen"
             :class="{ closed: !searchOpen, open: searchOpen }">
          <nuxt-link :to="{ hash: '#search', query: currentQuery}">
            <LazySvgIcon svg="search" />
            <div class="icon-text">Search</div>
          </nuxt-link>
        </div>
      </div>
  
      <filter-select
        v-if="filterSelectTitle"
        class="category-select function-view-product-none function-edit-package-none function-swap-product-none page-product-none"
        @click.native="filterSelectClicked()">
          <template v-if="filterSelectLink">
            <nuxt-link :to="filterSelectLink" :data-link="filterSelectLink">
              {{ filterSelectTitle }}
            </nuxt-link>
          </template>
          <template v-else>
            {{ filterSelectTitle }}
          </template>
      </filter-select>

      <div class="page-nav-buttons user-supplier-hidden">
        <NavButtonWrapper hideNavId="location-enquiry-button">
          <slot name="secondary-buttons" />

          <template v-if="needShowPackageMainButtons">
            <PackageConfirmButton></PackageConfirmButton>
            <PackagePayment></PackagePayment>
          </template>

          <template v-if="needShowSaveButtons">
            <SaveButton></SaveButton>
          </template>

          <template v-if="filterSelectLink">
            <nuxt-link :to="filterSelectLink"
                       :data-link="filterSelectLink">
               <button-main
                class="black back-to-products-button mobile page-product-show function-view-product-none function-new-package-none function-edit-package-none"
                text="Back to All Products" icon="arrow-left"/>
            </nuxt-link>
          </template>

          <button-main
            class="quick-enquiry-button beautiful-green area-my-events-none page-product-none"
            @click.native="getSectionDoHelp()"
          >
           Quick <span v-if="getLocationName()" class="button-location-nav">{{ getLocationName() }}<br/></span> {{ currentSection.getName() }} Enquiry
      
          </button-main>

          <button-main
            v-if="needShowBackToPackageButton"
            class="outline package-back-button function-edit-package-show function-view-product-show function-swap-product-show"
            @click.native="goBackToPackage()" icon="arrow-left">
            Back to My Event
          </button-main>

          <slot name="primary-buttons"></slot>
        </NavButtonWrapper>
      </div>
    </div>
  </nav>
  <PageSearch v-if="pageCardList?.length"
              v-model:searchOpen="searchOpen"
              :page-card-list="pageCardList"/>
</template>

<script lang="ts">
import { useCurrentSection } from "~/services/helpers/current-section.factory";
import { useCurrentEvent } from "~/services/helpers/event/current-event.service.factory";
import { useCurrentUser } from "~/services/helpers/user-common/current-user.factory";
import { useEventPackageBuilder } from "~/services/helpers/package-builder/package-builder.service.factory";
import { usePackageSaver } from "~/services/helpers/package-builder/package-saver.service.factory";
import { useEnquiryFormDialogShowService } from "~/services/dialog/enquiry-form-dialog-show.service";
import { useGlobalElementsTemplateService } from "~/services/helpers/data-templates/global-elements-template.factory";
import { useCurrentUserStore } from "~/store/currentUser";
import { useEventBookedHistoryService } from "~/services/helpers/event/event-booked-history.service.factory";
import { useCurrentEventStore } from "~/store/currentEvent";
import {
  useSavePackageChangesHelperService
} from "~/services/helpers/package-builder/save-package-changes-helper.service.factory";
import { useCurrentSupplier } from "~/services/helpers/supplier-common/current-supplier.factory";
import { useCurrentLocationStore } from '~/store/currentLocation';

export default {
  props: [
    "navItems",
    "hideSectionDoHelp",
    "filterSelectTitle",
    "filterSelectLink",
    "hideFilterSelect",
    "pageCardList",
  ],
  emits: ['filterSelectClick'],
  setup() {
    return {
      currentSection: useCurrentSection(),
      currentEvent: useCurrentEvent(),
      currentUser: useCurrentUser(),
      packageBuilder: useEventPackageBuilder(),
      packageSaver: usePackageSaver(),
      enquiryFormDialogShowService: useEnquiryFormDialogShowService(),
      globalElementsTemplateService: useGlobalElementsTemplateService(),
      currentUserStore: useCurrentUserStore(),
      router: useRouter(),
      eventBookedHistoryService: useEventBookedHistoryService(),
      currentEventStore: useCurrentEventStore(),
      savePackageChangesHelperService: useSavePackageChangesHelperService(),
      currentSupplier: useCurrentSupplier(),
      currentLocationStore: useCurrentLocationStore(),
      route: useRoute(),
    };
  },
  data() {
    return {
      // showCategoriesDialog: false,
      searchOpen: false,
      showLoginDialog: false,
      showNavbar: false,
      lastScrollPosition: 0,
      lastTime: 0,
      timeCheck: 10, // Time delay  Between checking
      savePackageInProgress: false,
      isPackageChanged: this.packageSaver.isPackageChanged(),
      isHistoryBookedMode: this.eventBookedHistoryService.isHistoryBookedMode(),
      beforeCurrentPackageSavedListener: undefined,
      afterCurrentPackageSavedListener: undefined,
      currentPackageDataChangedSubscription: undefined,
      currentEventBookedModeChangedSubscription: undefined,
    };
  },
  computed: {
    currentQuery() {
      return unref(this.router.currentRoute).query;
    },
    isUserLoggedIn() {
      return !!this.currentUserStore.user;
    },
    isUserSupplier() {
      return this.currentUser.isSupplierContact();
    },
    needShowPackageMainButtons() {
      if (!this.isUserLoggedIn || this.savePackageInProgress) {
        return false;
      }

      const currentUrl = unref(this.router.currentRoute).path;

      if (currentUrl !== "/my-events") {
        return false;
      }

      if (this.isHistoryBookedMode) {
        return false;
      }

      if (!this.currentEvent.getCurrentPackage()) {
        return false;
      }

      return !this.isPackageChanged;
    },
    needShowSaveButtons() {
      if (!this.isUserLoggedIn || this.savePackageInProgress) {
        return false;
      }

      const currentUrl = unref(this.router.currentRoute).path;

      if (currentUrl !== "/my-events") {
        return false;
      }

      if (this.isHistoryBookedMode) {
        return false;
      }

      return this.isPackageChanged;
    },
    needShowBackToPackageButton() {
      return !this.savePackageInProgress &&
        (unref(this.router.currentRoute).query['eventId'] || unref(this.router.currentRoute).params['eventId']);
    }
    /*    displayEnquiryButton() {
      if (process.server) {
        return false;
      }

      if (this.hideSectionDoHelp) {
        return false;
      }

      if (this.isUserLoggedIn) {
        return false;
      }

      if (!this.currentSection.get()) {
        return false;
      }

      if (this.currentSection.get() === 'any') {
        return false;
      }

      return this.globalElementsTemplateService.needDisplayEnquiryForm();
    },
    enquiryButtonText() {
      return this.globalElementsTemplateService.getEnquiryButtonTopNavTitle();
    },
  */
  },
  beforeMount() {
    if (!this.beforeCurrentPackageSavedListener) {
      this.beforeCurrentPackageSavedListener = this.packageSaver.beforeCurrentPackageSaved(() => {
        this.savePackageInProgress = true;
      });
    }

    if (!this.afterCurrentPackageSavedListener) {
      this.afterCurrentPackageSavedListener = this.packageSaver.afterCurrentPackageSaved(() => {
        this.savePackageInProgress = false;
      });
    }

    this.currentPackageDataChangedSubscription = this.subscribeCurrentPackageDataChanged();

    this.currentEventBookedModeChangedSubscription = this.subscribeCurrentEventBookedModeChanged();
  },
  mounted() {
    // FUNCTION TO SHOW ACTIVE LINK ON SCROLL
    //  Get all the cards sections
    const cardsContainer = document.querySelectorAll(".anchor");

    const intersectionRatioList = [...cardsContainer].map((i) => ({
      name: i.id,
      intersectionRatio: 0,
    }));

    // Set intersection options
    const pageNavActiveOptions = {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    };

    const pageNavActiveCheck = (entries: IntersectionObserverEntry[]) => {
      // update intersectionRatioList content
      entries.forEach((e) => {
        const name = e?.target?.querySelector(".anchor")?.id;

        if (!name) {
          return;
        }

        const listItem = intersectionRatioList.find((i) => i.name === name);

        listItem.intersectionRatio = e.intersectionRatio;
      });

      // try to find item with highest intersectionRatio value and get its name
      const activeLinkId = intersectionRatioList.sort(
        (i1, i2) => i2.intersectionRatio - i1.intersectionRatio
      )?.[0].name;

      // make link active
      const activeLink = document.querySelector(
        `[data-link="${activeLinkId}"]`
      );

      if (activeLink) {
        activeLink.classList.add("active");
      }

      // mark other links inactive
      const allLinks = document.querySelectorAll(`[data-link]`);

      allLinks.forEach((link) => {
        if (link === activeLink) {
          return;
        }

        link.classList.remove("active");
      });
    };

    const pageNavActiveObserver = new IntersectionObserver(
      pageNavActiveCheck,
      pageNavActiveOptions
    );

    cardsContainer.forEach((container) =>
      pageNavActiveObserver.observe(container.parentElement)
    );

    //FUNCTION TO SHOW TOP NAV ON SCROLL DOWN

    document.addEventListener("scroll", this.onScroll);

    const PageNav = document.querySelector(".page-nav");
    const PageNavOptions = {
      root: null,
      threshold: 0,
      rootMargin: "0px 0px 100%",
    };
  },
  beforeUnmount() {
    document.removeEventListener("scroll", this.onScroll);
  },
  unmounted() {
    if (this.beforeCurrentPackageSavedListener) {
      this.beforeCurrentPackageSavedListener.unsubscribe();
      this.beforeCurrentPackageSavedListener = undefined;
    }

    if (this.afterCurrentPackageSavedListener) {
      this.afterCurrentPackageSavedListener.unsubscribe();
      this.afterCurrentPackageSavedListener = undefined;
    }

    if (this.currentPackageDataChangedSubscription) {
      this.currentPackageDataChangedSubscription.unsubscribe();
      this.currentPackageDataChangedSubscription = undefined;
    }

    if (this.currentEventBookedModeChangedSubscription) {
      this.currentEventBookedModeChangedSubscription();
      this.currentEventBookedModeChangedSubscription = undefined;
    }
  },
  methods: {
    filterSelectClicked(event) {
      this.$emit("filterSelectClick", event);
    },

    onScroll() {
      const now = new Date();
      if (now - this.lastTime >= this.timeCheck) {
        this.lastTime = now;
        // Get the current scroll position
        const currentScrollPosition =
          window.pageYOffset || document.documentElement.scrollTop;
        // Because of momentum scrolling on mobiles, we shouldn't continue if it is less than zero
        if (currentScrollPosition < 0) {
          return;
        }
        // Here we determine whether we need to show or hide the navbar
        // Will execute true if scrolling up.

        // this.showNavbar = currentScrollPosition < this.lastScrollPosition

        const scrollUp = currentScrollPosition < this.lastScrollPosition;

        if (scrollUp) {
          // console.log(scrollUp)
          const pageNav = document.querySelector(".page-nav");

          if (!pageNav) {
            return;
          }

          const coords = pageNav.getBoundingClientRect();
          // console.log(coords.top)

          if (coords.top < 100) {
            this.showNavbar = true;
          } else {
            this.showNavbar = false;
          }
        } else {
          this.showNavbar = false;
        }
        // Set the current scroll position as the last scroll position
        this.lastScrollPosition = currentScrollPosition;
      }
    },

    getLocationName() {
      return this.route.params.location || this.currentLocationStore?.name;
    },

    getSectionDoHelp() {
      this.enquiryFormDialogShowService.show();
    },

    goBackToPackage() {
      let targetUrl;

      const currentUrl = unref(this.router.currentRoute).fullPath;

      if (currentUrl.startsWith('/my-events')) {
        const eventId = this.currentEvent.getId();
        const packageId = this.currentEvent.getCurrentPackageId();
        const section = this.currentEvent.getSection();

        targetUrl = `/my-events?eventId=${eventId}&packageId=${packageId}&section=${section}`;
      } else if (currentUrl.startsWith('/supplier/')) {
        const supplierId = unref(this.router.currentRoute).params['supplierId'] as string;

        targetUrl = this.currentEvent.getCurrentEventSupplierViewPath(supplierId);
      }

      if (this.packageBuilder.has() && this.packageSaver.isPackageChanged()) {
        this.savePackageChangesHelperService.processUnsavedPackage(false)
            .then(result => {
              if (result !== 'cancelled') {
                this.router.push(targetUrl);
              }
            });
      } else {
        this.router.push(targetUrl);
      }
    },

    subscribeCurrentPackageDataChanged() {
      return this.packageSaver.currentPackageChangedUpdated((value) => {
        this.isPackageChanged = value;
      });
    },

    subscribeCurrentEventBookedModeChanged() {
      return this.currentEventStore.$onAction(({name, after}) => {
        if (name !== 'setCurrentEventBookedMode' && name !== 'resetCurrentEventBookedMode') {
          return;
        }

        after(() => {
          this.isHistoryBookedMode = this.eventBookedHistoryService.isHistoryBookedMode();
          this.isPackageChanged = this.packageSaver.isPackageChanged();
        });
      });
    }
  },
};
</script>

<style lang="scss">
body.page-section-home .page-nav { // This is so we don't display it on mobile (as it contains nothing)
  @include mobile{
  display: contents;
  }
}
.page-nav {
  transition: all 0.5s ease-in-out;
  background-color: $CB-05;
  position: sticky;
  top: 0;
  z-index: 2;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: 64px;

  &.nav-down {
      // background-color: transparent;

      @media (max-width: 1279px) {
        top: 60px; // When the button is fixed we cannot use transform
      }
      @media (min-width: 1280px) {
        transform: translateY(60px);
      }
    }
  & .nav-inner {
    display: flex;
    align-items: center;
    overflow-x: scroll;
 /*   .back-to-products-button{
      max-width: 50px;
       overflow-x: hidden;
       .button-text{
          display: none;
        }
        &.desktop{
          margin-left: 10px;
          @include mobile(){
          display: none;
        }
        }
        &.mobile{
        @include desktop(){
         display: none;
        }
        }
      }
*/

    & .nav-link {
      cursor: pointer;
      border-bottom: 2px transparent solid;
      height: 48px;
      margin: 0 5px;
      &:hover,
      &.active {
        //     border-bottom-color: $C1;
        animation: underline 0.25s ease-in-out 0s both;
        //   background-color: $C2;
        & .icon-text {
          animation: flash-text 1s ease-in-out 0.25s both;
        }
        & svg {
          animation: flash-icon 0.75s ease-in-out 0.5s;
          animation-iteration-count: 3;
          //   color: $C1;
        }
      }
    }
    & .page-nav-buttons {
      display: flex;
      justify-content: flex-end;
      flex-grow: 1;
      & .button-location-nav{
        display: none;
      }

    }
    & .icon-list {
      padding: 5px 10px;
      display: flex;
      align-items: center;
      & .icon {
        margin: 0 1em;
        width: 32px;
        height: 32px;
      }
      & .icon-text {
        font-size: 10px;
        text-transform: uppercase;
        white-space: nowrap;
        text-align: center;
      }
    }
  }
}

@keyframes flash-icon {
  0% {
    color: currentColor;
  }

  50% {
    color: $C1;
  }

  100% {
    color: currentColor;
  }
}

@keyframes flash-text {
  0% {
    color: currentColor;
  }
  25% {
    color: $C1;
  }
  75% {
    color: $C1;
  }

  100% {
    color: currentColor;
  }
}

@keyframes underline {
  0% {
    border-bottom-color: currentColor;
  }
  100% {
    border-bottom-color: $C1;
  }
}
</style>
