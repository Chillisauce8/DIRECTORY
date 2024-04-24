<template>
  <!--  <div style="display: contents"> -->
  <nav class="page-nav" :class="{ 'nav-down': showNavbar }">
    <div class="nav-inner">
      <div class="icon-list">
        <div class="page-nav-buttons">
          <ButtonMain />
          <NavButtonWrapper hideNavId="location-enquiry-button">
            <button-main
              class="black back-to-products-button mobile page-product-show function-view-product-none function-new-package-none function-edit-package-none"
              text="Back to All Products"
              icon="arrow-left"
            />
            <slot name="primary-buttons"></slot>
          </NavButtonWrapper>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
export default {
  props: [
    "navItems",
    "filterSelectTitle",
    "filterSelectLink",
    "hideFilterSelect",
    "pageCardList",
  ],
  data() {
    return {
      searchOpen: false,
      showLoginDialog: false,
      showNavbar: false,
      lastScrollPosition: 0,
      lastTime: 0,
      timeCheck: 10, // Time delay  Between checking
    };
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

  methods: {
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
  },
};
</script>

<style lang="scss">
body.page-section-home .page-nav {
  // This is so we don't display it on mobile (as it contains nothing)
  @include mobile {
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
      & .button-location-nav {
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
