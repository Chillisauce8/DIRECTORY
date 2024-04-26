<script setup lang="ts">
/*
const route = useRoute();
const appConfig = useAppConfig();
const { isHelpSlideoverOpen } = useDashboard();
*/
const intersectingOptions = {
  //   root: null,
  threshold: 0.1,
  //  rootMargin: '0px',
};

const intersectingCheck = (animateElements: any[]) => {
  animateElements.forEach((element) => {
    if (element.isIntersecting) {
      element.target.classList.add("INTERSECTING");
      element.target.classList.add("VIEWED");

      // if (element.target.id) {
      //   this.intersectedElementsStore.setIntersected(element.target.id);
      // }
    } else {
      if (element.target.classList.contains("INTERSECTING")) {
        element.target.classList.add("VIEWED");
        element.target.classList.remove("INTERSECTING");

        // if (element.target.id) {
        //   this.intersectedElementsStore.resetIntersected(element.target.id);
        // }
      }
    }
  });
};

let intersectingObserver: IntersectionObserver;

function animateIntersecting() {
  const isPlatformBrowser = typeof window !== "undefined";

  // ANIMATED - Check if Intersecting
  if (isPlatformBrowser) {
    const animateElements = document.querySelectorAll(".ANIMATE:not(.VIEWED)"); // Set intersection

    animateElements.forEach((element) => {
      intersectingObserver.observe(element);
    });
  }
}

function animateIntersectingDelayed(delay: number, repeatTimes: number) {
  animateIntersecting();

  if (!repeatTimes) {
    repeatTimes = 1;
  }

  for (let i = 1; i <= repeatTimes; ++i) {
    setTimeout(() => {
      animateIntersecting();
    }, i * delay);
  }
}

onBeforeMount(() => {
  intersectingObserver = new IntersectionObserver(
    intersectingCheck,
    intersectingOptions
  );

  animateIntersectingDelayed(500, 1);

  // this.pageDataLoadedStore.$onAction(({name, after}) => {
  //   after(() => {
  //     if (name === 'set') {
  //       this.animateIntersectingDelayed(300, 5);
  //     }
  //   });
  // });
});

onBeforeUnmount(() => {
  intersectingObserver.disconnect();
});
</script>

<template>
  <TopNav />
  <div class="main-page">
    <SideNav />
    <main><slot /></main>
  </div>
  <MainFooter />
</template>
<style lang="scss">
.main-page {
  display: flex;
  main {
    background-color: var(--bg-color-2);
  }
}
</style>
